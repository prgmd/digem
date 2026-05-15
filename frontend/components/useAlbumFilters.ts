'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function useAlbumFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedRegion = searchParams.get('region')  ?? 'all'
  const selectedType   = searchParams.get('type')    ?? 'all'
  const selectedYear   = searchParams.get('year')    ?? 'all'
  const selectedMonth  = searchParams.get('month')   ?? 'all'
  const featuredOnly   = searchParams.get('featured') === 'true'
  const page           = Math.max(1, Number(searchParams.get('page') ?? 1))

  const updateUrl = (changes: Record<string, string>, keepPage = false) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(changes).forEach(([key, val]) => {
      if (!val || val === 'all' || val === 'false') params.delete(key)
      else params.set(key, val)
    })
    if (!keepPage) params.delete('page')
    const qs = params.toString()
    router.replace(`/albums${qs ? `?${qs}` : ''}`)
  }

  return {
    filters: { selectedRegion, selectedType, selectedYear, selectedMonth, featuredOnly, page },
    actions: {
      setSelectedRegion: (v: string)  => updateUrl({ region: v }),
      setSelectedType:   (v: string)  => updateUrl({ type: v }),
      setSelectedYear:   (v: string)  => updateUrl({ year: v }),
      setSelectedMonth:  (v: string)  => updateUrl({ month: v }),
      setFeaturedOnly:   (v: boolean) => updateUrl({ featured: String(v) }),
      setPage:           (p: number)  => updateUrl({ page: String(p) }, true),
    },
  }
}
