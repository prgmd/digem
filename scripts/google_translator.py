import os
import re
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

MODEL = 'gemini-2.5-flash'
API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'

# thinking(내부 추론)을 끈다.
#
# 2.5-flash는 thinking이 기본 활성이며 출력 예산과 요금을 함께 소모한다.
# 실측: 번역문 대비 1.7~4.9배의 토큰이 thinking에만 쓰이고 있었다(전체의 약 65%).
# 번역 품질 자체는 켜고 끈 차이가 거의 없었고, 차이가 나던 항목
# (중복 병기 정리, 앞뒤 노이즈 제거)은 아래 후처리로 결정론적으로 해결한다.
# 상세: docs/11-prompt-analysis.md
#
# 주의: 중간값(2048·4096)은 오히려 용어 설명(규칙 4b)이 사라진다. 0 아니면 기본값.
THINKING_BUDGET = 0

# SDK 대신 REST를 직접 호출하는 이유:
# google-generativeai 구버전에는 thinking 설정 자체가 없고, 버전별 호환 문제가 보고되어 있다.
# REST는 요청 형식이 고정되어 있어 SDK 버전에 영향받지 않는다.

REQUEST_TIMEOUT = 300

# 실패 사유는 DB 컬럼에 한 줄로 저장되므로 길이를 제한한다.
MAX_ERROR_LEN = 500


class TranslationError(Exception):
    """번역 실패 사유를 사람이 읽을 수 있는 한 줄로 담는 예외.

    requests·KeyError 등 원본 예외를 그대로 흘리면 "KeyError: 'parts'" 같은
    해석 불가능한 문자열이 DB에 남는다. 실패 지점을 이 예외로 정규화한다.
    """


# API 키는 요청 URL의 쿼리스트링에 실리므로 requests 예외 메시지에 그대로 들어온다.
# 사유가 DB와 실행 로그에 남는 이상 반드시 가려야 한다.
_SECRET = re.compile(r'(key=|AIza)[\w\-]+')


def _redact(text: str) -> str:
    return _SECRET.sub(lambda m: m.group(1) + '***', text)


def _api_error_message(response) -> str:
    """Gemini 오류 응답에서 status/message를 뽑는다. 형식이 다르면 본문 앞부분으로 대체."""
    try:
        err = response.json().get('error') or {}
        detail = f"{err.get('status', '')} {err.get('message', '')}".strip()
    except ValueError:
        detail = response.text[:200]
    return _redact(detail) or response.reason


def _failure(stage: str, exc: Exception) -> dict:
    """실패 결과 dict를 만든다. 사유는 '단계: 유형: 상세' 한 줄로 정규화한다."""
    detail = str(exc) if isinstance(exc, TranslationError) else f'{type(exc).__name__}: {_redact(str(exc))}'
    reason = f'{stage}: {detail}'[:MAX_ERROR_LEN]
    print(f'번역 실패 — {reason}')
    return {'title_ko': None, 'content_ko': None, 'status': 'failed', 'error': reason}


# ==================== 번역 후처리 ====================
# AI를 쓰지 않는 결정론적 정리. 프롬프트만으로는 100% 보장되지 않는 두 가지를 처리한다.
#   1) 중복 병기 — "첫 언급 시에만 병기"(규칙 1). 문자열 대조라 규칙으로 확실히 해결된다.
#   2) 앞뒤 노이즈 — 매체 템플릿에서 나오는 타임스탬프·예고 문구(규칙 7).
# 실측: 11건 적용 시 중복 병기 5개 → 0개, 노이즈 7줄 제거, 본문 손실 0.

_ANNOT = re.compile(r'`([^`]+)`')


def dedupe_annotations(text: str) -> str:
    """같은 항목의 2번째 이후 병기를 제거한다.

    병기 형식이 `한글`English`` 구조라 백틱 부분만 지우면 앞의 한글이 그대로 남는다.
    규칙 1(첫 언급 시에만 병기)이 원하는 결과와 정확히 일치한다.
    """
    best = {}
    for h in _ANNOT.findall(text):
        k = h.split(';')[0].strip()
        # 같은 항목이 4a/4b 두 형태로 나오면 설명(;)이 있는 쪽을 남긴다
        if k not in best or (';' in h and ';' not in best[k]):
            best[k] = h
    seen = set()

    def repl(m):
        k = m.group(1).split(';')[0].strip()
        if k in seen:
            return ''
        seen.add(k)
        return '`' + best[k] + '`'

    return _ANNOT.sub(repl, text)


