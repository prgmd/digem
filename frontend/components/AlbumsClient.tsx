'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Album } from '@/lib/types'
import CategoryHeader from '@/components/CategoryHeader'
import Spinner from '@/components/Spinner'
import { useAlbumFilters } from '@/components/useAlbumFilters'
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
  const releaseDate = album.release_date ? formatDate(album.release_date) : null

  return (
    <article className="album-card">
      <div className="album-artwork">
        {album.artwork_url ? (
          <img src={album.artwork_url} alt={album.title} />
        ) : (
          <span
            className="mono"
            style={{
              fontSize: 'var(--fs-xl)',
              color: 'var(--ink-faint)',
              userSelect: 'none',
              fontWeight: 600,
            }}
            aria-hidden="true"
          >
            {album.title.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <h2 className="album-title" title={album.title}>{album.title}</h2>
      <button type="button" className="album-artist" onClick={() => onArtistClick(album.artist)}>
        {album.artist}
      </button>
      <p className="album-meta">
        <span>
          {album.region === '국내' ? 'kr' : 'intl'}
          {album.album_type ? ` · ${album.album_type.toLowerCase()}` : ''}
          {releaseDate ? ` · ${releaseDate}` : ''}
        </span>
        {album.is_featured && <span className="album-featured-mark">pick</span>}
      </p>
    </article>
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

  const hasFilters = featuredOnly || [selectedRegion, selectedType, selectedYear, selectedMonth].some(v => v !== 'all')

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
    <main className="page-shell album-screen">
      <CategoryHeader currentCategory="albums" />

      {/* 필터 바 */}
      <div className="album-filter-bar">
        <h1 className="album-catalog-heading">albums</h1>
        <div className="album-filters">
          <button
            type="button"
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`bracket-btn ${featuredOnly ? 'is-active' : ''}`}
            aria-pressed={featuredOnly}
          >
            pick
          </button>
          <select aria-label="region" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} style={selectStyle}>
            <option value="all">region · all</option>
            <option value="국내">region · kr</option>
            <option value="해외">region · intl</option>
          </select>
          <select aria-label="type" value={selectedType} onChange={e => setSelectedType(e.target.value)} style={selectStyle}>
            <option value="all">type · all</option>
            <option value="정규">type · LP</option>
            <option value="EP">type · EP</option>
          </select>
          <select aria-label="year" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
            {availableYears.map(y => <option key={y} value={y}>{y === 'all' ? 'year · all' : `year · ${y}`}</option>)}
          </select>
          <select aria-label="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={selectStyle}>
            {availableMonths.map(m => <option key={m} value={m}>{m === 'all' ? 'month · all' : `month · ${m.padStart(2, '0')}`}</option>)}
          </select>
        </div>
      </div>

      {navigating && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'var(--overlay)' }}>
          <Spinner />
        </div>
      )}

      {/* 앨범 그리드 */}
      <div className="album-grid-wrapper">
        {paginated.length === 0 && (
          <div className="terminal-block" style={{ padding: 'var(--sp-8) 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
            <div>No albums match these filters.</div>
            {hasFilters && <button onClick={() => router.replace('/albums')} className="bracket-btn">clear filters</button>}
          </div>
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
            >
              prev
            </button>
            <span
              className="mono"
              style={{
                fontSize: 'var(--fs-sm)',
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
            >
              next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
