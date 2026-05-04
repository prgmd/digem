import feedparser
from typing import List, Dict
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

from .base_scraper import BaseScraper


class BandcampDailyScraper(BaseScraper):
    RSS_URL = "https://daily.bandcamp.com/feed"

    # 개별 앨범 추천 포스트는 제외하고 큐레이션·피처 위주로만 수집
    ALLOWED_CATEGORIES = ['Lists', 'Scene Report', 'Features']

    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        """RSS 피드에서 허용 카테고리 기사를 limit개 수집해 반환한다."""
        print('Bandcamp Daily RSS 수집 중...')
        try:
            feed = feedparser.parse(self.RSS_URL)
            print(f'{len(feed.entries)}개 항목 발견')

            results = []
            for entry in feed.entries:
                item = self._parse_entry(entry)
                if not item:
                    continue
                if item.get('category') not in self.ALLOWED_CATEGORIES:
                    print(f"제외됨 ({item.get('category')}): {item['title'][:50]}...")
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
            thumbnail_url = None
            summary_html = entry.get('summary', '')
            if summary_html:
                # Bandcamp RSS는 썸네일 URL을 summary HTML 안의 img 태그로 제공
                soup = BeautifulSoup(summary_html, 'html.parser')
                img = soup.find('img')
                if img:
                    thumbnail_url = img.get('src')

            tags = [t.get('term', '').strip() for t in entry.get('tags', [])]
            return {
                'title': entry.get('title', '').strip(),
                'source_url': entry.get('link', '').strip(),
                'author': entry.get('author', 'Unknown').strip(),
                'published_at': self._parse_date(entry.get('published_parsed')),
                'source': 'bandcamp',
                'category': tags[0] if tags else '',
                'thumbnail_url': thumbnail_url,
            }
        except Exception as e:
            print(f'항목 파싱 오류: {e}')
            return None

    def _get_driver(self):
        """Selenium ChromeDriver를 반환한다. 처음 호출 시에만 초기화(lazy init)."""
        if not hasattr(self, '_driver'):
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            # Bandcamp는 자동화 탐지를 사용하므로 automation 플래그를 숨김
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option('excludeSwitches', ['enable-automation'])
            self._driver = webdriver.Chrome(service=Service(), options=options)
        return self._driver

    def fetch_full_content(self, url: str) -> Dict:
        """Selenium으로 Bandcamp 기사 페이지를 렌더링해 본문을 추출한다."""
        try:
            print('전체 내용을 가져옵니다...')
            driver = self._get_driver()
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.bc-content'))
            )
            # JS 렌더링 완료 후 동적 요소가 안착할 때까지 대기
            time.sleep(1)

            soup = BeautifulSoup(driver.page_source, 'html.parser')
            result = self._extract_content(soup, container_selector='.bc-content')

            if result['content'] and len(result['content']) > 200:
                return result
            print('본문을 찾지 못했습니다.')
            return {'content': '', 'thumbnail_credit': None}

        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}

    def run(self, limit: int = 5):
        """파이프라인 실행 후 Selenium 드라이버를 반드시 종료한다."""
        try:
            super().run(limit=limit)
        finally:
            # 예외 발생 여부와 무관하게 브라우저 프로세스를 정리
            if hasattr(self, '_driver'):
                self._driver.quit()


if __name__ == "__main__":
    BandcampDailyScraper().run(limit=5)
