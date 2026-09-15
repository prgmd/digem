"""
dig-em.com 데이터 수집 파이프라인 DAG

이 DAG는:
1. 4개의 스크래퍼를 병렬로 실행 (Pitchfork, Stereogum, Consequence, Melon)
   * Bandcamp는 2026-08-18 약관 이슈로 제외 (docs/09-copyright-review.md §2.4)
2. 각 스크래퍼는 독립적으로 작동 (번역, DB 저장 포함)
3. 모든 스크래퍼 완료 후 완료 신호 발송

구조:
┌─ pitchfork_task ──┐
├─ stereogum_task ──┤
├─ consequence_task ┼─→ pipeline_complete
└─ melon_task ──────┘
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator


def run_pitchfork_scraper():
    """Pitchfork 스크래퍼 실행"""
    from scripts.column.pitchfork_scrapers import PitchforkScraper
    scraper = PitchforkScraper()
    scraper.run(limit=5)
    print("✅ Pitchfork 스크래핑 완료")


def run_stereogum_scraper():
    """Stereogum 스크래퍼 실행"""
    from scripts.column.stereogum_scraper import StereogumScraper
    scraper = StereogumScraper()
    scraper.run(limit=5)
    print("✅ Stereogum 스크래핑 완료")


def run_consequence_scraper():
    """Consequence 스크래퍼 실행"""
    from scripts.column.consequence_scraper import ConsequenceScraper
    scraper = ConsequenceScraper()
    scraper.run(limit=5)
    print("✅ Consequence 스크래핑 완료")


def run_melon_scraper():
    """Melon 스크래퍼 실행"""
    from scripts.melon_scraper import MelonScraper
    scraper = MelonScraper()
    scraper.run()
    print("✅ Melon 스크래핑 완료")


def pipeline_complete():
    """모든 스크래퍼 완료 후 실행되는 Task"""
    print("=" * 50)
    print("✅ 모든 스크래퍼 파이프라인 완료!")
    print("=" * 50)


default_args = {
    'owner': 'digem',
    'retries': 1,                           # 실패 시 1회 재시도
    'retry_delay': timedelta(minutes=5),    # 5분 후 재시도
    'start_date': datetime(2026, 5, 15),
    'execution_timeout': timedelta(hours=1), # 1시간 이상 실행 시 중단
}

dag = DAG(
    'digem_scraper_pipeline',               # DAG ID (GitHub Actions에서 호출할 때 사용)
    default_args=default_args,
    description='dig-em.com 음악 칼럼 자동 수집 파이프라인',
    schedule_interval=None,                 # 수동 실행 (GitHub Actions가 트리거)
    catchup=False,
)

pitchfork_task = PythonOperator(
    task_id='run_pitchfork_scraper',
    python_callable=run_pitchfork_scraper,
    pool='scraper_pool',                    
    dag=dag,
)

stereogum_task = PythonOperator(
    task_id='run_stereogum_scraper',
    python_callable=run_stereogum_scraper,
    pool='scraper_pool',
    dag=dag,
)

consequence_task = PythonOperator(
    task_id='run_consequence_scraper',
    python_callable=run_consequence_scraper,
    pool='scraper_pool',
    dag=dag,
)

melon_task = PythonOperator(
    task_id='run_melon_scraper',
    python_callable=run_melon_scraper,
    pool='scraper_pool',
    dag=dag,
)

# 완료 신호 Task
complete_task = PythonOperator(
    task_id='pipeline_complete',
    python_callable=pipeline_complete,
    dag=dag,
)

[pitchfork_task, stereogum_task, consequence_task, melon_task] >> complete_task
