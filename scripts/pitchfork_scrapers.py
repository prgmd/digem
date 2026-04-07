import feedparser
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from google_translator import GeminiTranslator
from database_loader import SupabaseLoader
import time

class pitchforkScraper:
    FEATURE_URL = "https://pitchfork.com/feed/feed-features/rss"
    COLUMN_URL = "https://pitchfork.com/feed/feed-the-pitch/rss"

    ALLOWED_CATEGORIES = [
        'Features / Interview',
        'Features / Afterword',
        'Features / Festival Report',
        'Features / Cover Story',
        'Features / Longform',
        'Features / Rising',
        'Features / 5-10-15-20'
    ]

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

    def fetch_features(self, limit: int = 10) -> List[Dict]:
        print('Features 피드 수집 중...')
        return self._fetch_feed(self.FEATURE_URL, limit, filter_categories=True)

    def fetch_columns(self, limit: int = 10) -> List[Dict]:
        print('The Pitch 칼럼 피드 수집 중...')
        return self._fetch_feed(self.COLUMN_URL, limit, filter_categories=False)

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

    # 항목 파싱
    def _parse_entry(self, entry) -> Dict:
        try:
            # 데이터
            data = {
                'title': entry.get('title', '').strip(),
                'source_url': entry.get('link', '').strip(),
                'author': entry.get('author', 'Unknown').strip(),
                'published_at': self._parse_date(entry.get('published_parsed')),
                'summary': entry.get('summary', '').strip(),
                'source': 'pitchfork'
            }

            # 썸네일 (없음 패스)
            if 'media_thumbnail' in entry and entry['media_thumbnail']:
                data['thumbnail_url'] = entry['media_thumbnail'][0].get('url', '')
            else:
                data['thumbnail_url'] = None

            # 카테고리 추출
            if 'tags' in entry and entry['tags']:
                data['category'] = entry['tags'][0].get('term', '')
            else:
                data['category'] = ''

            return data
        except Exception as e:
            print(f'항목 파싱 오류 : {e}')
            return None

    # 날짜 파싱
    def _parse_date(self, date_tuple) -> str:
        try:
            if date_tuple:
                dt = datetime(*date_tuple[:6])
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        except Exception as e:
            print(f'날짜 파싱 오류: {e}')
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 전문 + 썸네일 크레딧 가져오기
    def fetch_full_content(self, url: str) -> Dict:
        try:
            print('전체 내용을 가져옵니다...')
            response = self.session.get(url, timeout = 10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # 썸네일 크레딧: 첫 번째 figure의 figcaption
            thumbnail_credit = None
            first_figure = soup.find('figure')
            if first_figure:
                figcaption = first_figure.find('figcaption')
                if figcaption:
                    thumbnail_credit = figcaption.get_text(separator=' ').strip()

            all_paragraphs = soup.find_all('p')
            content_paragraphs = []
            for p in all_paragraphs:
                text = p.get_text().strip()
                # 사진 제외
                if p.find_parent('figcaption'):
                    continue
                # 마지막 저작권 문구 제외
                if '© 2026 Condé Nast' in text or '© 2025 Condé Nast' in text:
                    break
                content_paragraphs.append(text)
            content = '\n\n'.join(content_paragraphs)

            if content:
                return {'content': content, 'thumbnail_credit': thumbnail_credit}
            else:
                print('본문을 찾지 못했습니다.')
                return {'content': '', 'thumbnail_credit': None}

        except Exception as e:
            print('페이지 가져오기 오류', e)
            return {'content': '', 'thumbnail_credit': None}

def main():
    print('Pitchfork 크롤링을 시작합니다...')
    scraper = pitchforkScraper()
    translator = GeminiTranslator()
    loader = SupabaseLoader()

    features = scraper.fetch_features(limit=3)
    columns = scraper.fetch_columns(limit=3)

    all_articles = features + columns

    if not all_articles:
        print('수집된 항목이 없습니다.')
        return

    print(f'\nRSS에서 총 {len(all_articles)}개 항목 발견 (features: {len(features)}, columns: {len(columns)})')

    print('\n' + '=' * 60)
    print('중복 체크 중...')
    print('=' * 60)
    new_articles = loader.filter_new_articles(all_articles)

    if not new_articles:
        print('이미 모든 항목이 DB에 저장되어 있습니다. 수고!')
        return

    for i, feature in enumerate(new_articles, 1):
        fetched = scraper.fetch_full_content(feature['source_url'])
        full_content = fetched['content']
        thumbnail_credit = fetched['thumbnail_credit']
        if full_content:
            print(f"\n(전체 {len(full_content)}자)")
            print(f'{feature["title"]}')
            print(f"{full_content[:200]}...\n")
            if thumbnail_credit:
                print(f"[썸네일 크레딧]: {thumbnail_credit}")
        else:
            print('본문 추출 실패. 스킵하겠습니다.')
            continue

        # 번역 요청
        result = translator.translate_article(feature['title'], full_content)
        if result['status'] == 'success':
            print('번역 완료')
            print(f" [번역된 제목]: {result['title_ko']}")
            print(f" [번역된 본문]: {result['content_ko'][:500]}...")
        else:
            print('번역 실패. 스킵하겠습니다.')
            continue

        article_data = {
            'title': feature['title'],
            'title_ko': result['title_ko'],
            'content_en': full_content,
            'content_ko': result['content_ko'],
            'source': feature['source'],
            'source_url': feature['source_url'],
            'author': feature['author'],
            'published_at': feature['published_at'],
            'thumbnail_url': feature.get('thumbnail_url'),
            'thumbnail_credit': thumbnail_credit,
        }

        success = loader.save_article(article_data)
        if not success:
            print('DB 저장 실패.')

        # Rate Limit 방지용 코드
        if i < len(new_articles):
            time.sleep(10)

# 호출마다 자동 실행되는 걸 방지함 (직접 실행할 때만 코드 돌리도록)
if __name__ == "__main__":
    main()
