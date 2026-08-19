-- 번역 실패 사유 저장용 컬럼 추가
-- Supabase 콘솔 → SQL Editor 에서 1회 실행.
--
-- 배경: 번역에 실패한 기사도 translation_status = 'failed' 로 저장해 재수집을 막고 있다.
-- 그런데 사유가 실행 로그에만 남고 DB에는 없어, 로그가 사라지면 원인을 알 수 없었다.
-- (해당 기사는 source_url 중복 체크에 걸려 다시 수집되지 않으므로 재현도 불가능)

alter table public.articles
  add column if not exists translation_error text;

comment on column public.articles.translation_error is
  '번역 실패 사유. "단계: 유형: 상세" 형식 (예: content: http_429: RESOURCE_EXHAUSTED ...). status=success 이면 NULL.';

-- 참고: 실패 사유별 집계
--
-- select
--   split_part(translation_error, ':', 2) as reason,
--   count(*),
--   max(published_at) as last_seen
-- from public.articles
-- where translation_status = 'failed'
-- group by 1
-- order by 2 desc;
