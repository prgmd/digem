import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict
from .database_loader import SupabaseLoader

# 봇 차단을 피하기 위해 일반 브라우저 UA로 위장
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

URL = 'https://www.melon.com/new/album/listPaging.htm'

# 싱글·컴필레이션 등은 제외하고 정규앨범과 EP만 수집
ALLOWED_TYPES = ['정규', 'EP']

# 멜론 API는 area_code로 국내/해외를 구분
REGIONS = [
    {'area_code': 'I', 'name': '국내'},
    {'area_code': 'O', 'name': '해외'},
]


class MelonScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_albums(self, area_code: str, region_name: str) -> List[Dict]:
        """멜론 신보 목록 API를 호출해 허용 타입(정규/EP) 앨범 리스트를 반환한다."""
        print(f'멜론 {region_name} 앨범 수집 시작...')
        params = {
            'areaFlg': area_code,
            'orderBy': 'issueDate',
            'startIndex': '1'
        }

        try:
            response = self.session.post(URL, data=params, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f'멜론 {region_name} API 호출 실패: {e}')
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        album_list = soup.select('div.service_list_album > ul > li:has(div.entry)')

        if not album_list:
            print(f'{region_name} 앨범 목록을 찾을 수 없습니다.')
            return []

        print(f'{region_name}: {len(album_list)}개 항목 발견')
        albums = []

        for item in album_list:
            try:
                type_tag = item.select_one('span.vdo_name')
                if not type_tag:
                    continue

                album_type = type_tag.text.strip().replace('[', '').replace(']', '')
                if album_type not in ALLOWED_TYPES:
                    continue

                artwork_url = item.select_one('div.thumb img').get('src', '')
                title = item.select_one('a.album_name').text.strip()
                artist = item.select_one('span.artist a.artist_name').text.strip()
                release_date_str = item.select_one('span.reg_date').text.strip()
                release_date = datetime.strptime(release_date_str, '%Y.%m.%d').date()

                albums.append({
                    'title': title,
                    'artist': artist,
                    'release_date': str(release_date),
                    'artwork_url': artwork_url,
                    'album_type': album_type,
                    'region': region_name,
                    'source': 'melon',
                })

            except (AttributeError, ValueError) as e:
                print(f'앨범 파싱 실패: {e}')
                continue

        print(f'{region_name}: {len(albums)}개 ({"/".join(ALLOWED_TYPES)}) 수집 완료')
        return albums


    def run(self):
        """전체 파이프라인 실행: 국내/해외 앨범 수집 → 중복 제거 → DB 저장."""
        print('멜론 앨범 스크래핑 시작...')
        loader = SupabaseLoader()

        all_albums = []
        for region in REGIONS:
            albums = self.fetch_albums(region['area_code'], region['name'])
            all_albums.extend(albums)

        if not all_albums:
            print('수집된 앨범이 없습니다.')
            return

        print(f'\n총 {len(all_albums)}개 앨범 수집. 중복 체크 중...')
        new_albums = []
        consecutive_exists = 0

        for album in all_albums:
            title = album.get('title', '')
            artist = album.get('artist', '')
            if loader.album_exists(title, artist):
                consecutive_exists += 1
                # 최신순 정렬 기준으로 3개 연속 중복이면 이미 저장된 시점까지 따라잡은 것으로 판단해 조기 종료
                if consecutive_exists >= 3:
                    print(f'최신 앨범 3개 연속 중복 확인 — 이후 항목 생략')
                    break
            else:
                consecutive_exists = 0
                new_albums.append(album)

        if not new_albums:
            print('모든 앨범이 이미 DB에 존재합니다.')
            return

        print(f'\n{len(new_albums)}개 신규 앨범 저장 시작...')
        success = sum(1 for album in new_albums if loader.save_album(album))
        print(f'\n완료: {success}/{len(new_albums)}개 저장')


if __name__ == '__main__':
    MelonScraper().run()
