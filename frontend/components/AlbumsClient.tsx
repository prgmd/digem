'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'
import Spinner from '@/components/Spinner'
import { useAlbumFilters } from '@/components/useAlbumFilters'
import { selectStyle } from '@/lib/styles'

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
  return `${y}.${m}.${d}`
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

  const isMonthOnly = monthFilter !== 'all' && selectedYear === 'all'
  const displayAlbums = isMonthOnly
    ? albums.filter(a => (new Date(a.release_date).getMonth() + 1).toString() === monthFilter)
    : albums

  const totalPages = isMonthOnly
    ? Math.ceil(displayAlbums.length / PAGE_SIZE_CLIENT)
    : Math.ceil(totalCount / PAGE_SIZE_CLIENT)

  const paginated = isMonthOnly
    ? displayAlbums.slice((page - 1) * PAGE_SIZE_CLIENT, page * PAGE_SIZE_CLIENT)
    : displayAlbums

  return (
    <div style={{
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: isExiting ? 'pageFadeOut 0.35s ease forwards' : (fadeIn ? 'pageFadeIn 0.4s steps(12, end) both' : undefined),
    }}>
      <CategoryHeader onLogoClick={handleExitToHome} currentCategory="albums" />

      {/* 필터 바 */}
      <div className="album-filter-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.4rem 0.6rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span
          className="mono"
          style={{
            fontSize: '0.65rem',
            color: 'var(--meta-dim)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginRight: '0.4rem',
          }}
        >
          // filter
        </span>
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={`bracket-btn ${featuredOnly ? 'is-active' : ''}`}
        >
          ★ pick
        </button>
        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} style={selectStyle}>
          <option value="all">region · all</option>
          <option value="국내">region · kr</option>
          <option value="해외">region · intl</option>
        </select>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={selectStyle}>
          <option value="all">type · all</option>
          <option value="정규">type · LP</option>
          <option value="EP">type · EP</option>
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
          {availableYears.map(y => <option key={y} value={y}>{y === 'all' ? 'year · all' : `year · ${y}`}</option>)}
        </select>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={selectStyle}>
          {availableMonths.map(m => <option key={m} value={m}>{m === 'all' ? 'month · all' : `month · ${m.padStart(2, '0')}`}</option>)}
        </select>

        <span
          className="mono"
          style={{
            marginLeft: 'auto',
            fontSize: '0.7rem',
            color: 'var(--meta-color)',
            letterSpacing: '0.06em',
          }}
        >
          {String(totalCount).padStart(4, '0')} records
        </span>
      </div>

      {navigating && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.65)' }}>
          <Spinner />
        </div>
      )}

      {/* 앨범 그리드 */}
      <div className="album-grid-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
        {paginated.length === 0 && (
          <p
            className="mono"
            style={{
              color: 'var(--meta-color)',
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '4rem 0',
              letterSpacing: '0.05em',
            }}
          >
            &gt; no records match the filter.
          </p>
        )}
        <div className="album-grid">
          {paginated.map((album, index) => (
            <div
              key={album.id}
              className="album-card"
              style={{
                opacity: 0,
                animation: `pixelFadeIn 0.5s steps(10, end) ${index * 30}ms forwards`,
                minWidth: 0,
              }}
            >
              <div
                className="album-artwork"
                style={{
                  outline: album.is_featured ? '2px solid var(--meta-color)' : 'none',
                  outlineOffset: '2px',
                }}
              >
                {album.is_featured && (
                  <span className="album-featured-mark">PICK</span>
                )}
                {album.artwork_url ? (
                  <img src={album.artwork_url} alt={album.title} />
                ) : (
                  <span
                    className="mono"
                    style={{
                      fontSize: '2rem',
                      color: 'var(--border-bright)',
                      userSelect: 'none',
                      letterSpacing: '0.2em',
                      fontWeight: 700,
                    }}
                  >
                    {album.title[0].toUpperCase()}
                  </span>
                )}
                <div className="album-title-overlay">
                  <span
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      fontWeight: 500,
                      fontSize: '1rem',
                      color: 'var(--text-color)',
                      textAlign: 'center',
                      lineHeight: 1.45,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {album.title}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'var(--text-color)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '0.25rem',
                }}
              >
                {album.title}
              </p>

              <p
                onClick={(e) => {
                  e.stopPropagation()
                  setNavigating(true)
                  router.push(`/artists/${encodeURIComponent(album.artist)}`)
                }}
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.95rem',
                  color: 'var(--meta-color)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '0.35rem',
                  cursor: 'pointer',
                  transition: 'color 0.08s steps(2, end)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-color)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--meta-color)')}
              >
                {album.artist}
              </p>

              <p
                className="mono"
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--meta-dim)',
                  letterSpacing: '0.05em',
                  textTransform: 'lowercase',
                }}
              >
                {album.region === '국내' ? 'kr' : 'intl'}
                {album.album_type ? ` · ${album.album_type.toLowerCase()}` : ''}
                {album.release_date ? ` · ${formatDate(album.release_date)}` : ''}
              </p>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '2rem 0 1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="bracket-btn"
              style={{ opacity: page <= 1 ? 0.3 : 1 }}
            >
              prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`bracket-btn ${page === p ? 'is-active' : ''}`}
                style={{ minWidth: '2.4rem' }}
              >
                {String(p).padStart(2, '0')}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="bracket-btn"
              style={{ opacity: page >= totalPages ? 0.3 : 1 }}
            >
              next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