# 노이즈는 본문 앞뒤에만 붙는다는 관찰에 근거해 위치를 제한한다.
# 중간 문단은 건드리지 않는다 — 오탐 시 본문이 잘리기 때문.
_HEAD_SCAN, _TAIL_SCAN = 3, 4

_HEAD_NOISE = [
    # stereogum 기사 상단 타임스탬프 (표본 3/3에서 동일 형식으로 등장)
    r'^\d{4}년\s*\d{1,2}월\s*\d{1,2}일.*(표준시|오전|오후)',
    r'^(사진|이미지|글)\s*[:：]',
]
_TAIL_NOISE = [
    # stereogum 하단 다음 코너 예고 (표본 3/3)
    r'이번 주.{0,10}가장 중요한 음악.*밈',
    # pitchfork 하단 (프론트엔드도 별도 필터링 중)
    r'더 보기\s*$',
    r'(구독|뉴스레터|newsletter|subscribe)',
    r'(이 책을|책을 사|구매하실|주문하실)',
]

# 콜론으로 끝나고 뒤에 내용이 없는 짧은 줄 = 잘린 소제목
# (예: "이번 주 주목할 만한 다른 앨범들:", "제가 듣고 있는 것:")
# 콜론 뒤에 실제 내용이 있으면 본문으로 보고 남긴다.
_DANGLING_HEADER = re.compile(r'^.{0,40}[:：]\s*$')


def _strip_edge(lines, patterns, from_end=False):
    idx = range(len(lines) - 1, -1, -1) if from_end else range(len(lines))
    scan = _TAIL_SCAN if from_end else _HEAD_SCAN
    drop, checked = set(), 0
    for i in idx:
        if not lines[i].strip():
            continue
        checked += 1
        if checked > scan:
            break
        if any(re.search(p, lines[i]) for p in patterns):
            drop.add(i)
        elif from_end and _DANGLING_HEADER.match(lines[i].strip()):
            drop.add(i)
    return drop


def strip_noise(text: str) -> str:
    """본문 앞뒤의 메타데이터·홍보 문구를 제거한다."""
    lines = text.split('\n')
    drop = _strip_edge(lines, _HEAD_NOISE) | _strip_edge(lines, _TAIL_NOISE, from_end=True)
    kept = [l for i, l in enumerate(lines) if i not in drop]
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(kept)).strip()


# 목록 기호는 프론트에 대응 렌더링이 없어 화면에 '* ' 가 그대로 노출된다(규칙 6 위반).
#
# 단, '### ' 는 제거하지 않는다 — ArticleDetail.tsx 가 이를 .content-h3 소제목으로
# 렌더링하므로 마크다운 잔재가 아니라 이 프로젝트가 의도적으로 쓰는 마크업이다.
#
# \s 대신 [ \t] 를 쓰는 이유: \s 는 개행까지 먹어 앞 줄과 합쳐진다.
_MD_BULLET = re.compile(r'^[ \t]{0,3}[*-][ \t]+', re.M)


def strip_list_markers(text: str) -> str:
    return _MD_BULLET.sub('', text)


def postprocess(text: str) -> str:
    return strip_list_markers(dedupe_annotations(strip_noise(text)))


