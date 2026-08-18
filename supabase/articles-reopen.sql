-- ============================================================
-- 칼럼(articles) 재공개 — articles-close.sql 원복
-- 실행 위치: Supabase 대시보드 > SQL Editor
-- ============================================================
--
-- 주의: 이 스크립트를 실행하기 전에 저작권 정합성 정리가
-- 끝났는지 먼저 확인할 것. 최소 조건 예시는
-- docs/09-copyright-review.md 의 "재공개 전 체크리스트" 참고.
--
-- 프론트엔드도 함께 열어야 한다:
--   Vercel 환경변수 NEXT_PUBLIC_ARTICLES_ENABLED=true 설정 후 재배포.
--   (NEXT_PUBLIC_ 변수는 빌드 타임에 인라인되므로 재배포 필수)

grant select on public.articles to anon;
grant select on public.articles to authenticated;

-- 검증
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'articles'
order by grantee, privilege_type;

-- 기존 RLS 정책은 close 시점에 건드리지 않았으므로 그대로 유효하다.
-- 혹시 정책이 사라졌다면 아래를 참고해 재생성:
--   create policy "public read" on public.articles
--     for select to anon, authenticated using (true);
