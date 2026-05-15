"""
dig-em.com 데이터 수집 파이프라인 DAG

이 DAG는:
1. 5개의 스크래퍼를 병렬로 실행 (Pitchfork, Stereogum, Consequence, Bandcamp, Melon)
2. 각 스크래퍼는 독립적으로 작동 (번역, DB 저장 포함)
3. 모든 스크래퍼 완료 후 완료 신호 발송

구조:
┌─ pitchfork_task ─┐
├─ stereogum_task ──┤
├─ consequence_task ┼─→ pipeline_complete
├─ bandcamp_task ───┤
└─ melon_task ──────┘

** 주요 개념 **
- PythonOperator: 기존 Python 함수/메서드 호출
- 의존성 (>>): Task 간 실행 순서 정의
- 병렬 실행: 의존 관계 없는 Task는 동시 실행
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

# ==================== 1️⃣ 스크래퍼 함수 정의 ====================
# 기존 코드를 최소한으로 수정해서 DAG에 맞게 조정

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


def run_bandcamp_scraper():
    """Bandcamp 스크래퍼 실행"""
    from scripts.column.bandcamp_scraper import BandcampDailyScraper
    scraper = BandcampDailyScraper()
    scraper.run(limit=5)
    print("✅ Bandcamp 스크래핑 완료")


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
    # 나중에 여기에 알림, 로깅 등을 추가할 수 있음


# ==================== 2️⃣ DAG 기본 설정 ====================

default_args = {
    'owner': 'digem',
    'retries': 1,                           # 실패 시 1회 재시도
    'retry_delay': timedelta(minutes=5),    # 5분 후 재시도
    'start_date': datetime(2026, 5, 15),
    'execution_timeout': timedelta(hours=1), # 1시간 이상 실행 시 중단
}

# ==================== 3️⃣ DAG 객체 생성 ====================

dag = DAG(
    'digem_scraper_pipeline',               # DAG ID (GitHub Actions에서 호출할 때 사용)
    default_args=default_args,
    description='dig-em.com 음악 칼럼 자동 수집 파이프라인',
    schedule_interval=None,                 # 수동 실행 (GitHub Actions가 트리거)
    catchup=False,
)

# ==================== 4️⃣ Task 정의 ====================
# 각 스크래퍼는 독립적이므로, 여기서 Task ID와 함수만 연결

# ** 주요 개념: PythonOperator **
# - task_id: Task 고유 이름 (DAG 내에서)
# - python_callable: 실행할 Python 함수
# - op_kwargs: 함수에 전달할 인자 (여기선 사용 X, 모두 함수 내부에서 처리)
# - retries: 실패 시 자동 재시도 횟수
# - pool: 동시 실행 Task 수 제한 (예: 'scraper_pool' → 최대 2개 동시 실행)

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

bandcamp_task = PythonOperator(
    task_id='run_bandcamp_scraper',
    python_callable=run_bandcamp_scraper,
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

# ==================== 5️⃣ Task 의존성 설정 ====================
# ** 핵심: 병렬 + 순차 조합 **

# 모든 스크래퍼는 서로 독립적 → 병렬 실행


[pitchfork_task, stereogum_task, consequence_task, bandcamp_task, melon_task] >> complete_task

# 해석:
# - [task1, task2, task3] >> final_task
# - = "task1, task2, task3가 모두 완료되면 final_task 실행"
# - 실행 시간: max(T1, T2, T3, T4, T5) + T_complete
#   (병렬이므로, 가장 오래 걸리는 스크래퍼 + 완료 Task 시간)


# ==================== 설명 ====================
"""
** 이 DAG의 학습 포인트 **

1. **PythonOperator 재사용성**
   - 기존 scraper.run() 메서드를 그대로 사용
   - 코드 중복 최소화
   - Python 함수를 Operator로 감싸기만 함

2. **pool을 통한 리소스 관리**
   - pool='scraper_pool'로 설정해서 스크래퍼들이 과도하게 동시 요청하지 않도록 제한
   - 예: pool_slots=2면, 최대 2개 스크래퍼만 동시 실행
   - (나중에 airflow.cfg에서 pool 설정 가능)

3. **병렬 실행의 이점**
   - 현재: 순차 (20분)
   - Airflow: 병렬 (5-10분)
   - 이유: 스크래퍼들이 서로 의존 관계 없음

4. **의존성 표현 (>> 연산자)**
   - task_a >> task_b: "task_a 완료 후 task_b"
   - [task1, task2] >> task3: "task1, task2 모두 완료 후 task3"
   - >> 연산자는 Airflow가 제공하는 DSL (Domain Specific Language)

** 다음 단계 **
Step 4에서는:
- 이 DAG 파일의 문법이 올바른지 검증
- Python import 경로 확인
- 실제 실행 가능한지 시뮬레이션
"""
