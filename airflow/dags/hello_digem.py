"""
첫 번째 테스트 DAG - Airflow 기본 구조 학습용

이 DAG는:
1. 3개의 Task를 정의합니다 (A → B → C)
2. 각 Task는 Python 함수를 실행합니다
3. 웹 UI에서 DAG 시각화를 확인할 수 있습니다
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator


# ==================== 1️⃣ 실행할 함수들 정의 ====================

def task_a_function():
    """Task A: 데이터 준비 단계"""
    print("✅ Task A: 데이터를 준비했습니다")
    return "Task A 완료"


def task_b_function():
    """Task B: 데이터 처리 단계"""
    print("✅ Task B: 데이터를 처리했습니다")
    return "Task B 완료"


def task_c_function():
    """Task C: 데이터 저장 단계"""
    print("✅ Task C: 데이터를 저장했습니다")
    return "Task C 완료"


# ==================== 2️⃣ DAG 기본 설정 ====================

default_args = {
    'owner': 'digem',                          # DAG 소유자
    'retries': 1,                               # 실패 시 1회 재시도
    'retry_delay': timedelta(minutes=5),        # 5분 후 재시도
    'start_date': datetime(2026, 5, 15),       # DAG 시작 날짜
}

# ==================== 3️⃣ DAG 객체 생성 ====================

dag = DAG(
    'hello_digem',                              # DAG 이름 (고유, 웹 UI에서 보임)
    default_args=default_args,
    description='Airflow 학습용 첫 번째 DAG',
    schedule_interval=None,                     # 수동 실행만 (스케줄 X)
    catchup=False,                              # 과거 실행 무시
)

# ==================== 4️⃣ Task 정의 ====================

# Task A
task_a = PythonOperator(
    task_id='task_a',                           # Task ID (DAG 내에서 고유)
    python_callable=task_a_function,            # 실행할 함수
    dag=dag,                                    # 어느 DAG에 속하는지
)

# Task B
task_b = PythonOperator(
    task_id='task_b',
    python_callable=task_b_function,
    dag=dag,
)

# Task C
task_c = PythonOperator(
    task_id='task_c',
    python_callable=task_c_function,
    dag=dag,
)

# ==================== 5️⃣ Task 의존성 설정 ====================
# A → B → C 순서로 실행
task_a >> task_b >> task_c

# ==================== 설명 ====================
"""
위 코드를 분석하면:

1. **default_args**: 모든 Task에 적용되는 기본 설정
   - owner: DAG 소유자
   - retries: 실패 시 몇 번 재시도할지
   - retry_delay: 재시도 간격
   - start_date: DAG가 실행될 수 있는 가장 빠른 날짜

2. **DAG 객체**: Airflow의 핵심
   - dag_id ('hello_digem'): DAG 고유 이름
   - schedule_interval=None: 스케줄 없음 (수동 실행만)
   - catchup=False: 과거 날짜의 실행 무시

3. **PythonOperator**: Python 함수를 실행하는 Operator
   - task_id: Task 고유 이름
   - python_callable: 실행할 함수
   - dag: 어느 DAG에 속할지

4. **의존성 설정**: task_a >> task_b >> task_c
   - '>>' 연산자: "그 다음에 실행"
   - A 완료 → B 시작 → C 시작

다음 단계에서는:
- 이 기본 구조에 **기존 스크래퍼를 통합**합니다
- 5개 스크래퍼를 **병렬 실행**으로 변경합니다
- **Gmail 알림**을 추가합니다
"""
