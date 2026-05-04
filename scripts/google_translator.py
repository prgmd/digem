import os
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiTranslator:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError('API KEY가 환경 변수에 설정되지 않았습니다.')

        genai.configure(api_key=api_key)
        # 2.5-flash: 번역 품질과 속도·비용의 균형점, pro 대비 응답 지연이 적어 배치 처리에 적합
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')

        print('Gemini 초기화 완료')

    def translate_article(self, title: str, content: str) -> dict:
        """기사 제목과 본문을 한국어로 번역해 반환한다. 실패 시 status='failed'로 표기된 dict 반환."""
        # 제목과 본문을 별도 메서드로 분리한 이유: 각각 다른 프롬프트 규칙이 필요하기 때문
        # 실패 시 None을 반환하되 status 필드로 구분 → DB에 실패 기록도 저장 가능 (database_loader 참고)
        print('번역을 시작합니다.')
        try:
            title_ko = self._translate_title(title)
            content_ko = self._translate_content(content)
            return {'title_ko': title_ko, 'content_ko': content_ko, 'status': 'success'}
        except Exception as e:
            print(f'번역 실패: {e}')
            return {'title_ko': None, 'content_ko': None, 'status': 'failed', 'error': str(e)}

    def _translate_title(self, title: str) -> str:
        """기사 제목을 한국어로 번역한다. 아티스트명은 항상 한글(영문) 병기."""
        # 제목은 짧아서 아티스트명을 항상 병기해도 가독성에 무리 없음
        # 본문(_translate_content)과 달리 '첫 언급 시에만' 규칙을 적용하지 않음
        prompt = f'당신은 음악 평론 전문 번역가입니다. 다음 음악 칼럼 제목을 한국어로 번역해주세요. 아티스트명은 원문도 함께 표기 (ex: 테일러 스위프트(Taylor Swift)). 부연 설명 없이 번역된 제목만 출력. 자연스러운 한국어로 번역. 제목: {title}'
        response = self.model.generate_content(prompt)
        return response.text.strip()

    def _split_content(self, content: str, chunk_size: int = 10000) -> list:
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
        """기사 본문을 한국어로 번역한다. 10,000자 초과 시 청크 분할 후 순차 번역."""
        if len(content) > 10000:
            print(f'본문이 {len(content)}자로 길어 분할 번역합니다.')
            chunks = self._split_content(content)
            translated = [self._translate_chunk(chunk) for chunk in chunks]
            return '\n\n'.join(translated)
        return self._translate_chunk(content)

    def _translate_chunk(self, content: str) -> str:
        """본문 청크 하나를 Gemini API로 번역한다."""
        prompt = f'''당신은 음악 평론 전문 번역가입니다. 다음 음악 칼럼 내용을 한국어로 번역해주세요.

규칙:
1. 아티스트명은 첫 언급 시에만 한글(영문) 병기 (ex: 테일러 스위프트(Taylor Swift)), 이후 언급부터는 한글만 사용
2. 앨범명·싱글명·곡명은 번역하지 않고 원문 그대로 표기
3. 아티스트명을 제외하고는 기본적으로 한글 표기만 사용하되, 장르명·음악 용어 등 독자에게 생소할 수 있는 단어에 한해 한글(영문) 병기
3. 자연스러운 한국어로 번역
4. 마크다운 문법 사용 금지 (**, *, #, - 등 절대 사용하지 말 것)
5. 본문과 무관한 내용 제거 (예: "더 보기", 광고 문구, 출처 링크 안내, 뉴스레터 구독 유도 등)
6. 부연 설명 없이 번역된 본문만 출력

내용:
{content}'''
        # 프롬프트 규칙 설계 의도:
        # 규칙 1 — 반복 병기는 가독성을 해치므로 첫 언급 후 한글만 사용
        # 규칙 2 — 앨범·곡명은 고유명사로서 번역하면 검색·식별이 불가능해짐
        # 규칙 4 — 저장 포맷이 plain text이므로 마크다운 기호가 그대로 노출됨
        # 규칙 5 — 웹 스크래핑 특성상 광고·구독 유도 문구가 본문에 섞여 들어옴
        response = self.model.generate_content(prompt)
        return response.text.strip()

def main():
    translator = GeminiTranslator()
    result = translator.translate_article()
