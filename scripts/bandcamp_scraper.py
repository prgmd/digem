import feedparser
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from google_translator import GeminiTranslator
from database_loader import SupabaseLoader
import time

class BandcampDailyScraper:
    RSS_URL = "https://daily.bandcamp.com/feed"

    ALLOWED_CATEGORIES = [
        'Lists',
        'Scene Report',
        'Features',
    ]

    def __init__(self):
        # RSS 파싱용 session
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0'})

        # Selenium 드라이버
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option('excludeSwitches', ['enable-automation'])
        self.driver = webdriver.Chrome(service=Service(), options=options)

    def __del__(self):
        try:
            self.driver.quit()
        except:
            pass

    def fetch_articles(self, limit: int = 10) -> List[Dict]:
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
        try:
            thumbnail_url = None
            summary_html = entry.get('summary', '')
            if summary_html:
                soup = BeautifulSoup(summary_html, 'html.parser')
                img = soup.find('img')
                if img:
                    thumbnail_url = img.get('src')

            tags = [t.get('term', '').strip() for t in entry.get('tags', [])]
            category = tags[0] if tags else ''

            return {
                'title': entry.get('title', '').strip(),
                'source_url': entry.get('link', '').strip(),
                'author': entry.get('author', 'Unknown').strip(),
                'published_at': self._parse_date(entry.get('published_parsed')),
                'source': 'bandcamp',
                'category': category,
                'thumbnail_url': thumbnail_url,
            }
        except Exception as e:
            print(f'항목 파싱 오류: {e}')
            return None

    def _parse_date(self, date_tuple) -> str:
        try:
            if date_tuple:
                dt = datetime(*date_tuple[:6])
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        except:
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def fetch_full_content(self, url: str) -> Dict:
        try:
            print('전체 내용을 가져옵니다...')
            self.driver.get(url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.bc-content'))
            )
            time.sleep(1)

            soup = BeautifulSoup(self.driver.page_source, 'html.parser')

            # 썸네일 크레딧
            thumbnail_credit = None
            first_figure = soup.find('figure')
            if first_figure:
                figcaption = first_figure.find('figcaption')
                if figcaption:
                    thumbnail_credit = figcaption.get_text(separator=' ').strip()

            container = soup.select_one('.bc-content')
            paragraphs = container.find_all('p') if container else soup.find_all('p')

            content_paragraphs = []
            for p in paragraphs:
                if p.find_parent('figcaption'):
                    continue
                text = p.get_text().strip()
                if not text:
                    continue
                content_paragraphs.append(text)

            content = '\n\n'.join(content_paragraphs)

            if content and len(content) > 200:
                return {'content': content, 'thumbnail_credit': thumbnail_credit}
            else:
                print('본문을 찾지 못했습니다.')
                return {'content': '', 'thumbnail_credit': None}

        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}


def main():
    print('Bandcamp Daily 크롤링을 시작합니다...')
    scraper = BandcampDailyScraper()
    translator = GeminiTranslator()
    loader = SupabaseLoader()

    try:
        articles = scraper.fetch_articles(limit=5)

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
            fetched = scraper.fetch_full_content(article['source_url'])
            full_content = fetched['content']
            thumbnail_credit = fetched['thumbnail_credit']

            if not full_content:
                print('본문 추출 실패. 스킵하겠습니다.')
                continue

            print(f"\n(전체 {len(full_content)}자)")
            print(f'{article["title"]}')
            print(f"{full_content[:200]}...\n")

            result = translator.translate_article(article['title'], full_content)
            if result['status'] != 'success':
                print('번역 실패. 스킵하겠습니다.')
                continue

            print('번역 완료')
            print(f" [번역된 제목]: {result['title_ko']}")

            article_data = {
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
            }

            success = loader.save_article(article_data)
            if not success:
                print('DB 저장 실패.')

            if i < len(new_articles):
                time.sleep(10)

    finally:
        scraper.driver.quit()


if __name__ == "__main__":
    main()
