import feedparser
from typing import List, Dict
from bs4 import BeautifulSoup

from .base_scraper import BaseScraper


class PitchforkScraper(BaseScraper):
    FEATURE_URL = "https://pitchfork.com/feed/feed-features/rss"
    COLUMN_URL = "https://pitchfork.com/feed/feed-the-pitch/rss"

    ALLOWED_CATEGORIES = [
        'Features / Interview',
        'Features / Afterword',
        'Features / Festival Report',
        'Features / Cover Story',
        'Features / Longform',
        'Features / Rising',
        'Features / 5-10-15-20',
        'Features / Lists & Guides',
        'Features'
    ]

    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        features = self._fetch_feed(self.FEATURE_URL, limit, filter_categories=True)
        columns = self._fetch_feed(self.COLUMN_URL, limit, filter_categories=False)
        print(f'Features: {len(features)}개, Columns: {len(columns)}개')
        return features + columns

    def _fetch_feed(self, url: str, limit: int, filter_categories: bool) -> List[Dict]:
        try:
            feed = feedparser.parse(url)
            print(f'{len(feed.entries)}개 항목 발견')

            results = []
            for entry in feed.entries[:limit]:
                item = self._parse_entry(entry)
                if not item:
                    continue
                if filter_categories:
                    category = item.get('category', '').lower()
                    if category and category not in [c.lower() for c in self.ALLOWED_CATEGORIES]:
                        print(f"제외됨 ({category}): {item['title'][:50]}...")
                        continue
                results.append(item)

            print(f'{len(results)}개 수집 완료')
            return results

        except Exception as e:
            print(f'RSS 파싱 오류: {e}')
            return []

    def _parse_entry(self, entry) -> Dict:
        try:
            data = {
                'title': entry.get('title', '').strip(),
                'source_url': entry.get('link', '').strip(),
                'author': entry.get('author', 'Unknown').strip(),
                'published_at': self._parse_date(entry.get('published_parsed')),
                'summary': entry.get('summary', '').strip(),
                'source': 'pitchfork',
            }

            if 'media_thumbnail' in entry and entry['media_thumbnail']:
                data['thumbnail_url'] = entry['media_thumbnail'][0].get('url', '')
            else:
                data['thumbnail_url'] = None

            data['category'] = entry['tags'][0].get('term', '') if entry.get('tags') else ''

            return data
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
                stop_condition=lambda t: 'Condé Nast' in t,
            )
        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}


if __name__ == "__main__":
    PitchforkScraper().run(limit=3)
