import sys
import time
import traceback

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


def run_all(column_scrapers, melon_scraper):
    jobs = [(type(s).__name__, lambda s=s: s.run(limit=5)) for s in column_scrapers]
    jobs.append((type(melon_scraper).__name__, melon_scraper.run))
    failed = []
    for name, job in jobs:
        started = time.perf_counter()
        try:
            job()
        except Exception:
            traceback.print_exc()
            failed.append(name)
        print(f"[{name}] {time.perf_counter() - started:.1f}초", flush=True)
    return failed


if __name__ == "__main__":
    failed = run_all(COLUMN_SCRAPERS, MelonScraper())
    if failed:
        print(f"실패한 스크래퍼: {', '.join(failed)}")
        sys.exit(1)
