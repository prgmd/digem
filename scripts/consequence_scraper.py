import feedparser
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from google_translator import GeminiTranslator
from database_loader import SupabaseLoader
import time

class ConsequenceScraper:
    FEATURES_URL = "https://consequence.net/category/music/music-features/?feed=rss2"
    EDITORIALS_URL = "https://consequence.net/category/music/music-editorials/?feed=rss2"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

    def fetch_features(self, limit: int = 10) -> List[Dict]:
        print('Consequence Features 피드 수집 중...')
        return self._fetch_feed(self.FEATURES_URL, limit)

    def fetch_editorials(self, limit: int = 10) -> List[Dict]:
        print('Consequence Editorials 피드 수집 중...')
        return self._fetch_feed(self.EDITORIALS_URL, limit)

    def _fetch_feed(self, url: str, limit: int) -> List[Dict]:
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
            data = {
                'title': entry.get('title', '').strip(),
                'source_url': entry.get('link', '').strip(),
                'author': entry.get('author', 'Unknown').strip(),
                'published_at': self._parse_date(entry.get('published_parsed')),
                'summary': entry.get('summary', '').strip(),
                'source': 'consequence',
            }

            # 썸네일: media:content
            media = entry.get('media_content', [])
            if media:
                data['thumbnail_url'] = media[0].get('url', '')
            else:
                data['thumbnail_url'] = None

            # 카테고리
            tags = [t.get('term', '').strip() for t in entry.get('tags', [])]
            data['category'] = tags[0] if tags else ''

            return data
        except Exception as e:
            print(f'항목 파싱 오류: {e}')
            return None

    def _parse_date(self, date_tuple) -> str:
        try:
            if date_tuple:
                dt = datetime(*date_tuple[:6])
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        except Exception as e:
            print(f'날짜 파싱 오류: {e}')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def fetch_full_content(self, url: str) -> Dict:
        try:
            print('전체 내용을 가져옵니다...')
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # 썸네일 크레딧
            thumbnail_credit = None
            first_figure = soup.find('figure')
            if first_figure:
                figcaption = first_figure.find('figcaption')
                if figcaption:
                    thumbnail_credit = figcaption.get_text(separator=' ').strip()

            # 본문: WordPress entry-content 우선, 없으면 article, 없으면 전체 p
            container = soup.select_one('.entry-content') or soup.select_one('article')
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

            if content:
                return {'content': content, 'thumbnail_credit': thumbnail_credit}
            else:
                print('본문을 찾지 못했습니다.')
                return {'content': '', 'thumbnail_credit': None}

        except Exception as e:
            print(f'페이지 가져오기 오류: {e}')
            return {'content': '', 'thumbnail_credit': None}


def main():
    print('Consequence 크롤링을 시작합니다...')
    scraper = ConsequenceScraper()
    translator = GeminiTranslator()
    loader = SupabaseLoader()

    features = scraper.fetch_features(limit=3)
    editorials = scraper.fetch_editorials(limit=3)
    all_articles = features + editorials

    if not all_articles:
        print('수집된 항목이 없습니다.')
        return

    print(f'\n총 {len(all_articles)}개 항목 (features: {len(features)}, editorials: {len(editorials)})')

    print('\n' + '=' * 60)
    print('중복 체크 중...')
    print('=' * 60)
    new_articles = loader.filter_new_articles(all_articles)

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


if __name__ == "__main__":
    main()
