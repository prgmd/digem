'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Album } from './AlbumsClient'

export function useAlbumFilters(albums: Album[]) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedRegion = searchParams.get('region') ?? 'all'
  const selectedType   = searchParams.get('type')   ?? 'all'
  const selectedYear   = searchParams.get('year')   ?? 'all'
  const selectedMonth  = searchParams.get('month')  ?? 'all'
  const featuredOnly   = searchParams.get('featured') === 'true'
  const page           = Math.max(1, Number(searchParams.get('page') ?? 1))

  // URL 업데이트 (필터 변경 시 page는 자동으로 1로 리셋)
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

  const filtered = albums.filter(album => {
    const albumYear  = new Date(album.release_date).getFullYear().toString()
    const albumMonth = (new Date(album.release_date).getMonth() + 1).toString()
    return (
      (selectedRegion === 'all' || album.region      === selectedRegion) &&
      (selectedType   === 'all' || album.album_type  === selectedType)   &&
      (selectedYear   === 'all' || albumYear          === selectedYear)   &&
      (selectedMonth  === 'all' || albumMonth         === selectedMonth)  &&
      (!featuredOnly || album.is_featured)
    )
  })

  const availableYears = [
    'all',
    ...Array.from(new Set(albums.map(a => new Date(a.release_date).getFullYear().toString())))
      .sort((a, b) => Number(b) - Number(a)),
  ]

  return {
    filters: { selectedRegion, selectedType, selectedYear, selectedMonth, featuredOnly, page },
    actions: {
      setSelectedRegion: (v: string) => updateUrl({ region: v }),
      setSelectedType:   (v: string) => updateUrl({ type: v }),
      setSelectedYear:   (v: string) => updateUrl({ year: v }),
      setSelectedMonth:  (v: string) => updateUrl({ month: v }),
      setFeaturedOnly:   (v: boolean) => updateUrl({ featured: String(v) }),
      setPage:           (p: number) => updateUrl({ page: String(p) }, true),
    },
    filtered,
    availableYears,
  }
}
