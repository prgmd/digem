# 🚀 Airflow 도입 가이드 (학습 중심)

**목적:** dig-em.com 데이터 수집 파이프라인을 Airflow로 자동화  
**학습 중심:** 각 단계마다 개념 설명 후 구현  
**작성일:** 2026-05-14

---

## 📋 **현재 상황**

### 문제점 (해결됨)
- ✅ `.env.local` 위치 수정
  - **문제:** `.env.local`을 `digem/` 루트에 배치
  - **원인:** Next.js 프로젝트가 `frontend/` 폴더에 있는데 루트로 착각
  - **해결:** `frontend/.env.local`에 Supabase 환경변수 배치

### 프로젝트 구조
```
digem/
├── frontend/                    # Next.js 프론트엔드
│   ├── app/, components/
│   ├── lib/supabase.ts
│   └── .env.local              # ✅ HERE (환경변수)
├── scripts/                     # Python 데이터 파이프라인
│   ├── main.py                 # 진입점 (현재: 선형 실행)
│   ├── column/                 # 칼럼 스크래퍼들
│   │   ├── pitchfork_scrapers.py
│   │   ├── stereogum_scraper.py
│   │   ├── consequence_scraper.py
│   │   └── bandcamp_scraper.py
│   ├── melon_scraper.py
│   ├── google_translator.py    # Gemini 번역
│   └── database_loader.py      # Supabase 저장
├── tools/
├── .env                        # 파이썬 환경변수 (서비스키 등)
└── structure.md                # 프로젝트 전체 구조
```

---

## 🎯 **Airflow 도입 목표**

| 항목 | 설정 |
|------|------|
| **트리거 방식** | GitHub Actions (24시간 주기) |
| **스케줄링** | 불필요 (GitHub Actions가 관리) |
| **에러 알림** | Gmail (`neon9008@gmail.com`) |
| **실행 방식** | GitHub Actions가 Airflow DAG 호출 |
| **병렬화** | 5개 스크래퍼 동시 실행 (현재 순차 → 20분 → 5분) |

---

## 📚 **Airflow 핵심 3가지 개념**

### **1️⃣ DAG (Directed Acyclic Graph)**
작업들의 **의존 관계**를 그래프로 표현

**현재 순서:**
```
pitchfork → stereogum → consequence → bandcamp → melon → 번역 → DB저장
(선형, 20분 소요)
```

**Airflow DAG:**
```
┌─ pitchfork_scrape ──┐
├─ stereogum_scrape ──┤
├─ consequence_scrape ┤ ──→ translate_all ──→ save_to_db ──→ notify_gmail
├─ bandcamp_scrape ───┤
└─ melon_scrape ──────┘
(병렬, 5분 소요)
```

**이점:**
- 독립적인 작업들을 **병렬 실행**
- Airflow가 자동으로 **순서 관리**
- 시각적으로 **전체 흐름 파악** 가능

---

### **2️⃣ Operator (작업 타입)**

"무엇을 할 것인가"를 정의

```python
# 예: Python 함수 실행
from airflow.operators.python import PythonOperator

pitchfork_task = PythonOperator(
    task_id='pitchfork_scrape',           # 작업 ID (고유)
    python_callable=scrape_pitchfork,     # 실행할 함수
    retries=3,                            # 실패 시 3회 자동 재시도
    retry_delay=timedelta(minutes=5),     # 5분 뒤 재시도
    timeout=15*60,                        # 15분 이상 실행 시 중단
)
```

**자주 쓰는 Operator:**
- `PythonOperator` → Python 함수
- `BashOperator` → Shell 명령
- `EmailOperator` → 이메일 발송 (알림에 사용)
- `HttpOperator` → API 호출

---

### **3️⃣ Task (실행 단위)**

Operator가 **DAG에 배치되어 실행될 때** → Task가 됨

```python
# 3개의 독립적인 Task 만들기
task1 = PythonOperator(task_id='pitchfork_scrape', ...)
task2 = PythonOperator(task_id='stereogum_scrape', ...)
task3 = PythonOperator(task_id='melon_scrape', ...)

# Task들 간 의존 관계 설정
[task1, task2, task3] >> final_task
# = task1, task2, task3가 모두 완료되면 final_task 실행
```

---

## 🛠️ **다음 단계 (진행 예정)**

### **Step 2: 로컬 Airflow 환경 구성** (예정)
- Docker Compose로 경량 Airflow 설정
- PostgreSQL (메타데이터 저장)
- Redis (실행 큐)
- 로컬 테스트 가능하게 구성

### **Step 3: 첫 DAG 작성** (예정)
- 기존 `scripts/main.py` 로직을 DAG로 변환
- 5개 스크래퍼를 Task로 정의
- 의존 관계 설정

### **Step 4: Gmail 알림 연동** (예정)
- `EmailOperator` 설정
- 에러 발생 시 자동 이메일 발송

### **Step 5: GitHub Actions 연동** (예정)
- GitHub Actions가 Airflow DAG 호출
- 24시간마다 자동 트리거

---

## 💡 **학습 포인트**

- **왜 Airflow인가?** → 복잡한 데이터 파이프라인을 선언적으로 관리
- **왜 병렬화?** → 독립적 작업들을 동시 실행 → 속도 향상
- **왜 DAG?** → 의존성이 명확하고, 시각화 가능하고, 확장 용이

---

## 📝 **메모**

- Airflow는 **Python 기반** (기존 스크립트와 호환성 좋음)
- 로컬에서 테스트 후, 본격 운영 전 검증 필수
- GitHub Actions + Airflow 조합 = 최소한의 인프라로 자동화

---

**다음 진행:** 집 컴퓨터에서 이 문서를 읽고, Step 2부터 시작하세요!
