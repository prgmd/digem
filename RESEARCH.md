# dig-em 리서치 노트 — 데이터 소스 지도 & 로드맵

> dig-em을 "스크래핑 서비스"에서 "데이터 플랫폼"으로 확장하기 위한 계획서 겸 소스 지도.
> 고정 사양 아님. 진행하며 갱신하는 살아있는 문서.

---

## 0. 목표

두 축을 함께 가져간다.

1. 이미 수집된 데이터(칼럼 `content_en`/`content_ko`, 멜론 신보)에 다양한 데이터 엔지니어링 기법을 적용해 역량을 전문화한다.
2. 새로운 데이터 소스(API/스크랩)를 추가하고, 거기 맞는 기술 스택도 적용해본다.

단, API 연동/스크래핑 자체는 이미 익힌 기술이라 그 자체가 학습 목표이거나 별도 blog 글의 주제가 되지는 않는다. 각 트랙(아래 2절)이 필요로 하는 데이터를 조달하는 수단일 뿐이다. 예: Track C에 써클/빌보드 차트를 추가해도 그 blog 글의 주제는 "윈도우 함수 + Kafka 스트리밍"이지 "차트 스크래핑" 이 아니다.

원칙: **파이프라인 성숙도 축(레이크→변환→웨어하우스→품질게이트→관측성)의 스택을 도입할 때, 반드시 음악 기능 축(3절)의 구체적 기능을 명분으로 삼는다.**

---

## 1. 현재 상태 스냅샷

### 이미 확보 (코드로 증명됨)
Python 파이프라인, Airflow 기초(DAG, PythonOperator, 병렬, 재시도), 배치 ETL, 관계형 모델링(다대다), GitHub Actions CI, 정적/동적 스크래핑, 외부 API 연동(Gemini), 멱등 수집(중복/실패 상태 관리).

### 부분 확보 (기초만, 심화 필요)
- **SQL**: 단순 CRUD 위주. 윈도우 함수, CTE, 인덱스 튜닝 경험 얕음.
- **Airflow**: Sensor, XCom, 동적 태스크 매핑, 백필, pool 실사용 경험 없음.

### 공백 (아직 없음)
ELT/dbt, 데이터 웨어하우스(BigQuery), 데이터 품질 검증(GE/dbt tests), 스트리밍(Kafka), 컨테이너(Docker), IaC(Terraform), 클라우드 코어(GCS/IAM), 관측성(신선도/알림/lineage), 분산 처리(Spark).

### 이미 있지만 안 쓰는 자산 (재활용 대상)
- **`chart_history` 테이블**: Day 1에 Supabase에 생성했으나 코드 미사용. 실시간 차트 순위 변동 기능의 저장소로 바로 재활용 가능.
- **`genres`, `lyrics` 테이블**: 동일하게 생성 후 미사용.
- **`scraper_pool`**: DAG에 참조는 있으나 실제 pool 슬롯 설정 미완.
- **Upstash Redis**: 환경변수만 있고 미구현.

### 코드 사실 (검증됨)
- `base_scraper.py`의 `_extract_content`(L40-69)는 HTML 받자마자 `<p>` 태그만 뽑아 문자열로 합침. 원본 HTML 어디에도 안 남음.
- `run()`(L92-137)은 번역 실패해도 이미 추출된 `content_en`만 저장. 원본 페이지 재현 불가.
- `melon_scraper.py`도 동일 패턴: 선택자로 바로 필드 추출, 원본 HTML 미보존.

---

## 2. 전문화 트랙 A / B / C / D (핵심 렌즈)

핵심 의존관계: **A(텍스트)가 B와 D에 엔티티를 공급하는 게 원래 설계**지만, 새 소스 수집이 자유로워진 지금은 B가 A 없이도(MusicBrainz API로) 시작 가능. C는 차트 소스가 필요해 독립적.

