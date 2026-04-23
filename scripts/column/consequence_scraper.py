import feedparser
from typing import List, Dict
from bs4 import BeautifulSoup

from .base_scraper import BaseScraper


class ConsequenceScraper(BaseScraper):
    FEATURES_URL = "https://consequence.net/category/music/music-features/?feed=rss2"
    EDITORIALS_URL = "https://consequence.net/category/music/music-editorials/?feed=rss2"

    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        editorials = self._fetch_feed(self.EDITORIALS_URL, limit, 'Consequence Editorials')
        print(f'Editorials: {len(editorials)}개')
        return editorials

    def _fetch_feed(self, url: str, limit: int, label: str) -> List[Dict]:
        print(f'{label} 피드 수집 중...')
        try:
            feed = feedparser.parse(url)
            if not feed.entries:
                print(f'항목 없음 또는 피드 접근 실패: {url}')
                return []

            print(f'{len(feed.entries)}개 항목 발견')
            results = []
            for entry in feed.entries[:limit]:
                item = self._parse_entry(entry)
                if item:
                    results.append(item)
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
                'source': 'consequence',
                'thumbnail_url': media[0].get('url', '') if media else None,
                'thumbnail_credit': media[0].get('media_copyright', None) if media else None,
                'category': tags[0] if tags else '',
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
            return self._extract_content(soup, container_selector='.entry-content, article')
        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}


if __name__ == "__main__":
    ConsequenceScraper().run(limit=3)
