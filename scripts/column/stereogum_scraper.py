import feedparser
from typing import List, Dict
from bs4 import BeautifulSoup

from .base_scraper import BaseScraper


class StereogumScraper(BaseScraper):
    RSS_URL = "https://www.stereogum.com/feed/"

    # 뉴스·앨범 스트림은 제외하고 평론·리스트 위주로만 수집
    ALLOWED_CATEGORIES = ['Columns', 'Reviews', 'Lists']

    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        """RSS 피드에서 허용 카테고리 기사를 limit개 수집해 반환한다."""
        print('Stereogum RSS 수집 중...')
        try:
            feed = feedparser.parse(self.RSS_URL)
            print(f'{len(feed.entries)}개 항목 발견')

            results = []
            # 카테고리 필터링 후 limit개를 채우기 위해 limit*3개를 미리 순회
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
        """feedparser entry 객체에서 필요한 필드를 추출해 dict로 반환한다."""
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
                # 허용 카테고리에 해당하는 태그를 우선 선택, 없으면 첫 번째 태그로 폴백
                'category': next((t for t in tags if t in self.ALLOWED_CATEGORIES), tags[0] if tags else ''),
            }
        except Exception as e:
            print(f'항목 파싱 오류: {e}')
            return None

    def fetch_full_content(self, url: str) -> Dict:
        """기사 페이지에서 본문을 추출한다. 저작권 문구가 나오면 수집 중단."""
        try:
            print('전체 내용을 가져옵니다...')
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            return self._extract_content(
                soup,
                container_selector='.entry-content, article',
                # Stereogum 푸터의 저작권 문구를 기준으로 본문 종료 판단
                stop_condition=lambda t: '© Copyright' in t or ('stereogum.com' in t.lower() and 'copyright' in t.lower()),
            )
        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}


if __name__ == "__main__":
    StereogumScraper().run(limit=5)
