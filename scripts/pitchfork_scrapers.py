import feedparser
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from google_translator import GeminiTranslator
from database_loader import SupabaseLoader
import time

class pitchforkScraper:
    RSS_URL = "https://pitchfork.com/feed/feed-features/rss"

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
    
    # 최근 기사 불러오기
    def fetch_latest_reviews(self, limit: int = 10) -> List[Dict]:
        try:
            feed = feedparser.parse(self.RSS_URL)
            print(f'{len(feed.entries)}개 항목 발견')

            features = []
            for entry in feed.entries[:limit]:
                feature_data = self._parse_entry(entry)
                if feature_data:
                    category = feature_data.get('category', '').lower()
                    if category and category not in [c.lower() for c in self.ALLOWED_CATEGORIES]:
                        print(f"제외됨 ({category}): {feature_data['title'][:50]}...")
                        continue

                    features.append(feature_data)
            
            print(f'{len(features)}개 수집 완료')
            return features

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

            # 카테고리 추출 (신규)
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
    
    # 전문 가져오기
    def fetch_full_content(self, url: str) -> str:
        try:
            print('전체 내용을 가져옵니다...')
            response = self.session.get(url, timeout = 10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

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
                return content
            else:
                print('본문을 찾지 못했습니다.')
                return ''
            
        except Exception as e:
            print('페이지 가져오기 오류', e)
            return ''

def main():
    print('Pitchfork 크롤링을 시작합니다...')
    scraper = pitchforkScraper()
    translator = GeminiTranslator()
    loader = SupabaseLoader()

    features = scraper.fetch_latest_reviews(limit = 3)

    # RSS 피드 가져오기
    if not features:
        print('컬럼이 없습니다.')
        return

    print(f'\n📋 RSS에서 {len(features)}개 칼럼 발견')

    # 중복 제거
    print('\n' + '=' * 60)
    print('🔍 중복 체크 중...')
    print('=' * 60)
    new_features = loader.filter_new_articles(features)

    # 중복 제거
    new_features = loader.filter_new_articles(features)
    if not new_features:
        print('이미 모든 칼럼이 DB에 저장되어 있습니다. 수고!')
        return

    for i, feature in enumerate(new_features, 1):    
        full_content = scraper.fetch_full_content(feature['source_url'])
        if full_content:
            print(f"\n(전체 {len(full_content)}자)")
            print(f'{feature['title']}')
            print(f"{full_content[:200]}...\n")
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
        }

        success = loader.save_article(article_data)
        if not success:
            print('DB 저장 실패.')

        # Rate Limit 방지용 코드
        if i < len(new_features):
            time.sleep(10)

# 호출마다 자동 실행되는 걸 방지함 (직접 실행할 때만 코드 돌리도록)
if __name__ == "__main__":
    main()