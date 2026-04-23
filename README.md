# dig-em.com
음악 칼럼 자동 수집 및 번역 아카이빙 서비스

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프론트엔드 | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| 백엔드 DB | Supabase (PostgreSQL) |
| 캐시/카운터 | Upstash Redis |
| 번역 AI | Google Gemini 2.5 Flash (`google-generativeai`) |
| 데이터 수집 (정기) | Python 3.13, requests, BeautifulSoup4, feedparser |
| 데이터 수집 (일회성) | Selenium (Chrome headless) |
| 배포 | Vercel (프론트엔드) |

---

## 디렉토리 구조

```
digem/
├── frontend/                    # Next.js 앱
│   ├── app/
│   │   ├── page.tsx             # 홈 (애니메이션 진입)
│   │   ├── layout.tsx           # 루트 레이아웃 (MeshBackground 전역 적용)
│   │   ├── globals.css          # 디자인 토큰 (CSS 커스텀 프로퍼티)
│   │   ├── articles/page.tsx    # 칼럼 목록 (Server Component)
│   │   ├── albums/page.tsx      # 앨범 목록 (Server Component)
│   │   ├── artists/[name]/      # 아티스트 상세 (동적 라우트)
│   │   └── info/page.tsx        # 서비스 소개 페이지
│   ├── components/
│   │   ├── ArticlesClient.tsx   # 칼럼 목록 인터랙션 (use client)
│   │   ├── ArticleDetail.tsx    # 칼럼 본문 + 번역 전환
│   │   ├── AlbumsClient.tsx     # 앨범 그리드 + 필터 (use client)
│   │   ├── ArtistClient.tsx     # 아티스트 앨범 목록 (use client)
│   │   ├── CategoryHeader.tsx   # 공통 헤더 (로고 + 햄버거 메뉴)
│   │   ├── Sidebar.tsx          # 칼럼 목록 사이드바
│   │   └── MeshBackground.tsx   # 마우스 추적 메시 그래디언트 배경
│   ├── lib/
│   │   └── supabase.ts          # Supabase 클라이언트 초기화
│   ├── public/
│   │   ├── files/               # SVG 로고 (pitchfork, stereogum, consequence, bandcamp)
│   │   └── fonts/bjorkfont.ttf
│   ├── next.config.ts
│   └── package.json
│
├── scripts/                     # Python 데이터 파이프라인
│   ├── column/                  # 칼럼 스크래퍼
│   │   ├── base_scraper.py      # 공통 추상 기반 클래스 (parse_date, extract_content, run)
│   │   ├── pitchfork_scrapers.py
│   │   ├── stereogum_scraper.py
│   │   ├── consequence_scraper.py
│   │   └── bandcamp_scraper.py  # Selenium (Cloudflare 봇차단 우회)
│   ├── melon_scraper.py         # 멜론 신보 앨범 수집
│   ├── google_translator.py     # Gemini API 번역 (제목 + 본문)
│   └── database_loader.py       # Supabase INSERT / 중복 체크
│
├── tools/                       # 일회성 유틸리티
│   └── melon_seed.py            # Selenium 기반 멜론 대량 시딩
│
├── requirements.txt
└── README.md
```

---

## 데이터 파이프라인

### 칼럼 수집

모든 칼럼 스크래퍼는 동일한 흐름으로 동작합니다:

```
RSS 파싱 → 카테고리 필터 → 중복 체크 → 전문 크롤링 → Gemini 번역 → Supabase 저장
```

| 스크래퍼 | 출처 | 크롤링 방식 | 수집 카테고리 |
|---|---|---|---|
| `column/pitchfork_scrapers.py` | Pitchfork | requests + BeautifulSoup | Features, The Pitch 칼럼 |
| `column/stereogum_scraper.py` | Stereogum | requests + BeautifulSoup | Columns, Reviews, Lists |
| `column/consequence_scraper.py` | Consequence | requests + BeautifulSoup | Features, Editorials |
| `column/bandcamp_scraper.py` | Bandcamp Daily | Selenium Chrome headless | Features, Lists, Scene Report |