### Track A — 텍스트 심화 (칼럼 대상 NLP)
- **데이터**: 기존 `content_en`/`content_ko` (새 소스 불필요).
- **기법**: NER(아티스트/앨범 언급 추출), 감성/톤 분석, 토픽 모델링/키워드 트렌드, 임베딩 + 시맨틱 검색(pgvector).
- **음악 산출물**: "이 아티스트 언급된 모든 칼럼", 비슷한 칼럼 추천, 자연어 검색, 시기별 담론 트렌드.
- **의존**: 없음. 즉시 착수 가능. B/D에 엔티티 공급.

### Track B — 개체 정합 (Entity Resolution)
- **데이터**: A의 NER 결과 + 기존 `artists`/`albums` + MusicBrainz API(신규 소스).
- **기법**: 정규화, fuzzy matching(편집거리, 음차 대응), 블로킹, 표준 식별자(MBID) 연결, dedup, MDM.
- **음악 산출물**: 통합 아티스트/앨범 마스터. "칼럼의 방탄소년단 = 멜론의 방탄소년단 = MusicBrainz MBID" 병합.
- **의존**: 원래는 A(엔티티 추출)에 의존 설계. 지금은 완화됨 — 기존 구조화 필드(`artists`/`albums`)를 MusicBrainz API로 바로 매칭하는 것으로 A 없이도 시작 가능. A와 결합하면 칼럼 텍스트 언급까지 포함해 더 정교해짐.

### Track C — 시계열 / 스트리밍
- **데이터**: 차트 스냅샷(써클/빌보드/멜론차트, 신규 소스) → `chart_history`(기존 미사용 테이블 재활용).
- **기법**: 주기적 스냅샷, 윈도우 함수(LAG로 순위 변동), 이벤트 발행(Kafka), Redis 캐시.
- **음악 산출물**: 실시간 급상승, 순위 궤적, 크로스 플랫폼 순위. (기존 F1과 동일)
- **의존**: 차트 소스 1개 이상 추가 필요. B와 결합 시 크로스 플랫폼 매칭.

### Track D — 그래프 처리
- **데이터**: `album_artists`(이미 그래프 구조) + A의 공동 언급 엣지 + MusicBrainz 아티스트 관계/장르(보강).
- **기법**: 그래프 모델링, 중심성/커뮤니티 탐지, 경로 분석. Neo4j 또는 Postgres 재귀 CTE.
- **음악 산출물**: 아티스트 협업 네트워크, 장르 지도, 연결 기반 발견/추천.
- **의존**: `album_artists`로 바로 시작 가능, A와 보강으로 풍부해짐.

---

## 3. 만들 음악 기능 (기능 축)

| 기능 | 한 줄 설명 | 상태 |
|---|---|---|
| **F1. 실시간 차트 순위 변동 추적** | 차트를 주기적으로 스냅샷, 순위 변동 감지해 이벤트/알림 | 신규, Track C |
| **F2. 음악 트렌드 대시보드** | 소스별 발행 추이, 번역 성공률, 인기 아티스트, 국내/해외 신보 추이 | 신규 |
| **F3. 품질/신선도 모니터링 & 알림** | 파이프라인 결과가 "맞는지" 자동 검증, 이상 시 알림 | 신규 |
| **F4. 재현 가능한 인프라** | 로컬/클라우드 어디서든 동일하게 뜨는 스택 | 신규, 기반 성격 |
| **F5. 맞춤 추천** | 사용자 취향 기반 칼럼/앨범 추천 | 보류 (별도 트랙) |

---

## 4. 스택 × 기능 매핑

