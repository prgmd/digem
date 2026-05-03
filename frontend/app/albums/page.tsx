import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import AlbumsClient, { Album } from '@/components/AlbumsClient'
import Loading from './loading'

const PAGE_SIZE = 30

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page      = Math.max(1, Number(searchParams.page ?? 1))
  const region    = typeof searchParams.region === 'string' ? searchParams.region : 'all'
  const albumType = typeof searchParams.type   === 'string' ? searchParams.type   : 'all'
  const year      = typeof searchParams.year   === 'string' ? searchParams.year   : 'all'
  const month     = typeof searchParams.month  === 'string' ? searchParams.month  : 'all'
  const featured  = searchParams.featured === 'true'

  // month-only (year = 'all') 인 경우 서버에서 월 필터 불가 → 클라이언트 처리
  const isMonthOnly = month !== 'all' && year === 'all'

  let query = supabase
    .from('albums')
    .select('*', { count: 'exact' })
    .order('release_date', { ascending: false })

  if (region !== 'all')    query = query.eq('region', region)
  if (albumType !== 'all') query = query.eq('album_type', albumType)
  if (featured)            query = query.eq('is_featured', true)

  if (year !== 'all' && month !== 'all') {
    const m = month.padStart(2, '0')
    query = query
      .gte('release_date', `${year}-${m}-01`)
      .lte('release_date', `${year}-${m}-31`)
  } else if (year !== 'all') {
    query = query
      .gte('release_date', `${year}-01-01`)
      .lte('release_date', `${year}-12-31`)
  }

  // month-only는 전체 로드 후 클라이언트 필터, 그 외엔 서버 페이지네이션
  if (isMonthOnly) {
    query = query.limit(2000)
  } else {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  }

  const [{ data, error, count }, { data: yearRows }] = await Promise.all([
    query,
    supabase.from('albums').select('release_date').not('release_date', 'is', null),
  ])

  if (error) throw error

  const availableYears = [
    'all',
    ...Array.from(
      new Set((yearRows ?? []).map(a => new Date(a.release_date).getFullYear().toString()))
    ).sort((a, b) => Number(b) - Number(a)),
  ]

  return (
    <Suspense fallback={<Loading />}>
      <AlbumsClient
        albums={(data ?? []) as Album[]}
        totalCount={count ?? 0}
        availableYears={availableYears}
        monthFilter={month}
      />
    </Suspense>
  )
}
