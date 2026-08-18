/**
 * 기능 플래그.
 *
 * ── 칼럼(articles) 섹션 임시 비공개 ──────────────────────────────
 * 2026-08-18, 원문 매체 저작권 검토를 위해 칼럼 섹션을 비공개 전환.
 *
 * 근거 요약 (상세: docs/09-copyright-review.md)
 * - 무단 번역은 그 자체로 2차적저작물작성권 침해 (저작권법 제22조).
 *   원문이 무료 공개인지 유료인지는 침해 성립과 무관하다.
 * - 웹 게시는 공중송신에 해당하므로 사적이용 면책(제30조)이 적용되지 않는다.
 * - 다만 형사 리스크는 낮다: 비영리 개인 프로젝트는 친고죄(제140조)이며,
 *   '영리 목적'은 침해로 직접 대가를 받는 경우로 한정 해석된다.
 *   현실적 리스크는 DMCA 테이크다운 / 이용료 상당액 기준 민사 청구.
 *
 * 중요: 이 플래그는 화면 노출만 막는다. 실제 데이터 접근 차단은
 * Supabase RLS 정책에서 이루어진다 (supabase/articles-close.sql).
 * 프론트만 막으면 anon 키가 브라우저 번들에 그대로 노출되어 있어
 * 누구나 Supabase REST 엔드포인트를 직접 조회할 수 있다.
 *
 * 재공개: NEXT_PUBLIC_ARTICLES_ENABLED=true 설정 후 재배포
 *        + RLS 정책 원복(supabase/articles-reopen.sql).
 *
 * 기본값 false (fail closed) — 환경변수가 없으면 비공개를 유지한다.
 */
export const ARTICLES_ENABLED = process.env.NEXT_PUBLIC_ARTICLES_ENABLED === 'true'

/**
 * 프론트에 노출할 칼럼 출처 화이트리스트.
 *
 * 여기 없는 source 는 DB에 남아 있어도 화면에 나오지 않는다.
 * 데이터를 지우지 않고 노출만 끄기 위한 장치 — 되돌리려면 배열에 다시 추가하면 된다.
 *
 * 제외 이력
 *   'bandcamp' — 2026-08-18. Acceptable Use Policy가 스크래핑을 명시 금지.
 *                수집도 중단(scripts/main.py, Airflow DAG에서 제외).
 *                기존 수집분은 DB에 그대로 보존. docs/09-copyright-review.md §2.4
 *
 * 화이트리스트(제외 목록이 아니라)로 둔 이유: 새 스크래퍼를 붙였을 때
 * 명시적으로 등록하기 전까지는 노출되지 않는다 (fail closed).
 */
export const VISIBLE_SOURCES = ['pitchfork', 'stereogum', 'consequence'] as const