- Gemini 재시도: Exponential Backoff (5s → 10s → 20s, 최대 3회)
- Rate Limit 방지: 기사 사이 10초 대기

### 앨범 수집 (`melon_scraper.py`)

```
멜론 신보 API (국내/해외, 정규/EP)
    → BeautifulSoup 파싱
    → SupabaseLoader.save_album() → albums + artists + album_artists 테이블
```

- 멜론 API 페이지네이션 미지원 → 대량 시딩 시 `tools/melon_seed.py` (Selenium hash URL 방식) 사용

---

## DB 스키마 (Supabase)

| 테이블 | 주요 컬럼 |
|---|---|
| `articles` | id, title, title_ko, content_en, content_ko, source, source_url, author, published_at, thumbnail_url, thumbnail_credit, translation_status, translated_at |
| `albums` | id, title, artist, release_date, artwork_url, album_type, region, source, is_featured |
| `artists` | id, name |
| `album_artists` | album_id, artist_id, order |

- 중복 방지: articles는 `source_url` 기준, albums는 `title + artist` 기준
- RLS 활성화: 퍼블릭 SELECT 전용 정책 (anon 키 노출 대응)

---

## 프론트엔드 아키텍처

- **Server Component / Client Component 분리**: 데이터 fetch는 `page.tsx`(서버), 인터랙션은 `*Client.tsx`(클라이언트)
- **디자인 토큰**: `globals.css` CSS 커스텀 프로퍼티 4색 팔레트 (`#E8D5A0`, `#000`, `#0a3d2e`, `#8a7a5a`)
- **MeshBackground**: `requestAnimationFrame` + lerp(0.04) 마우스 추적 그래디언트, 전역 레이아웃에 적용
- **페이지 전환**: CSS keyframe 애니메이션, `sessionStorage` 플래그로 카테고리 간 이동 시 fade 스킵
- **ArticleDetail**: 번역/원문 전환, sticky 헤더, 썸네일 + 크레딧 표시

---

## 환경변수

| 변수 | 용도 |
|---|---|
| `SUPABASE_URL` | Python 스크립트용 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Python 스크립트용 서비스 롤 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | 프론트엔드 Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 프론트엔드 익명 키 |
| `GEMINI_API_KEY` | Google Gemini 번역 API 키 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (미구현) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis 토큰 (미구현) |

---

## 미구현 / 예정 기능

- [ ] Upstash Redis 조회수 카운터 프론트엔드 연동
- [ ] Rolling Stone 스크래퍼 추가
- [ ] 아티스트 페이지 UUID 기반 라우팅 전환
- [ ] `next/image` + `remotePatterns` 썸네일 전환
- [ ] 기존 레코드 `title_ko` 마이그레이션 스크립트
- [x] 스크래퍼 공통 로직 리팩토링 (`base_scraper.py`)
- [ ] GitHub Actions 자동화

---

## 실행 (가상환경 설정)

```
git clone https://github.com/prgmd/digem.git
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```

### 스크래퍼 실행 (`digem/` 루트에서)

```bash
# 전체 실행 (칼럼 4종 + 멜론 앨범)
python -m scripts.main

# 개별 실행
python -m scripts.column.pitchfork_scrapers
python -m scripts.column.stereogum_scraper
python -m scripts.column.consequence_scraper
python -m scripts.column.bandcamp_scraper
python -m scripts.melon_scraper
```

---

## 📅 개발 진행 상황

### **2026-02-28 (Day 1)**
#### ✅ 완료
- [x] Supabase 프로젝트 생성 및 DB 스키마 설계
  - albums, artists, genres, articles, lyrics, chart_history 테이블 생성
  - 다대다 관계 설계 (album_artists, album_genres, article_albums 등)
