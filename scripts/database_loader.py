import os
from typing import Dict, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class SupabaseLoader:
    def __init__(self):
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not supabase_url or not supabase_key:
            raise ValueError('SUPABASE URL과 KEY가 환경변수에 없습니다.')

        # anon key 대신 service role key를 사용해 RLS(행 단위 보안 정책)를 우회
        self.client: Client = create_client(supabase_url, supabase_key)
        print('Supabase 연결 완료')

    def save_article(self, article_data: Dict) -> bool:
        """기사 데이터를 articles 테이블에 저장한다. 성공 시 True, 실패 시 False 반환."""
        try:
            print('DB 저장 중...')
            data = {
                'title': article_data.get('title'),
                'title_ko': article_data.get('title_ko'),
                'content_en': article_data.get('content_en'),
                'content_ko': article_data.get('content_ko'),
                'source': article_data.get('source'),
                'source_url': article_data.get('source_url'),
                'author': article_data.get('author'),
                'published_at': article_data.get('published_at'),
                'thumbnail_url': article_data.get('thumbnail_url'),
                'thumbnail_credit': article_data.get('thumbnail_credit'),
                'translation_status': article_data.get('translation_status', 'success'),
                # 번역 실패 기사도 저장하되, 번역 완료 시각은 성공한 경우에만 기록
                'translated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S') if article_data.get('translation_status', 'success') == 'success' else None
            }
            result = self.client.table('articles').insert(data).execute()

            print('DB 저장 완료')
            return True

        except Exception as e:
            print(f'DB 저장 실패: {e}')
            return False

    def article_exists(self, source_url: str) -> bool:
        """source_url로 기사 존재 여부를 확인한다. 중복 저장 방지용."""
        try:
            # 존재 여부만 확인하므로 id 하나만 조회해 네트워크 비용 최소화
            result = self.client.table('articles').select('id').eq('source_url', source_url).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f'중복 체크 실패: {e}')
            return False

    def filter_new_articles(self, articles: List[Dict]) -> List[Dict]:
        """기사 리스트에서 DB에 없는 새 기사만 추려서 반환한다."""
        # 저장 전에 미리 걸러서 unique 제약 위반과 불필요한 번역 API 호출을 방지
        new_articles = []
        for article in articles:
            source_url = article.get('source_url')
            if not source_url:
                continue

            if self.article_exists(source_url):
                print(f"{article.get('title', '')[:50]}...이/가 이미 존재합니다.")
            else:
                print(f"{article.get('title', '')[:50]}...을/를 저장합니다.")
                new_articles.append(article)

        return new_articles

    def save_album(self, album_data: Dict) -> bool:
        """앨범을 albums 테이블에 저장하고, 아티스트 연결까지 처리한다. 성공 시 True 반환."""
        try:
            print('앨범 DB 저장 중...')
            data = {
                'title': album_data.get('title'),
                'artist': album_data.get('artist'),
                'release_date': album_data.get('release_date'),
                'artwork_url': album_data.get('artwork_url'),
                'album_type': album_data.get('album_type'),
                'region': album_data.get('region'),
                'source': album_data.get('source', 'melon'),
            }
            result = self.client.table('albums').insert(data).execute()
            album_id = result.data[0]['id']

            artist_name = album_data.get('artist', '')
            if artist_name:
                # 아티스트는 여러 앨범에 걸쳐 재사용되므로 중복 생성 대신 get_or_create 패턴 적용
                artist_id = self.get_or_create_artist(artist_name)
                if artist_id:
                    # 한 앨범에 여러 아티스트가 존재할 수 있어 별도 junction 테이블로 분리
                    self._save_album_artist(album_id, artist_id)

            print('앨범 DB 저장 완료')
            return True
        except Exception as e:
            print(f'앨범 DB 저장 실패: {e}')
            return False

    def get_or_create_artist(self, name: str) -> Optional[str]:
        """아티스트 이름으로 조회 후 있으면 ID 반환, 없으면 새로 생성 후 ID 반환한다."""
        try:
            result = self.client.table('artists').select('id').eq('name', name).execute()
            if result.data:
                return result.data[0]['id']

            result = self.client.table('artists').insert({'name': name}).execute()
            print(f'아티스트 생성: {name}')
            return result.data[0]['id']
        except Exception as e:
            print(f'아티스트 get_or_create 실패: {e}')
            return None

    def _save_album_artist(self, album_id: str, artist_id: str) -> None:
        """album_artists 중간 테이블에 앨범-아티스트 관계를 저장한다."""
        try:
            self.client.table('album_artists').insert({
                'album_id': album_id,
                'artist_id': artist_id,
                'order': 1,  # 현재는 단독 아티스트만 처리, 피처링 지원 시 순서 필드 활용 예정
            }).execute()
        except Exception as e:
            print(f'album_artists 저장 실패: {e}')

    def album_exists(self, title: str, artist: str) -> bool:
        """title + artist 조합으로 앨범 존재 여부를 확인한다. 중복 저장 방지용."""
        try:
            # 동명 앨범이 다른 아티스트에 존재할 수 있으므로 title + artist 조합으로 확인
            result = self.client.table('albums').select('id').eq('title', title).eq('artist', artist).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f'앨범 중복 체크 실패: {e}')
            return False

    def filter_new_albums(self, albums: List[Dict]) -> List[Dict]:
        """앨범 리스트에서 DB에 없는 새 앨범만 추려서 반환한다."""
        new_albums = []
        for album in albums:
            title = album.get('title', '')
            artist = album.get('artist', '')
            if self.album_exists(title, artist):
                print(f"{title[:40]} - {artist[:20]} 이미 존재합니다.")
            else:
                print(f"{title[:40]} - {artist[:20]} 저장합니다.")
                new_albums.append(album)
        return new_albums


def main():
    SupabaseLoader()

if __name__ == "__main__":
    main()
