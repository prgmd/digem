'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Album } from '@/lib/types'
import CategoryHeader from '@/components/CategoryHeader'
import Spinner from '@/components/Spinner'
import { useAlbumFilters } from '@/components/useAlbumFilters'
import MarqueeText from '@/components/MarqueeText'
import { selectStyle } from '@/lib/styles'

export type { Album }

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}.${m}.${d}`
}

const PAGE_SIZE_CLIENT = 30

interface AlbumCardProps {
  album: Album
  onArtistClick: (artist: string) => void
}

function AlbumCard({ album, onArtistClick }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`album-card ${album.is_featured ? 'is-featured' : ''}`}
      style={{ minWidth: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="album-artwork"
        style={{
          outline: album.is_featured ? '1px solid var(--ink)' : 'none',
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
              color: 'var(--line-strong)',
              userSelect: 'none',
              letterSpacing: '0.2em',
              fontWeight: 700,
            }}
          >
            {album.title[0].toUpperCase()}
          </span>
        )}
      </div>

      <MarqueeText
        active={isHovered}
        style={{
          fontFamily: 'var(--font-text)',
          fontWeight: 600,
          fontSize: '1.1rem',
          color: 'var(--ink)',
          marginBottom: '0.25rem',
        }}
      >
        {album.title}
      </MarqueeText>

      <p
        onClick={(e) => {
          e.stopPropagation()
          onArtistClick(album.artist)
        }}
        style={{
          fontFamily: 'var(--font-text)',
          fontWeight: 400,
          fontSize: '0.95rem',
          color: 'var(--ink-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: '0.35rem',
          cursor: 'pointer',
          transition: 'color 0.08s steps(2, end)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
      >
        {album.artist}
      </p>

      <p
        className="mono"
        style={{
          fontSize: '0.7rem',
          color: 'var(--ink-muted)',
          letterSpacing: '0.05em',
          textTransform: 'lowercase',
        }}
      >
        {album.region === '국내' ? 'kr' : 'intl'}
        {album.album_type ? ` · ${album.album_type.toLowerCase()}` : ''}
        {album.release_date ? ` · ${formatDate(album.release_date)}` : ''}
      </p>
    </div>
  )
}

interface Props {
  albums: Album[]
  totalCount: number
  availableYears: string[]
  monthFilter: string
}

export default function AlbumsClient({ albums, totalCount, availableYears, monthFilter }: Props) {
  const router = useRouter()
  const [navigating, setNavigating] = useState(false)

  const { filters, actions } = useAlbumFilters()
  const { selectedRegion, selectedType, selectedYear, selectedMonth, featuredOnly, page } = filters
  const { setSelectedRegion, setSelectedType, setSelectedYear, setSelectedMonth, setFeaturedOnly, setPage } = actions

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
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <CategoryHeader onLogoClick={() => router.push('/')} currentCategory="albums" />

      {/* 필터 바 */}
      <div className="album-filter-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.4rem 0.6rem',
        borderBottom: '1px solid var(--line)',
        flexShrink: 0,
      }}>
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
            color: 'var(--ink-muted)',
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
              color: 'var(--ink-muted)',
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
          {paginated.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              onArtistClick={(artist) => {
                setNavigating(true)
                router.push(`/artists/${encodeURIComponent(artist)}`)
              }}
            />
          ))}
        </div>

        {/* 페이지네이션 — prev / current·total / next */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.4rem',
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
            <span
              className="mono"
              style={{
                fontSize: '0.85rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.08em',
                padding: '0 0.5rem',
                minWidth: '4.5rem',
                textAlign: 'center',
              }}
            >
              {String(page).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
            </span>
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
