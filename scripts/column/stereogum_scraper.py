import feedparser
from typing import List, Dict
from bs4 import BeautifulSoup

from .base_scraper import BaseScraper


class StereogumScraper(BaseScraper):
    RSS_URL = "https://www.stereogum.com/feed/"

    ALLOWED_CATEGORIES = ['Columns', 'Reviews', 'Lists']

    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        print('Stereogum RSS 수집 중...')
        try:
            feed = feedparser.parse(self.RSS_URL)
            print(f'{len(feed.entries)}개 항목 발견')

            results = []
            for entry in feed.entries[:limit * 3]:
                item = self._parse_entry(entry)
                if not item:
                    continue
                tags = [t.get('term', '').strip() for t in entry.get('tags', [])]
                if not any(t in self.ALLOWED_CATEGORIES for t in tags):
                    print(f"제외됨 ({tags}): {item['title'][:50]}...")
                    continue
                results.append(item)
                if len(results) >= limit:
                    break

            print(f'{len(results)}개 수집 완료')
            return results

        except Exception as e:
            print(f'RSS 파싱 오류: {e}')
            return []

    def _parse_entry(self, entry) -> Dict:
        try:
            media = entry.get('media_content', [])
            tags = [t.get('term', '').strip() for t in entry.get('tags', [])]
            return {
                'title': entry.get('title', '').strip(),
                'source_url': entry.get('link', '').strip(),
                'author': entry.get('author', 'Unknown').strip(),
                'published_at': self._parse_date(entry.get('published_parsed')),
                'summary': entry.get('summary', '').strip(),
                'source': 'stereogum',
                'thumbnail_url': media[0].get('url', '') if media else None,
                'category': next((t for t in tags if t in self.ALLOWED_CATEGORIES), tags[0] if tags else ''),
            }
        except Exception as e:
            print(f'항목 파싱 오류: {e}')
            return None

    def fetch_full_content(self, url: str) -> Dict:
        try:
            print('전체 내용을 가져옵니다...')
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            return self._extract_content(
                soup,
                container_selector='.entry-content, article',
                stop_condition=lambda t: '© Copyright' in t or ('stereogum.com' in t.lower() and 'copyright' in t.lower()),
            )
        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}


if __name__ == "__main__":
    StereogumScraper().run(limit=5)
