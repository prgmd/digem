from .column.pitchfork_scrapers import PitchforkScraper
from .column.stereogum_scraper import StereogumScraper
from .column.consequence_scraper import ConsequenceScraper
from .column.bandcamp_scraper import BandcampDailyScraper
from .melon_scraper import MelonScraper

# 스크래퍼를 추가·제거할 때 이 리스트만 수정하면 run() 루프에 자동 반영
COLUMN_SCRAPERS = [
    PitchforkScraper(),
    StereogumScraper(),
    ConsequenceScraper(),
    BandcampDailyScraper(),
]

if __name__ == "__main__":
    for scraper in COLUMN_SCRAPERS:
        scraper.run(limit=5)

    MelonScraper().run()
