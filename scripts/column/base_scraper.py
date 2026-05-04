from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict
import requests
import time

from ..google_translator import GeminiTranslator
from ..database_loader import SupabaseLoader


class BaseScraper(ABC):
    def __init__(self):
        # Session을 재사용해 TCP 연결을 유지함으로써 요청마다 handshake 비용을 줄임
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    @abstractmethod
    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        """RSS 피드에서 기사 메타데이터 목록을 수집해 반환한다."""
        pass

    @abstractmethod
    def fetch_full_content(self, url: str) -> Dict:
        """기사 URL에 접속해 본문과 썸네일 크레딧을 추출해 반환한다."""
        pass

    def _parse_date(self, date_tuple) -> str:
        """feedparser의 time.struct_time 튜플을 'YYYY-MM-DD HH:MM:SS' 문자열로 변환한다."""
        try:
            if date_tuple:
                dt = datetime(*date_tuple[:6])
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        except Exception as e:
            print(f'날짜 파싱 오류: {e}')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def _extract_content(self, soup, container_selector=None, stop_condition=None) -> Dict:
        """공통 본문 추출 헬퍼. 썸네일 크레딧 + 단락 파싱을 처리한다."""
        thumbnail_credit = None
        first_figure = soup.find('figure')
        if first_figure:
            figcaption = first_figure.find('figcaption')
            if figcaption:
                thumbnail_credit = figcaption.get_text(separator=' ').strip()

        if container_selector:
            container = soup.select_one(container_selector)
            paragraphs = container.find_all('p') if container else soup.find_all('p')
        else:
            paragraphs = soup.find_all('p')

        content_paragraphs = []
        for p in paragraphs:
            if p.find_parent('figcaption'):
                continue
            text = p.get_text().strip()
            if not text:
                continue
            if stop_condition and stop_condition(text):
                break
            content_paragraphs.append(text)

        return {
            'content': '\n\n'.join(content_paragraphs),
            'thumbnail_credit': thumbnail_credit,
        }

    def run(self, limit: int = 5):
        """스크래핑 전체 파이프라인 실행: 목록 수집 → 중복 제거 → 본문 수집 → 번역 → DB 저장."""
        print(f'{self.__class__.__name__} 크롤링을 시작합니다...')
        translator = GeminiTranslator()
        loader = SupabaseLoader()

        articles = self.fetch_articles(limit=limit)
        if not articles:
            print('수집된 항목이 없습니다.')
            return

        print(f'\nRSS에서 총 {len(articles)}개 항목 발견')
        print('\n' + '=' * 60)
        print('중복 체크 중...')
        print('=' * 60)
        new_articles = loader.filter_new_articles(articles)

        if not new_articles:
            print('이미 모든 항목이 DB에 저장되어 있습니다.')
            return

        for i, article in enumerate(new_articles, 1):
            fetched = self.fetch_full_content(article['source_url'])
            full_content = fetched['content']
            thumbnail_credit = article.get('thumbnail_credit') or fetched['thumbnail_credit']

            if not full_content:
                print('본문 추출 실패. 스킵하겠습니다.')
                continue

            print(f"\n(전체 {len(full_content)}자)")
            print(f'{article["title"]}')
            print(f"{full_content[:200]}...\n")
            if thumbnail_credit:
                print(f"[썸네일 크레딧]: {thumbnail_credit}")

            result = translator.translate_article(article['title'], full_content)
            if result['status'] != 'success':
                print('번역 실패. 영문 상태로 DB에 저장합니다.')
                loader.save_article({
                    'title': article['title'],
                    'title_ko': None,
                    'content_en': full_content,
                    'content_ko': None,
                    'source': article['source'],
                    'source_url': article['source_url'],
                    'author': article['author'],
                    'published_at': article['published_at'],
                    'thumbnail_url': article.get('thumbnail_url'),
                    'thumbnail_credit': thumbnail_credit,
                    'translation_status': 'failed',
                })
            else:
                print('번역 완료')
                print(f" [번역된 제목]: {result['title_ko']}")
                success = loader.save_article({
                    'title': article['title'],
                    'title_ko': result['title_ko'],
                    'content_en': full_content,
                    'content_ko': result['content_ko'],
                    'source': article['source'],
                    'source_url': article['source_url'],
                    'author': article['author'],
                    'published_at': article['published_at'],
                    'thumbnail_url': article.get('thumbnail_url'),
                    'thumbnail_credit': thumbnail_credit,
                })
                if not success:
                    print('DB 저장 실패.')

            if i < len(new_articles):
                # 짧은 간격으로 반복 요청 시 IP 차단 위험이 있어 기사 간 10초 대기
                time.sleep(10)
