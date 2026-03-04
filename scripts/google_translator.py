import os
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv
import time

# 환경변수 로드
load_dotenv()

# 번역기 클래스
class GeminiTranslator:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError('API KEY가 환경 변수에 설정되지 않았습니다.')

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')

        print('Gemini 초기화 완료')

    def translate_article(self, title: str, content: str, max_retries: int = 3) -> dict:
        print('번역을 시작합니다.')

        for attempt in range(max_retries):
            try:
                title_ko = self._translate_title(title)
                content_ko = self._translate_content(content)
                return {'title_ko': title_ko, 'content_ko': content_ko, 'status': 'success'}
            
            except Exception as e:
                print(f'번역 실패 (시도 {attempt + 1}/{max_retries}): {e}')
                if attempt < max_retries - 1:
                    wait_time = 5 * (2 ** attempt)  # 5초 → 10초 → 20초
                    time.sleep(wait_time)
                else:
                    print('  ❌ 최대 재시도 횟수 초과')
                    return {'title_ko': None, 'content_ko': None, 'status': 'failed', 'error': str(e)}

    def _translate_title(self, title:str) -> str:
        prompt = f'당신은 음악 평론 전문 번역가입니다. 다음 음악 칼럼 제목을 한국어로 번역해주세요. 아티스트명은 원문도 함께 표기 (ex: 테일러 스위프트(Taylor Swift)). 부연 설명 없이 번역된 제목만 출력. 자연스러운 한국어로 번역. 제목: {title}'
        response = self.model.generate_content(prompt)
        return response.text.strip()
    
    def _translate_content(self, content:str) -> str:
        prompt = f'당신은 음악 평론 전문 번역가입니다. 다음 음악 칼럼 내용을 한국어로 번역해주세요. 아티스트명은 원문도 함께 표기 (ex: 테일러 스위프트(Taylor Swift)). 부연 설명 없이 번역된 본문만 출력. 자연스러운 한국어로 번역. 내용: {content}'
        response = self.model.generate_content(prompt)
        return response.text.strip()

def main():
    translator = GeminiTranslator()
    result = translator.translate_article()