- [x] Upstash Redis 생성 (Seoul region)
- [x] GitHub 레포지토리 생성 및 기본 구조 세팅
- [x] 프로젝트 의존성 설정 (requirements.txt)
- [x] 환경변수 템플릿 작성 (.env.example)
- [x] Pitchfork RSS 크롤러 구현 (v0.1)
  - RSS 피드 파싱 (feedparser)
  - 기사 메타데이터 추출 (제목, 저자, 날짜, 요약, 썸네일)
  - 전문 크롤링 (BeautifulSoup)
  - figcaption 필터링 (사진 캡션 제외)
  - 저작권 문구 이후 컨텐츠 제외

---

### **2026-03-04 (Day 2)**
#### ✅ 완료
- [x] Gemini 2.5 Flash 번역 모듈 구현
  - 제목 번역 (아티스트명 원문 병기)
  - 본문 번역 (음악 용어 보존)
  - 재시도 로직 (타임아웃 대응)
- [x] Supabase 데이터 저장 로직 구현
  - articles 테이블 INSERT
  - 중복 체크 (source_url 기준)
  - 새 칼럼만 필터링
- [x] 전체 파이프라인 통합 및 테스트
  - RSS 파싱 → 크롤링 → 번역 → DB 저장
  - 3개 칼럼 성공적으로 저장 확인
- [x] 카테고리 필터링 기능 추가
  - Photo Gallery 제외
  - Interview, Afterword 등만 수집
- [x] 파일 구조 개선
  - scripts 폴더 단일화
  - pitchfork_scraper.py, google_translator.py, database_loader.py

#### 🚧 이슈
- [x] 간헐적 Gemini API 타임아웃 (504 에러)
  - 해결 방안: 재시도 로직 강화 필요

---

### **2026-03-19 (Day 3)**
#### ✅ 완료
- [x] Next.js 프론트엔드 초기 세팅 (`digem/frontend`)
  - `digem-test` 작업 내용 전체 이식 (로고 이미지 제외)
  - 불필요 코드 제거 (Tailwind 임포트, Geist 폰트, grain 애니메이션, 픽셀 그리드 오버레이 등)
- [x] 디자인 토큰 정립 (globals.css)
  - 색상 4종으로 통일: 옅은 베이지(`#E8D5A0`), 검정(`#000`), 짙은 초록(`#0a3d2e`), 메타(`#8a7a5a`)
  - CSS 커스텀 프로퍼티 (`--text-color`, `--meta-color`, `--border`, `--hover-bg`, `--selected-bg` 등)
- [x] Animated Mesh Gradient 배경 구현
  - `MeshBackground.tsx` 컴포넌트 생성 (blurred div 3개)
  - `requestAnimationFrame` + lerp(0.04)로 마우스 추적 그래디언트 이동
  - `layout.tsx`에 전역 적용
- [x] 페이지 전환 애니메이션 통일
  - 홈 입장: `heroSlideUp`, `heroSlideInLeft`, `heroSlideInRight` 순차 애니메이션
  - 카테고리 페이지 입장: `pageFadeIn 0.4s`, 퇴장: `pageFadeOut 0.35s`
  - 카테고리 간 이동 시 전환 효과 제거 (`sessionStorage` `nofade` 플래그)
- [x] Articles 페이지 리디자인
  - 출처 필터를 드롭다운 단일 선택 방식으로 변경 (All 포함)
  - 햄버거 버튼 → 오른쪽 슬라이드 패널 네비게이션 (`menuSlideInRight/OutRight`)
  - 좌측 사이드바 너비 확장 (`480px`)
- [x] Albums 페이지 신규 생성
  - 지역 / 유형 / 연도 / 월 필터 (select)
  - 앨범 그리드 (`auto-fill minmax(180px, 1fr)`), 카드별 staggered fadeIn
- [x] `CategoryHeader` 공유 컴포넌트 추출
  - 로고(좌) + 햄버거(우) + 오른쪽 슬라이드 패널을 단일 컴포넌트로 분리
  - Props: `onLogoClick`, `currentCategory`
  - Articles, Albums 페이지에 공통 적용

#### 🚧 이슈
- [x] 카테고리 간 이동 시 메시 그래디언트 플래시 현상
  - 해결: `sessionStorage` 플래그로 카테고리→카테고리 이동 시 `pageFadeIn` 스킵

