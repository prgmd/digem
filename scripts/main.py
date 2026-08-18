from .column.pitchfork_scrapers import PitchforkScraper
from .column.stereogum_scraper import StereogumScraper
from .column.consequence_scraper import ConsequenceScraper
from .melon_scraper import MelonScraper

# 스크래퍼를 추가·제거할 때 이 리스트만 수정하면 run() 루프에 자동 반영
#
# 2026-08-18 Bandcamp Daily 제거.
# 사유: Acceptable Use Policy가 스크래핑·데이터마이닝을 명시적으로 금지하며,
#       기존 구현이 봇 탐지를 우회하고 있어 접근통제 우회 소지가 있었음.
#       상세: docs/09-copyright-review.md §2.4
COLUMN_SCRAPERS = [
    PitchforkScraper(),
    StereogumScraper(),
    ConsequenceScraper(),
]

if __name__ == "__main__":
    for scraper in COLUMN_SCRAPERS:
        scraper.run(limit=5)

    MelonScraper().run()
