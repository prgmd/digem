# digem

> dig your uncut gems

해외 음악 미디어(Pitchfork, Stereogum, Consequence, Bandcamp)의 글을 번역해 모아보는 음악 큐레이션 서비스.

---

## 기술 스택

| 분류 | 스택 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript 5 (strict) |
| 스타일 | CSS Variables + 인라인 스타일 + CSS 클래스 |
| 백엔드 | Supabase (PostgreSQL) |
| 폰트 | BookkMyungjo / BookkGothic (교보문고), bjorkfont (커스텀) |

---

## 시작하기

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

`.env` 파일에 Supabase 환경변수를 설정해야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 프로젝트 구조

```
app/
├── page.tsx                  # 홈 (랜딩)
├── articles/
│   ├── page.tsx              # 글 목록 (SSR, Supabase fetch)
│   ├── error.tsx             # 글 목록 에러 화면
│   └── loading.tsx           # 로딩 fallback
├── albums/
│   ├── page.tsx              # 앨범 그리드 (SSR, Supabase fetch)
│   ├── error.tsx             # 앨범 에러 화면
│   └── loading.tsx           # 로딩 fallback
├── artists/[name]/
│   └── page.tsx              # 아티스트 상세 (동적 라우트)
└── info/
    └── page.tsx              # 소개 페이지

components/
├── ArticlesClient.tsx        # 글 목록 클라이언트 컴포넌트
├── ArticleDetail.tsx         # 글 상세 뷰 (언어 토글)
├── AlbumsClient.tsx          # 앨범 그리드 클라이언트 컴포넌트
├── ArtistClient.tsx          # 아티스트 상세
├── CategoryHeader.tsx        # 상단 헤더 + 햄버거 메뉴
├── HomeNav.tsx               # 홈 네비게이션
├── MeshBackground.tsx        # 애니메이션 배경
├── Sidebar.tsx               # 글 목록 사이드바
├── Spinner.tsx               # 공통 로딩 스피너
└── useAlbumFilters.ts        # 앨범 필터 상태 훅 (URL 기반)

lib/
├── styles.ts                 # 공통 스타일 상수
└── supabase.ts               # Supabase 클라이언트
```

---

## 라우트 구조

| 경로 | 설명 |
|------|------|
| `/` | 홈 |
| `/articles?source=X&page=Y` | 글 목록 (출처 필터, 페이지네이션) |
| `/albums?region=X&type=Y&year=Z&month=W&featured=true&page=N` | 앨범 그리드 (다중 필터, URL 동기화) |
| `/artists/[name]` | 아티스트 상세 |
| `/info` | 소개 |

---

## Changelog

### 2026-05-01

**에러 핸들링 추가**
- `app/articles/page.tsx`, `app/albums/page.tsx`: Supabase 쿼리 실패 시 `throw error`로 Next.js 에러 경계에 위임
- `app/articles/error.tsx`, `app/albums/error.tsx` 신규 생성 — 에러 발생 시 "다시 시도" 버튼이 있는 에러 화면 표시
- 기존: 오류 발생 시 빈 화면만 표시되어 유저가 원인을 알 수 없었음

**빈 결과 상태(Empty State) UI 추가**
- `Sidebar.tsx`: 글이 0개일 때 "해당하는 글이 없어요." 메시지 표시
- `AlbumsClient.tsx`: 필터 결과가 0개일 때 "필터에 맞는 앨범이 없어요." 메시지 표시

**AlbumsClient 로직 분리**
- `components/useAlbumFilters.ts` 신규 생성 — 필터 상태 관리 로직을 커스텀 훅으로 분리
- `AlbumsClient.tsx`에서 필터 8개 상태와 계산 로직 제거 → 훅 호출로 대체
- 컴포넌트 책임이 명확해져 유지보수성 향상

**앨범 그리드 반응형을 JS → CSS로 전환**
- 기존: `useEffect` + `window.innerWidth` 감지 → `columns` 상태 → `gridTemplateColumns` 인라인 스타일
- 변경: `globals.css`에 `.album-grid`, `.album-filter-bar`, `.album-grid-wrapper` 클래스 추가, CSS 미디어 쿼리로 처리
- JS 기반 방식은 서버 렌더 시 `window` 객체 부재로 기본값(6열)이 먼저 그려진 뒤 변경되는 깜빡임(hydration mismatch)이 있었음

**Albums 필터 상태 URL 동기화**
- `useAlbumFilters.ts`에서 `useSearchParams` + `router.replace()` 사용
- 필터 변경 시 URL 쿼리스트링 자동 업데이트 (`?region=국내&type=EP&year=2024`)
- 새로고침해도 필터 유지, 링크 공유 가능, 뒤로가기 동작 자연스러움
- `app/albums/page.tsx`에 `<Suspense>` 래퍼 추가 (`useSearchParams` 요구사항)

**공통 스타일 파일 분리**
- `components/Spinner.tsx` 신규 생성 — `ArticleDetail`, `AlbumsClient`에 중복된 스피너 HTML/스타일 통합
- `lib/styles.ts` 신규 생성 — `selectStyle`, `tabStyle`, `ghostButtonStyle`, `pageButtonStyle` 공통 스타일 상수
- error 페이지 버튼 스타일, 앨범 페이지네이션 버튼 스타일 → `lib/styles.ts` 참조로 교체

**디자인 개선**
- 사이트 전체 초록 계열 컬러 제거 — amber 계열(`#2a1800`, `#3d2500`)로 통일
- 메시 배경 blob 색상 green → amber(`#3d2500`, `#5c3800`, `#1a0e00`)로 교체
- 앨범 카드 hover 시 픽셀 그림자 효과 추가 — `translate(-2px,-2px)` + `box-shadow: 4px 4px 0 var(--meta-color)`
- featured 앨범 뱃지/아웃라인 색상 hardcode green → `var(--meta-color)` 교체
- 홈 tagline(`dig ur uncut gems.`) — BookkMyungjo 적용
- 홈 네비게이션(Articles, Albums) — BookkMyungjo 적용
- 디자인 시스템 테스트 페이지 추가 (`app/test/page.tsx`) — 1-bit phosphor green 가안

**폰트 교체**
- Noto Serif KR(Google Fonts) 제거 — 외부 네트워크 요청 의존성 제거
- BookkMyungjo Light/Bold, BookkGothic Light/Bold 로컬 폰트로 등록 (`public/fonts/`)
- `font-display: swap` 적용 — 폰트 로딩 중 텍스트 즉시 표시
- `info/page.tsx` 폰트 크레딧 업데이트

**Articles 글 전환 애니메이션**
- `ArticleDetail.tsx` — 글 선택 시 `pageFadeIn 0.25s` 적용
- `key={article.id}` 리마운트를 활용해 추가 상태 없이 구현