| 부족 스택 | 실습 기능 | 구체적 쓰임새 |
|---|---|---|
| SQL 심화 (윈도우 함수, CTE) | F1 | `LAG`/`LEAD`로 "지난 스냅샷 대비 순위 변동" 계산 |
| ELT / dbt | F2 | raw 적재 → staging 정제 → mart 집계(발행 추이, 번역률) |
| Landing Zone (데이터 레이크) | F2 | 스크래핑 원본을 Parquet로 보존, 변환 재실행 기반 |
| 컬럼형 DWH (BigQuery) | F2 | 대량 차트 히스토리 + 집계 쿼리를 OLTP와 분리 |
| 데이터 품질 (GE / dbt tests) | F3 | 번역 성공률 임계값, 차트 신선도, 스키마 검증 |
| Airflow 심화 (동적 태스크) | F2 | 하드코딩된 5개 스크래퍼 태스크를 소스 리스트 기반 동적 생성 |
| Airflow 심화 (Sensor) | F1 | 차트 페이지 갱신 감지 후 스냅샷 태스크 트리거 |
| Airflow 심화 (XCom, pool, 백필) | F1~F3 | 수집 건수 전달, 동시 요청 제한, 과거 날짜 재처리 |
| Redis | F1 | 최근 차트 순위 캐시 |
| Kafka (스트리밍) | F1 | 순위 변동을 이벤트로 발행 → 실시간 소비자/알림 |
| 관측성 (신선도, 알림, lineage) | F3 | Airflow SLA, 신선도 체크, Slack 알림, dbt lineage 뷰 |
| Docker (컨테이너) | F4 | Airflow + 스크래퍼 + Kafka + Redis 로컬 스택을 compose로 |
| Terraform (IaC) | F4 | GCS 버킷, BigQuery 데이터셋, 서비스 계정, IAM 코드화 |
| 클라우드 코어 (GCS, IAM) | F4 | Landing Zone을 로컬 → 클라우드 스토리지로 이관 |
| Spark / 분산 처리 | (보류) | 현 규모상 억지 |
| 차원 모델링 (star schema) | (보류) | 현 규모상 불필요, flat mart로 대체 |

---

## 5. 기능별 상세 설계

### F1. 실시간 차트 순위 변동 추적 ⭐ 핵심 신규 기능

**무엇을**: 차트(예: 멜론 TOP100)를 일정 주기로 스냅샷, 직전 스냅샷과 비교해 순위 변동(상승/하락/신규진입/이탈) 계산, 유의미한 변동을 이벤트로 발행·알림.

**왜 스트리밍인가**: 배치(하루 1회)로는 "순위가 바뀌었다"는 사실 자체를 못 잡음. 최소 시간 단위 스냅샷 비교가 필요해 이벤트 기반 구조가 실제로 필요함. 기존 스크래핑/번역 파이프라인에 얹지 않고 독립 기능으로 구현.

**단계**:
1. 차트 스냅샷 수집 — 스크래퍼 추가, `chart_history`에 `(수집시각, 순위, 곡, 아티스트)` 적재.
2. 순위 변동 계산 — 윈도우 함수로 직전 스냅샷 대비 delta.
   ```sql
   SELECT song, rank,
          LAG(rank) OVER (PARTITION BY song ORDER BY captured_at) AS prev_rank,
          LAG(rank) OVER (PARTITION BY song ORDER BY captured_at) - rank AS delta
   FROM chart_history
   ```
3. Redis 캐시 — 최근 스냅샷 순위 캐시, DB 풀스캔 없이 O(1) 조회.
4. 이벤트 발행 — 임계값(예: 10계단 이상 상승, 신규 진입) 넘으면 Kafka `chart_rank_change` 토픽 발행.
5. 소비자/알림 — 토픽 구독해 Slack/웹 알림, 프론트 "급상승" 섹션.
6. 오케스트레이션 — Airflow Sensor로 차트 갱신 감지, XCom으로 변동 건수 전달.

**선행조건**: 없음(독립 기능). **난이도**: ●●● (Kafka 처음이면 높음)

### F2. 음악 트렌드 대시보드

1. Landing Zone — 스크래핑 원본(추출 전 HTML/RSS raw)을 Parquet로 보존.
2. dbt 변환 — raw → staging(정제) → mart(집계). `mart_publish_trend`, `mart_translation_rate`, `mart_top_artists`.
3. dbt tests — not_null, unique, relationships로 모델 검증.
4. 웨어하우스 이관 — 로컬 dbt-duckdb로 시작, 이후 BigQuery 무료 티어로 타깃 전환.
5. Airflow 동적 태스크 — 하드코딩 5개 스크래퍼 태스크를 dynamic task mapping으로 리팩토링.
6. BI 대시보드 — Looker Studio 또는 Metabase 연결.

