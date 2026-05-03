'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'
import Spinner from '@/components/Spinner'
import { useAlbumFilters } from '@/components/useAlbumFilters'
import { selectStyle, tabStyle, pageButtonStyle } from '@/lib/styles'

export interface Album {
  id: string
  title: string
  artist: string
  artwork_url: string
  release_date: string
  region: string
  album_type: string
  is_featured: boolean
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}/${m}/${d}`
}

const PAGE_SIZE_CLIENT = 30

interface Props {
  albums: Album[]
  totalCount: number
  availableYears: string[]
  monthFilter: string
}

export default function AlbumsClient({ albums, totalCount, availableYears, monthFilter }: Props) {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null)
  const [fadeIn] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true
    const skip = sessionStorage.getItem('nofade')
    if (skip) { sessionStorage.removeItem('nofade'); return false }
    return true
  })

  const { filters, actions } = useAlbumFilters()
  const { selectedRegion, selectedType, selectedYear, selectedMonth, featuredOnly, page } = filters
  const { setSelectedRegion, setSelectedType, setSelectedYear, setSelectedMonth, setFeaturedOnly, setPage } = actions

  const handleExitToHome = () => {
    setIsExiting(true)
    setTimeout(() => router.push('/'), 350)
  }

  const availableMonths = ['all', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())]

  // month-only 케이스: 서버가 월 필터 미적용 → 클라이언트에서 처리
  const isMonthOnly = monthFilter !== 'all' && selectedYear === 'all'
  const displayAlbums = isMonthOnly
    ? albums.filter(a => (new Date(a.release_date).getMonth() + 1).toString() === monthFilter)
    : albums

  const totalPages = isMonthOnly
    ? Math.ceil(displayAlbums.length / PAGE_SIZE_CLIENT)
    : Math.ceil(totalCount / PAGE_SIZE_CLIENT)

  const paginated = isMonthOnly
    ? displayAlbums.slice((page - 1) * PAGE_SIZE_CLIENT, page * PAGE_SIZE_CLIENT)
    : displayAlbums  // 서버가 이미 페이지네이션 적용

  return (
    <div style={{
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: isExiting ? 'pageFadeOut 0.35s ease forwards' : (fadeIn ? 'pageFadeIn 0.4s ease both' : undefined),
    }}>
      <CategoryHeader onLogoClick={handleExitToHome} currentCategory="albums" />

      {/* 필터 */}
      <div className="album-filter-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.6rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button style={tabStyle(featuredOnly)} onClick={() => setFeaturedOnly(!featuredOnly)}>추천</button>
        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} style={selectStyle}>
          <option value="all">지역</option>
          <option value="국내">국내</option>
          <option value="해외">해외</option>
        </select>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={selectStyle}>
          <option value="all">유형</option>
          <option value="정규">정규</option>
          <option value="EP">EP</option>
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
          {availableYears.map(y => <option key={y} value={y}>{y === 'all' ? '연도' : y}</option>)}
        </select>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={selectStyle}>
          {availableMonths.map(m => <option key={m} value={m}>{m === 'all' ? '월' : `${m}월`}</option>)}
        </select>
      </div>

      {/* 네비게이션 로딩 오버레이 */}
      {navigating && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.5)' }}>
          <Spinner />
        </div>
      )}

      {/* 앨범 그리드 */}
      <div className="album-grid-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
        {paginated.length === 0 && (
          <p style={{
            color: 'var(--meta-color)', fontSize: '0.85rem',
            textAlign: 'center', padding: '4rem 0',
          }}>
            필터에 맞는 앨범이 없어요.
          </p>
        )}
        <div className="album-grid">
          {paginated.map((album, index) => (
            <div key={album.id} style={{
              opacity: 0,
              animation: `fadeIn 0.5s ease-in-out ${index * 30}ms forwards`,
              minWidth: 0,
            }}>
              <div className="album-artwork" style={{
                width: '100%',
                aspectRatio: '1 / 1',
                background: 'var(--hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
                outline: album.is_featured ? '2px solid var(--meta-color)' : 'none',
                outlineOffset: '2px',
                position: 'relative',
              }}>
                {album.is_featured && (
                  <span style={{
                    position: 'absolute', top: 0, left: 0,
                    fontFamily: 'bjorkfont, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--bg-color)',
                    background: 'var(--meta-color)',
                    width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                    lineHeight: 1,
                    paddingTop: '3px',
                    paddingRight: '6px',
                  }}>d</span>
                )}
                {album.artwork_url ? (
                  <img
                    src={album.artwork_url}
                    alt={album.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontFamily: 'bjorkfont, sans-serif', fontSize: '2.5rem', color: 'var(--border)', userSelect: 'none' }}>
                    {album.title[0]}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.4rem' }}>
                {album.title}
              </p>
              <p
                onClick={(e) => { e.stopPropagation(); setNavigating(true); router.push(`/artists/${encodeURIComponent(album.artist)}`) }}
                onMouseEnter={() => setHoveredArtist(album.id)}
                onMouseLeave={() => setHoveredArtist(null)}
                style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: hoveredArtist === album.id ? 'var(--text-color)' : 'var(--meta-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.35rem', cursor: 'pointer', transition: 'color 0.15s' }}
              >
                {album.artist}
              </p>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'var(--meta-color)' }}>
                {album.region}{album.album_type ? ` · ${album.album_type}` : ''}{album.release_date ? ` · ${formatDate(album.release_date)}` : ''}
              </p>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', padding: '2rem 0 1rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={pageButtonStyle(page === p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