---

### **2026-03-20 (Day 4)**
#### ✅ 완료
- [x] Supabase 연동 및 Server Component 전환
  - `lib/supabase.ts` 생성 (클라이언트 설정)
  - `app/articles/page.tsx` → Server Component (`async` 함수, `published_at` 내림차순 fetch)
  - UI/인터랙션 로직 `components/ArticlesClient.tsx`로 분리 (`'use client'`)
- [x] Articles 출처 필터 구조 변경
  - NME, The Wire, Stereogum 제거 → All, Pitchfork, Rolling Stone 3종 고정 탭 버튼
- [x] 사이드바 출처 아이콘 표기
  - Pitchfork: SVG 로고 (`/files/pitchfork.svg`) + `filter: invert(1)`로 흰색 처리
  - Rolling Stone: `RS` 텍스트 배지
- [x] 번역 제목(`title_ko`) 파이프라인 통합
  - `pitchfork_scrapers.py` `article_data`에 `title_ko` 추가
  - `database_loader.py` `save_article()`에 `title_ko` 저장
  - 프론트엔드 사이드바 및 상세 페이지 제목 `title_ko` 우선 표시
- [x] 썸네일 파이프라인 통합
  - `pitchfork_scrapers.py` `article_data`에 `thumbnail_url` 추가
  - `database_loader.py` `save_article()`에 `thumbnail_url` 저장
  - `ArticleDetail`에 썸네일 이미지 표시 (제목 상단)
- [x] 원문 보기 링크 추가
  - `ArticleDetail` 메타 정보 줄에 `source_url` 기반 외부 링크
- [x] 번역 품질 개선 (Gemini 프롬프트)
  - 마크다운 문법 출력 금지 (`**`, `*`, `#` 등)
  - 본문 무관 내용 제거 지시 (더 보기, 광고, 뉴스레터 구독 유도 등)
- [x] 프론트엔드 콘텐츠 클리닝
  - `renderContent()` 함수: `더 보기` 라인 필터링 + `**bold**`/`*italic*` 마크다운 → HTML 변환
- [x] Mesh Gradient 블롭 초기 위치 랜덤화
  - 페이지 로드마다 3개 블롭 위치 랜덤 배치 (JS 초기화, CSS 고정값 제거)
- [x] .gitignore 수정
  - Python 템플릿의 `lib/` 무시 규칙으로 `frontend/lib/`가 누락되는 문제 해결 (`!frontend/lib/` 예외 추가)

#### 🚧 이슈
- [x] Vercel 배포 시 `sessionStorage is not defined` 오류
  - 해결: `useState` 초기화 함수 내 `typeof sessionStorage === 'undefined'` 가드 추가
- [x] Vercel 배포 시 `supabaseUrl is required` 오류
  - 해결: `.gitignore`의 `lib/` 규칙으로 `frontend/lib/supabase.ts` 미포함 → 예외 규칙 추가

---

### **2026-03-20 (Day 4 - 후반)**
#### ✅ 완료
- [x] Supabase `articles` 테이블 `title_ko`, `thumbnail_url` 컬럼 추가
- [x] Albums 페이지 Supabase 연동 및 Server Component 전환
  - `app/albums/page.tsx` → Server Component, `components/AlbumsClient.tsx` 분리
  - 기본 필터 전부 `all`, 페이지당 30개 번호 페이지네이션
  - `is_featured` 컬럼 추가 및 추천 탭 필터 구현
- [x] 멜론 스크래퍼 파이프라인 완성
  - `melon_scraper.py` 신규 작성 (국내/해외 정규/EP 수집)
  - `database_loader.py` 앨범 저장 메서드 추가 (`save_album`, `filter_new_albums`)
  - 앨범 저장 시 `artists` 테이블 `get_or_create` + `album_artists` 자동 연결