**선행조건**: Landing Zone(F2-1)이 dbt(F2-2) 입력. **난이도**: ●●○

### F3. 품질/신선도 모니터링 & 알림

1. 품질 규칙 — GE/dbt tests: 번역 성공률 90% 미만 감지, `source_url` 유일성, not_null, 차트 신선도.
2. 게이트 — 기준 미달 시 Airflow DAG 중단/다운스트림 차단.
3. 알림 — Slack Webhook.
4. lineage — dbt docs.
5. SLA/신선도 — Airflow SLA, "마지막 성공 실행 이후 경과 시간" 체크.

**선행조건**: F2의 dbt/mart 있으면 검증 대상 풍부해짐. 일부 독립 적용 가능. **난이도**: ●●○

### F4. 재현 가능한 인프라 (기반)

1. Docker Compose — Airflow(+메타DB), 스크래퍼, Redis, Kafka 컨테이너화.
2. 클라우드 스토리지 — Landing Zone Parquet 로컬 → GCS.
3. Terraform — GCS 버킷, BigQuery 데이터셋, 서비스 계정, IAM 코드화.

**선행조건**: F1/F2가 어느 정도 돌아간 뒤 컨테이너화가 자연스러움. **난이도**: ●●○

---

## 6. 실행 순서 — 미확정 (열린 결정)

- 원안: `Landing Zone+dbt → Track A → (D, B) → C → 교차 관심사(품질게이트/Docker/Terraform)`
- 사용자 관심 순서 후보: **D > C > B > A**
- 상태: **다음 세션에서 최종 확정 필요.** 새 소스 수집이 자유로워지면서 B/D도 A 없이 즉시 착수 가능해져, 원안의 "A 선행 필수" 제약이 완화됨.
- Landing Zone은 순서와 무관하게 공통 기반이라 먼저 까는 쪽으로 잠정 합의.

---

## 7. 데이터 소스 지도

> 목적: "리스너가 원하는 최신 음악 정보를 모두 모아, 알아서 가공해, 한 사이트에서 찾아보게 한다."
> 접근 방식/정책은 자주 바뀜. "확인 필요" 표시 항목은 착수 전 재확인.

### 7.0 현재 커버리지

| 축 | 현재 소스 | 정보 유형 |
|---|---|---|
| 칼럼/비평 | Pitchfork, Stereogum, Consequence, Bandcamp Daily | 비평/에디토리얼 |
| 신보 | 멜론 신보 | 발매 정보 (국내/해외 정규, EP) |

10개 정보 유형 중 2개(비평, 신보 일부)만 커버.

### 7.1 리스너가 원하는 정보 유형 (10 분류)

1. 신보/발매 예정
2. 차트/순위
3. 비평/에디토리얼/칼럼 (현재 축)
4. 인기/화제성 지표 (스트림 수, 조회수, Shazam 등)
5. 아티스트 메타/디스코그래피
6. 가사/해설/크레딧
7. 공연/투어/페스티벌
8. 뉴스/업계 소식
9. 어워드/시상
10. 커뮤니티 담론

### 7.2 소스 지도

**차트/순위 ⭐ (F1 원천)**