class GeminiTranslator:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError('API KEY가 환경 변수에 설정되지 않았습니다.')

        self.api_key = api_key
        self.session = requests.Session()

        print('Gemini 초기화 완료')

    def _generate(self, prompt: str) -> str:
        """Gemini에 프롬프트를 보내고 응답 텍스트를 반환한다.

        모든 실패 경로를 TranslationError로 좁혀 사유를 분류 가능한 형태로 만든다.
        분류를 나눠둔 이유는 대응 방법이 서로 다르기 때문이다 —
        http_429는 재실행하면 되고, prompt_blocked는 그 기사를 포기해야 한다.
        """
        body = {
            'contents': [{'parts': [{'text': prompt}]}],
            'generationConfig': {'thinkingConfig': {'thinkingBudget': THINKING_BUDGET}},
        }
        try:
            response = self.session.post(
                API_URL, params={'key': self.api_key}, json=body, timeout=REQUEST_TIMEOUT
            )
        except requests.Timeout:
            raise TranslationError(f'timeout: {REQUEST_TIMEOUT}초 내 응답 없음')
        except requests.RequestException as e:
            raise TranslationError(f'network: {_redact(str(e))}')

        if response.status_code != 200:
            raise TranslationError(f'http_{response.status_code}: {_api_error_message(response)}')

        try:
            payload = response.json()
        except ValueError:
            raise TranslationError('bad_response: JSON 파싱 실패')

        # 프롬프트 자체가 차단되면 candidates가 아예 오지 않는다.
        blocked = (payload.get('promptFeedback') or {}).get('blockReason')
        if blocked:
            raise TranslationError(f'prompt_blocked: {blocked}')

        candidates = payload.get('candidates') or []
        if not candidates:
            raise TranslationError('empty_response: candidates 없음')

        candidate = candidates[0]
        reason = candidate.get('finishReason', 'STOP')
        parts = (candidate.get('content') or {}).get('parts') or []
        if not parts:
            # SAFETY·RECITATION 등으로 본문 없이 종료된 경우
            raise TranslationError(f'no_content: finishReason={reason}')

        text = ''.join(p.get('text', '') for p in parts)
        # 아래 둘 다 부분 응답이지만 원인이 정반대라 이름을 나눈다.
        # 부분 응답을 성공으로 저장하면 본문이 중간에서 끊긴 채 사이트에 노출된다.
        if reason == 'MAX_TOKENS':
            # 길이 문제. 실측상 최장 기사도 출력 한도의 14%만 쓰므로 나오지 않아야 정상이다.
            # 찍힌다면 chunk_size 전제가 깨졌다는 신호다.
            raise TranslationError(f'truncated: 출력 한도 초과 ({len(text)}자까지 생성)')
        if reason != 'STOP':
            # 길이와 무관한 중단. RECITATION(학습 데이터 재현 차단)이 대표적이며,
            # 가사 인용이 잦은 음악 평론에서는 실제로 나올 수 있다. 청크를 줄여도 해결되지 않는다.
            raise TranslationError(f'incomplete: finishReason={reason} ({len(text)}자까지 생성)')
        return text

    def translate_article(self, title: str, content: str) -> dict:
        """기사 제목과 본문을 한국어로 번역해 반환한다.

        실패해도 예외를 올리지 않고 status='failed' + error(사유)를 담아 반환한다.
        호출부가 이 사유를 기사와 함께 DB에 저장하므로, 재수집 없이 나중에
        원인별로 집계할 수 있다 (base_scraper.run / database_loader.save_article 참고).
        """
        # 제목과 본문을 별도 메서드로 분리한 이유: 각각 다른 프롬프트 규칙이 필요하기 때문
        # 사유에 단계를 붙이는 것도 같은 맥락 — 둘은 프롬프트도 길이도 달라 실패 양상이 다르다
        print('번역을 시작합니다.')
        try:
            title_ko = self._translate_title(title)
        except Exception as e:
            return _failure('title', e)

        try:
            content_ko = self._translate_content(content)
        except Exception as e:
            return _failure('content', e)

        return {'title_ko': title_ko, 'content_ko': content_ko, 'status': 'success', 'error': None}

    def _translate_title(self, title: str) -> str:
        """기사 제목을 한국어로 번역한다. 아티스트명은 항상 한글(영문) 병기."""
        # 제목은 짧아서 아티스트명을 항상 병기해도 가독성에 무리 없음
        # 본문(_translate_content)과 달리 '첫 언급 시에만' 규칙을 적용하지 않음
        prompt = f'당신은 음악 평론 전문 번역가입니다. 다음 음악 칼럼 제목을 한국어로 번역해주세요. 아티스트명은 한글 뒤에 백틱으로 영문 병기 (ex: 테일러 스위프트`Taylor Swift`). 부연 설명 없이 번역된 제목만 출력. 자연스러운 한국어로 번역. 제목: {title}'
        return self._generate(prompt).strip()

    def _split_content(self, content: str, chunk_size: int = 40000) -> list:
        """10,000자 초과 본문을 \n\n 경계 기준으로 청크 리스트로 분할한다."""
        chunks = []
        while len(content) > chunk_size:
            split_pos = content.rfind('\n\n', 0, chunk_size)
            if split_pos == -1:
                # \n\n이 없으면 chunk_size 위치에서 강제 분할
                split_pos = chunk_size
            chunks.append(content[:split_pos].strip())
            content = content[split_pos:].strip()
        if content:
            chunks.append(content)
        return chunks

    def _translate_content(self, content: str) -> str:
        """기사 본문을 한국어로 번역한다. 40,000자 초과 시 청크 분할 후 순차 번역.

        임계값 근거: 최장 기사(원문 27,840자)를 단일 호출로 번역해도 출력 예산의 38%만
        사용했다(실측). 40,000자여도 약 58%로 여유가 있다. 기존 10,000자는 근거 없이
        보수적이어서 전체의 42%가 불필요하게 분할되고 있었고, 청크 경계마다
        "첫 언급 시에만 병기" 규칙이 초기화되어 장문에서 위반율이 100%였다.
        """
        if len(content) > 40000:
            print(f'본문이 {len(content)}자로 길어 분할 번역합니다.')
            chunks = self._split_content(content)
            translated = [self._translate_chunk(chunk) for chunk in chunks]
            return '\n\n'.join(translated)
        return self._translate_chunk(content)

    def _translate_chunk(self, content: str) -> str:
        """본문 청크 하나를 Gemini API로 번역한다."""
        prompt = f'''당신은 음악 평론 전문 번역가입니다. 다음 음악 칼럼 내용을 한국어로 번역해주세요.

규칙:
1. 아티스트명은 첫 언급 시에만 한글 뒤에 백틱으로 영문 병기 (ex: 테일러 스위프트`Taylor Swift`), 이후 언급부터는 한글만 사용
2. 앨범명·EP명·곡명·싱글명은 번역하지 않고 원문 그대로 표기
   — 가사 인용 및 직접 인용문은 쌍따옴표로 표기 (ex: "I'm the moment")
3. 영문 병기는 기본적으로 하지 않는다. 한국어 표기만으로는 의미를 전혀 추론할 수 없는 극히 전문적인 용어일 때만 예외적으로 허용
   — 힙합·팝·록·재즈·R&B·소울·인디·코러스·비트·훅·루프·보컬 등 이미 한국어로 정착된 단어는 병기 금지
4. 병기가 꼭 필요한 경우 영문 부분을 백틱(`)으로 감쌀 것:
   a) 영어 표기만으로 충분한 경우: 한글`English` — ex: 폴리리듬`Polyrhythm`
   b) 추가 설명이 필요한 경우: 한글`English; 한글 설명` — ex: 폴리리듬`Polyrhythm; 둘 이상의 리듬이 동시에 진행되는 기법`
5. 자연스러운 한국어로 번역
6. 마크다운 문법 사용 금지 (**, *, #, - 등 절대 사용하지 말 것)
7. 본문과 무관한 내용 제거 (예: "더 보기", 광고 문구, 출처 링크 안내, 뉴스레터 구독 유도 등)
8. 부연 설명 없이 번역된 본문만 출력

내용:
{content}'''
        # 프롬프트 규칙 설계 의도:
        # 규칙 1 — 반복 병기는 가독성을 해치므로 첫 언급 후 한글만 사용
        # 규칙 2 — 앨범·곡명은 고유명사로서 번역하면 검색·식별이 불가능해짐
        # 규칙 4 — 백틱 방식: 괄호는 곡명·연도·feat. 등 다른 용도와 충돌하므로 백틱으로 대체
        # 규칙 6 — 저장 포맷이 plain text이므로 마크다운 기호가 그대로 노출됨
        # 규칙 7 — 웹 스크래핑 특성상 광고·구독 유도 문구가 본문에 섞여 들어옴
        return self._generate(prompt).strip()

def main():
    translator = GeminiTranslator()
    result = translator.translate_article()