- [x] 아티스트 페이지 신규 생성
  - `app/artists/[name]/page.tsx` — 아티스트명 기반 라우팅, album_artists 조인으로 앨범 목록 fetch
  - `components/ArtistClient.tsx` — 뒤로가기 + 아티스트명 + 앨범 그리드 (간결한 구성)
  - Albums 그리드에서 아티스트명 클릭 시 이동
- [x] 번역 프롬프트 개선
  - 아티스트명 첫 언급만 한글(영문) 병기, 이후 한글만 사용
  - 앨범명·싱글명·곡명 원문 유지
  - 장르·음악 용어 등 생소한 단어에 한해 병기 유지
- [x] ArticleDetail UX 개선
  - 원문 전환 시 제목도 영어 원제로 변경
  - 썸네일 본문 바로 위로 이동
  - 썸네일 로딩 완료 후 본문과 함께 표시 (스피너 로딩 UI)
  - 본문 양쪽 맞춤 (`text-align: justify`) + `word-break: keep-all`
  - 본문 영역 중앙 정렬 (`margin: 0 auto`)
- [x] 추천작(`is_featured`) 강조 디자인
  - 썸네일 초록 outline 테두리
  - 왼쪽 상단 초록 배경 흰 글자 `d` 뱃지 (bjorkfont)
- [x] 모바일 반응형 개선
  - `html { font-size: 14px }` 모바일 전체 글씨 축소
  - CategoryHeader, Sidebar, ArticleDetail 모바일 패딩 축소
- [x] `tools/melon_seed.py` 신규 작성
  - Selenium 기반 일회성 대량 시딩 스크립트 (국내/해외 각 N페이지)
  - `tools/` 폴더로 메인 파이프라인과 분리
- [x] ArticleDetail 본문 max-width 760px 제한 + 스크롤 렉 개선
  - mesh blob `filter: blur` 70px 축소 + `will-change: transform` + `translateZ(0)` 추가

#### 🚧 이슈
- [ ] 멜론 API 페이지네이션 미지원 — `startIndex`, `pageIndex` 등 모든 파라미터 무시됨
  - `tools/melon_seed.py` Selenium으로 우회 (hash URL 방식)

---

### **2026-03-23 (Day 5)**
#### ✅ 완료
- [x] 홈 페이지 세로 레이아웃 개선
  - 구분선(`hr`)이 정확히 `50vh`에 위치하도록 상/하 절반 flex 분리
  - 로고·태그라인은 상단 절반 하단 정렬, 네비게이션은 하단 절반 상단 정렬
  - 모바일에서 콘텐츠가 아래로 쏠리던 문제 해결
- [x] ArticleDetail sticky 헤더 도입
  - `← 목록` + `원문/번역` 버튼을 스크롤에 고정되는 상단 바로 분리 (높이 44px)
  - 모바일에서 긴 본문 스크롤 시에도 뒤로가기·언어 전환 항상 접근 가능
- [x] 햄버거 메뉴 패널 너비 축소
  - 고정 `220px` → `fit-content`로 변경, Articles/Albums 텍스트 너비에 자동 맞춤
- [x] Albums 그리드 반응형 고정 열 수 적용
  - `auto-fill minmax` 방식 폐기 → 브레이크포인트별 고정 열: `≥1200px` 6열, `900–1199px` 5열, `768–899px` 3열, `<768px` 2열
  - 항상 정확히 30개 표시 → 마지막 줄 빈 공간 문제 자연 해결
  - 6열 기준 `maxWidth: 1200px` 중앙 정렬로 초광폭 화면 대응
- [x] Albums 모바일 그리드 잘림 수정
  - grid item에 `minWidth: 0` 추가 — `whiteSpace: nowrap` 텍스트가 `1fr` 셀을 밀어내던 CSS Grid 기본값 문제 해결