| 소스 | 커버 | 데이터 | 접근 | 비용 | 주의 |
|---|---|---|---|---|---|
| 써클차트(구 Gaon) | 🇰🇷 | 디지털/스트리밍/실물판매/글로벌 K-pop | 스크랩 | 무료 | 공식 API 없음 |
| Billboard | 🌐 | Hot 100, Billboard 200, Global 200 | 스크랩 | 무료 | API 폐지, 주간 갱신 |
| Spotify Charts | 🌐 | Top 50, Viral 50 | 스크랩/하이브리드 | 무료 | 로그인/제한 강화됨(확인 필요) |
| Apple Music Charts | 🌐 | Top 100 | API/스크랩 | 유료($99/yr) | JWT, 개발자 계정 |
| YouTube Charts | 🌐 | Top songs/videos | 스크랩 | 무료 | 내부 API |
| 멜론/지니/벅스/FLO/바이브 | 🇰🇷 | 실시간/일간/주간 차트 | 스크랩 | 무료 | 멜론 신보만 수집 중, 차트 미수집 |
| Last.fm | 🌐 | scrobble 기반 차트, 태그 | API | 키(무료) | 보강용 최상, 안정적 |
| Shazam | 🌐 | 발견 차트 | 스크랩 | 무료 | 공식 API 없음 |

**신보/발매**

| 소스 | 데이터 | 접근 | 비용 |
|---|---|---|---|
| Spotify new-releases | 신보 목록, 메타, 아트워크 | API | 무료(client credentials) |
| MusicBrainz | 릴리스/발매일/메타 | API | 무료(1req/s) |
| Apple Music | 카탈로그, 신보 | API | 유료 |
| Discogs | 발매(실물 포함) | API | 키(무료) |
| 멜론 신보 | 정규/EP | 스크랩 | 무료(구현됨) |

**비평/에디토리얼 (현재 축)**: Pitchfork/Stereogum/Consequence/Bandcamp(수집중), Rolling Stone/NME/The Fader/The Guardian(해외 확장 후보), Resident Advisor/DJ Mag(전자음악), Line of Best Fit/Clash/Paste(인디), IZM/리드머/weiv/음악취향Y(국내)

**인기/화제성 지표**: Spotify popularity(API,무료), YouTube Data API(조회수/좋아요, quota 10000/일), Last.fm(scrobble 수, 키무료), Chartmetric(유료)

**아티스트 메타/디스코그래피**: MusicBrainz(API,무료), Discogs(API,키무료), Wikidata/Wikipedia(SPARQL,무료), Spotify(장르태그)

**가사/해설/크레딧**: Genius(API, 가사는 저작권상 텍스트 미제공), Musixmatch(유료/제한) — ⚠️ 가사 전문 저장/재배포는 라이선스 필요, 크레딧/해설 메타만 권장

**공연/투어**: Bandsintown(파트너십 필요할수 있음, 확인필요), Songkick(신규키 제한적, 확인필요), 멜론티켓/인터파크(스크랩)

**뉴스/업계**: Billboard/Pitchfork News(스크랩), Music Business Worldwide/Hypebot, 국내 연예뉴스

**어워드**: Grammy/MAMA/가요대상/골든디스크(스크랩, 연1회성, 우선순위 낮음)

**커뮤니티 담론**: Reddit(API, 무료 제한), TikTok(비공식, 난이도 높음), Twitter/X(유료화됨)

### 7.3 접근 방식별 실습 스킬

| 접근 방식 | 대표 소스 | 실습 스킬 |
|---|---|---|
| 정적 스크래핑 | 써클, 빌보드, 웹진 | 보유(BeautifulSoup, RSS) |
| 동적 스크래핑 | Bandcamp, YouTube/Spotify Charts | 보유(Selenium) |
| 공식 REST API | Last.fm, MusicBrainz, Discogs, Reddit | 키 관리, rate limit, 페이지네이션 |
| OAuth2 API | Spotify, YouTube Data | 토큰 발급/갱신, quota 관리 |
| 유료/JWT API | Apple Music | JWT 서명, 개발자 계정 |
| SPARQL | Wikidata | 그래프 쿼리 |

### 7.4 추천 우선순위

**1순위 — 무료/안정적, 지금 축 바로 강화**
- 써클차트 + 빌보드 (차트) → F1 핵심 원천
- Last.fm API (보강) → 무료 안정적, API 연동 실습으로 난이도 적당
- MusicBrainz API (메타) → 표준 식별자 연결, Track B 실질화

