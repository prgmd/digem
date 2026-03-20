"""
일회성 멜론 앨범 시딩 스크립트 (Selenium 기반)
사용법:
    pip install selenium
    python tools/melon_seed.py
"""

import sys
import os
import time
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from database_loader import SupabaseLoader

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

MAIN_URL = 'https://www.melon.com/new/album/index.htm'
PAGE_LIMIT = 10
ALBUMS_PER_PAGE = 20
ALLOWED_TYPES = {'정규', 'EP'}


def scrape_by_region(driver, area_code: str, region_name: str, loader: SupabaseLoader):
    print(f'\n--- 멜론 {region_name} 수집 시작 ({PAGE_LIMIT}페이지) ---')
    total = 0

    for page in range(1, PAGE_LIMIT + 1):
        start_index = (page - 1) * ALBUMS_PER_PAGE + 1
        url = f'{MAIN_URL}#params[areaFlg]={area_code}&params[orderBy]=issueDate&po=pageObj&startIndex={start_index}'

        print(f'[{page}페이지] 수집 중...')
        driver.get(url)

        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div.service_list_album > ul > li'))
            )
            time.sleep(1)
        except Exception as e:
            print(f'  타임아웃, 중단: {e}')
            break

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        album_list = soup.select('div.service_list_album > ul > li:has(div.entry)')

        if not album_list:
            print('  앨범 목록 없음, 중단')
            break

        albums = []
        for item in album_list:
            try:
                type_tag = item.select_one('span.vdo_name')
                if not type_tag:
                    continue
                album_type = type_tag.text.strip().replace('[', '').replace(']', '')
                if album_type not in ALLOWED_TYPES:
                    continue

                title       = item.select_one('a.album_name').text.strip()
                artist      = item.select_one('span.artist a.artist_name').text.strip()
                date_str    = item.select_one('span.reg_date').text.strip()
                artwork_url = item.select_one('div.thumb img').get('src', '')
                release_date = str(datetime.strptime(date_str, '%Y.%m.%d').date())

                albums.append({
                    'title':        title,
                    'artist':       artist,
                    'release_date': release_date,
                    'artwork_url':  artwork_url,
                    'album_type':   album_type,
                    'region':       region_name,
                    'source':       'melon',
                })
            except Exception as e:
                print(f'  파싱 오류: {e}')
                continue

        new_albums = loader.filter_new_albums(albums)
        success = sum(1 for a in new_albums if loader.save_album(a))
        print(f'  → {len(albums)}개 파싱, {success}개 저장')
        total += success

    print(f'{region_name} 완료: 총 {total}개 저장')


def main():
    loader = SupabaseLoader()

    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(service=Service(), options=chrome_options)

    try:
        scrape_by_region(driver, 'I', '국내', loader)
        scrape_by_region(driver, 'O', '해외', loader)
    finally:
        driver.quit()


if __name__ == '__main__':
    main()