- [x] 썸네일 저작권 크레딧 파이프라인 추가
  - `pitchfork_scrapers.py` — `fetch_full_content` 반환값을 dict로 변경, 첫 번째 `<figure>` → `<figcaption>` 텍스트를 `thumbnail_credit`으로 추출
  - `database_loader.py` — `save_article`에 `thumbnail_credit` 저장 추가
  - Supabase `articles` 테이블에 `thumbnail_credit TEXT` 컬럼 추가
  - `ArticleDetail.tsx` — 썸네일 이미지 하단 왼쪽에 크레딧 텍스트 표시 (`0.8rem`, `var(--meta-color)`)
- [x] Info 페이지 신규 생성 (`/info`)
  - 햄버거 메뉴 맨 하단(구분선 아래)에서만 접근 가능
  - About / 저작권 / 폰트 세 섹션으로 구성
  - 햄버거 패널 항목 가로 중앙 정렬 적용
  - bjorkfont 출처 수정 (FontZone 무료 배포 서체, 제작자 미상)
- [x] 카카오톡 인앱 브라우저 로고 잘림 수정
  - `html`에 `overflow-x: hidden` + `max-width: 100%` 추가 — 블롭 translate 시 body 폭이 순간 확장되던 문제 차단

---

### **2026-04-07 (Day 6)**
#### ✅ 완료
- [x] Python 3.13 호환성 수정 (requirements.txt)
  - `pydantic==2.5.3` → `2.10.6` (Python 3.13 pre-built wheel 없어 Rust 컴파일 시도 → 실패)
  - `lxml==5.1.0` → `5.3.0` (동일 원인)
- [x] `melon_scraper.py` 실행 — 국내/해외 정규·EP 7개 신규 저장
- [x] `pitchfork_scrapers.py` The Pitch 칼럼 피드 추가
  - `COLUMN_URL` 추가 (`feed-the-pitch/rss`), 기존 `RSS_URL` → `FEATURE_URL` rename
  - `fetch_latest_reviews` 분리: `fetch_features()` / `fetch_columns()` / `_fetch_feed()` (private)
    - The Pitch 피드는 칼럼 전용이므로 `filter_categories=False` 캡슐화
  - 중복 `filter_new_articles` 이중 호출 버그 수정
- [x] `pitchfork_scrapers.py` 실행 — features 2개 + columns 3개 수집, 신규 3개 번역 후 저장

---

### **2026-04-20 (Day 7)**
#### ✅ 완료
- [x] Supabase RLS 적용
  - `articles`, `albums`, `artists`, `album_artists` 테이블 RLS 활성화
  - 퍼블릭 SELECT 전용 정책 추가 (anon 키 노출 대응)
- [x] iOS WebKit 메인 로고 잘림 수정
  - iPhone Chrome(WebKit)에서 `heroSlideInRight` 애니메이션이 순간적으로 레이아웃 너비를 확장, 중앙 정렬된 `digem` 로고 오른쪽이 잘리는 현상
  - `app/page.tsx` 최상단 div에 `width: '100%'`, `overflowX: 'hidden'` 추가
- [x] Stereogum 스크래퍼 추가 (`scripts/stereogum_scraper.py`)
  - RSS 피드 파싱 (Columns, Reviews, Lists 카테고리 필터)
  - BeautifulSoup 전문 크롤링 + 썸네일 크레딧 추출
  - Gemini 번역 → Supabase 저장 파이프라인 연결
- [x] Consequence 스크래퍼 추가 (`scripts/consequence_scraper.py`)
  - Features(`?feed=rss2`), Editorials 두 피드 수집
  - `/feed/` 경로 차단 우회: `?feed=rss2` 파라미터 사용
- [x] Supabase service_role 키 오류 수정
  - `scripts/.env`의 anon/service_role 키 혼용 문제 확인 및 수정
  - JWT 디코딩으로 키 role 검증
- [x] 출처 아이콘 SVG 확장
  - `Sidebar.tsx` `SourceBadge` 리팩토링 — SVG 출처 맵(`SVG_SOURCES`) 도입
  - Stereogum, Consequence SVG 로고 추가 (`public/files/`)

---

