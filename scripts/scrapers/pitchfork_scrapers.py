import feedparser
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup

class pitchforkScraper:
    RSS_URL = "https://pitchfork.com/feed/feed-features/rss"

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
    features = scraper.fetch_latest_reviews(limit = 5)

    if features:
        print('가져온 칼럼들 목록 출력')
        for i, review in enumerate(features, 1):
            print(f"\n{i}. {review['title']}")
            print(f"   저자: {review['author']}")
            print(f"   날짜: {review['published_at']}")
            print(f"   URL: {review['source_url']}")
            print(f"   요약: {review['summary'][:100]}...")
        
        # 테스트로 첫 번째 리뷰 전체 내용 가져오기
        if features:
            # print("\n" + "=" * 60)
            # print("📖 첫 번째 리뷰 전체 내용 가져오기:")
            # print("=" * 60)
            full_content = scraper.fetch_full_content(features[0]['source_url'])
            if full_content:
                print(f"\n{full_content}")
                print(f"\n(전체 {len(full_content)}자)")

# 호출마다 자동 실행되는 걸 방지함 (직접 실행할 때만 코드 돌리도록)
if __name__ == "__main__":
    main()