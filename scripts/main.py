from .column.pitchfork_scrapers import PitchforkScraper
from .column.stereogum_scraper import StereogumScraper
from .column.consequence_scraper import ConsequenceScraper
from .column.bandcamp_scraper import BandcampDailyScraper
from .melon_scraper import MelonScraper

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