### **2026-04-23 (Day 9)**
#### ✅ 완료
- [x] `pitchforkScraper` → `PitchforkScraper` 클래스명 PEP 8 수정
- [x] Pitchfork 저작권 체크 개선
  - `'© 2026 Condé Nast' in text or '© 2025 Condé Nast'` → `'Condé Nast' in text` (연도 하드코딩 제거)
- [x] `STRUCTURE.md` 삭제 → 내용을 `README.md` 상단에 통합
  - 기술 스택, 디렉토리 구조, 데이터 파이프라인, DB 스키마, 환경변수 섹션 추가
  - 디렉토리 구조에 Day 7/8에 추가된 스크래퍼 파일 반영
- [x] `README.md` 개발 일지 정리
  - 날짜 순서 수정 (Day 5→6→7→8 순으로 재배치)
  - 일별 "다음 단계" 섹션 제거 → 상단 "미구현 / 예정 기능" 섹션에서 단일 관리
  - Day 8 완료된 항목이 다음 단계에 중복 기재되던 문제 수정
- [x] 칼럼 스크래퍼 `scripts/column/` 패키지로 분리
  - `scripts/__init__.py`, `scripts/column/__init__.py` 추가 (패키지화)
  - `pitchfork_scrapers.py`, `stereogum_scraper.py`, `consequence_scraper.py`, `bandcamp_scraper.py` 이동
  - 상대 import 방식으로 전환 (`from .base_scraper import BaseScraper` 등)
- [x] `scripts/column/base_scraper.py` 신규 작성
  - 4개 스크래퍼에 중복되던 공통 로직 추상 기반 클래스로 통합
  - `_parse_date()` — 동일 구현이 4개 파일에 복사되던 것
  - `_extract_content()` — figure 크레딧 + 단락 파싱 공통 헬퍼 (container selector, stop condition 파라미터)
  - `run()` — 수집 → 중복체크 → 크롤링 → 번역 → 저장 → sleep 전체 파이프라인
  - `article_data` dict 구성 — 4곳에서 반복되던 것 일원화
- [x] `BandcampDailyScraper` 구조 개선
  - `__del__` 제거 → `run()` override + `finally` 블록으로 드라이버 정리 보장
  - `__init__`에서 즉시 초기화하던 Selenium 드라이버 → `_get_driver()` 지연 초기화로 전환
- [x] `melon_scraper.py` 개선
  - 모듈 수준 `main()` → 클래스 메서드 `run()`으로 전환
  - import를 상대경로(`from .database_loader import SupabaseLoader`)로 수정
- [x] `scripts/main.py` 신규 작성
  - 칼럼 4종 + 멜론 앨범 전체 파이프라인을 단일 진입점에서 실행
  - 실행: `python -m scripts.main` (정기 자동화 대비)

---

### **2026-04-20 (Day 8)**
#### ✅ 완료
- [x] 프론트엔드 출처 필터 탭 확장
  - `ArticlesClient.tsx` SOURCES Rolling Stone 제거 → Stereogum, Consequence, Bandcamp 추가
- [x] 출처 아이콘 Bandcamp SVG 추가 및 Stereogum 색반전 제외
  - `Sidebar.tsx` `INVERT_SOURCES` Set 도입으로 출처별 invert 개별 제어
- [x] `ArticleDetail` UI 개선
  - 이미지·본문 중앙 정렬 불일치 수정 (본문 `maxWidth: 720px` 제거)
  - 원문 보기 메타 텍스트에서 분리 → 썸네일 하단 단독 버튼으로 변경 (베이지 배경 + 검정 글씨)
- [x] Bandcamp Daily 스크래퍼 추가 (`scripts/bandcamp_scraper.py`)
  - RSS 피드 파싱 (Features, Lists, Scene Report 카테고리 필터)
  - Cloudflare 봇 차단 우회: Selenium Chrome headless로 본문 크롤링
  - `requirements.txt`에 `selenium>=4.20.0` 추가
- [x] Consequence 썸네일 크레딧 RSS 직접 수집
  - `media:copyright` 필드를 RSS 파싱 시 바로 추출 (HTML 스크래핑 불필요)
  - HTML figcaption 폴백 유지
