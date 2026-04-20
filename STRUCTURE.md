# dig-em 프로젝트 구조

음악 웹진 칼럼 자동 수집·번역·아카이빙 서비스.

---

## 기술 스택 요약

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
├── frontend/                  # Next.js 앱
│   ├── app/                   # App Router 페이지
│   │   ├── page.tsx           # 홈 (애니메이션 진입)
│   │   ├── layout.tsx         # 루트 레이아웃 (MeshBackground 전역 적용)
│   │   ├── globals.css        # 디자인 토큰 (CSS 커스텀 프로퍼티)
│   │   ├── articles/page.tsx  # 칼럼 목록 (Server Component)
│   │   ├── albums/page.tsx    # 앨범 목록 (Server Component)
│   │   ├── artists/[name]/    # 아티스트 상세 (동적 라우트)
│   │   └── info/page.tsx      # 서비스 소개 페이지
│   ├── components/
│   │   ├── ArticlesClient.tsx # 칼럼 목록 인터랙션 (use client)
│   │   ├── ArticleDetail.tsx  # 칼럼 본문 + 번역 전환
│   │   ├── AlbumsClient.tsx   # 앨범 그리드 + 필터 (use client)
│   │   ├── ArtistClient.tsx   # 아티스트 앨범 목록 (use client)
│   │   ├── CategoryHeader.tsx # 공통 헤더 (로고 + 햄버거 메뉴)
│   │   ├── Sidebar.tsx        # 칼럼 목록 사이드바
│   │   └── MeshBackground.tsx # 마우스 추적 메시 그래디언트 배경
│   ├── lib/
│   │   └── supabase.ts        # Supabase 클라이언트 초기화
│   ├── public/
│   │   ├── files/pitchfork.svg
│   │   └── fonts/bjorkfont.ttf
│   ├── next.config.ts
│   └── package.json
│
├── scripts/                   # Python 데이터 파이프라인 (정기 실행)
│   ├── pitchfork_scrapers.py  # Pitchfork RSS 수집 + 전문 크롤링
│   ├── google_translator.py   # Gemini API 번역 (제목 + 본문)
│   ├── melon_scraper.py       # 멜론 신보 앨범 수집
│   └── database_loader.py     # Supabase INSERT / 중복 체크
│
├── tools/                     # 일회성 유틸리티
│   └── melon_seed.py          # Selenium 기반 멜론 대량 시딩
│
├── requirements.txt
└── README.md
```

---

## 데이터 파이프라인

### 칼럼 수집 (`pitchfork_scrapers.py`)

```
Pitchfork RSS (features / the-pitch)
    → feedparser 파싱 → 카테고리 필터
    → BeautifulSoup 전문 크롤링 + 썸네일 크레딧 추출
    → GeminiTranslator (제목 + 본문 한국어 번역)
    → SupabaseLoader.save_article() → articles 테이블
```

- Features 피드: `feed-features/rss` (ALLOWED_CATEGORIES 필터 적용)
- Columns 피드: `feed-the-pitch/rss` (필터 없음)
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

중복 방지: articles는 `source_url` 기준, albums는 `title + artist` 기준.

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

- Upstash Redis 조회수 카운터 프론트엔드 연동
- Rolling Stone 스크래퍼 추가
- 아티스트 페이지 UUID 기반 라우팅 전환
- `next/image` + `remotePatterns` 썸네일 전환
- 기존 레코드 `title_ko` 마이그레이션 스크립트