**2순위 — 가치 크지만 제약 확인 필요**
- Spotify API(popularity, new-releases, audio-features 제한 확인)
- YouTube Data API(quota 관리)
- 국내 웹진 확장(IZM, 리드머)

**3순위 — 특색/차별화, 나중에**: Reddit API, Genius, Discogs, Shazam

**보류/주의**: 가사 전문(저작권), Apple Music(유료), TikTok/Twitter(비용/난이도), 공연 API(발급 제약)

### 7.5 소스 지도가 로드맵에 주는 함의

- F1: 멜론 단일 → 써클/빌보드/스포티파이/유튜브/애플 다중 소스로 확장, "곡별 크로스 플랫폼 순위" 자체가 강력한 기능
- F2: Last.fm/MusicBrainz/Spotify 보강으로 지표 풍부해짐
- 차원 모델링 보류 재검토: 보강 데이터(장르, 팔로워, 판매량) 생기면 `dim_artist`/`dim_track`에 담을 게 생겨 star schema가 실질을 얻음

---

## 8. 열린 결정사항

- **Landing Zone raw 범위**: (A) 전체 응답 HTML/RSS raw — 재현성 최대, 용량 큼 / (B) 본문 컨테이너 HTML만 — 노이즈 적음, 컨테이너 선택자 오류엔 취약 / (C) 현재 `article_data`(추출 후) — 구현 쉬움, 재현성 문제 해결 안 됨. **미확정, 논의 필요.**
- **파티션 키**: `date/source`(권장, Airflow 실행일과 자연스럽게 맞음, 시간범위 쿼리에 유리) vs `source/date`(소스 단위 백필에 유리). **미확정.**
- **트랙 실행 순서**: 6절 참고, 미확정.
- **dbt 타깃**: 로컬 DuckDB로 시작 확정. BigQuery 전환 시점은 F2-4에서.
- **Kafka 호스팅**: 로컬 Docker로 진행(비용 $0 유지 위해). 매니지드(Confluent Cloud 등)는 배제 방향.
- **차트 스냅샷 주기**: 시간당? 3시간당? 갱신 주기·봇 차단 리스크 고려해 미정.

---

## 9. 의도적으로 보류/축소한 것

- **차원 모델링 (star schema)**: 현 규모(하루 수십 건, 연 수천 행)에선 집계 성능 이득 없음. flat mart(`mart_publish_trend` 등)로 동일 결과. 보강 데이터 생기면 재검토(7.5절).
- **Spark / 분산 처리**: 현 규모에 명백히 과함. 굳이 노출하면 "과거 차트 히스토리 대량 백필" 정도로 제한적, 우선순위 최하.
- **맞춤 추천 (F5)**: 파이프라인 성숙도 축이 아니라 제품/ML 축이라 스킬셋 다름. 별도 트랙, 추후 논의.

---

## 10. 비용 스냅샷 (2026-07-07 논의)

지금 규모(하루 수십 건, 소스 5개) 유지 시 실질 비용 거의 $0.
- 완전 무료(로컬 실행): Landing Zone, dbt-duckdb, Docker Compose 전체 스택, Track B/D 라이브러리
- 무료 티어로 충분: Upstash Redis, BigQuery, GCS, Supabase pgvector
- 유일한 주의 지점: Gemini API를 Track A(NER/감성/임베딩)에 기존 칼럼 백로그 전체 처리로 쓸 경우 1회성 비용 발생 가능 — 로컬 오픈소스 모델(spaCy, sentence-transformers)로 대체하면 $0
- 함정: Kafka를 Confluent Cloud 등 매니지드로 바꾸면 유료 — 계획대로 로컬 Docker 유지

---

## 관련 문서
- 개발 일지: [README.md](README.md)
- 구조/기술 스택: [structure.md](structure.md)
- Airflow 도입 가이드: [AIRFLOW_SETUP.md](AIRFLOW_SETUP.md)
- 단계별 상세 기록(포트폴리오): `../blog/digem/`
