'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'

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

const PAGE_SIZE = 30

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}/${m}/${d}`
}

const selectStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid var(--border)',
  color: 'var(--text-color)',
  fontSize: '0.85rem',
  padding: '0.4rem 0.75rem',
  cursor: 'pointer',
  outline: 'none',
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  background: active ? 'var(--selected-bg)' : 'none',
  border: '1px solid var(--border)',
  color: active ? 'var(--text-color)' : 'var(--meta-color)',
  fontSize: '0.85rem',
  padding: '0.35rem 0.85rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  transition: 'background-color 0.15s, color 0.15s',
})

interface Props {
  albums: Album[]
}

export default function AlbumsClient({ albums }: Props) {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [fadeIn] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true
    const skip = sessionStorage.getItem('nofade')
    if (skip) { sessionStorage.removeItem('nofade'); return false }
    return true
  })

  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 필터 바뀌면 페이지 초기화
  useEffect(() => { setPage(1) }, [selectedRegion, selectedType, selectedYear, selectedMonth, featuredOnly])

  const handleExitToHome = () => {
    setIsExiting(true)
    setTimeout(() => router.push('/'), 350)
  }

  const availableYears = ['all', ...Array.from(new Set(albums.map(a => new Date(a.release_date).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a))]
  const availableMonths = ['all', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())]

  const filtered = albums.filter(album => {
    const albumYear = new Date(album.release_date).getFullYear().toString()
    const albumMonth = (new Date(album.release_date).getMonth() + 1).toString()
    return (
      (selectedRegion === 'all' || album.region === selectedRegion) &&
      (selectedType === 'all' || album.album_type === selectedType) &&
      (selectedYear === 'all' || albumYear === selectedYear) &&
      (selectedMonth === 'all' || albumMonth === selectedMonth) &&
      (!featuredOnly || album.is_featured)
    )
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.6rem',
        padding: isMobile ? '1rem' : '1.25rem 2rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button style={tabStyle(featuredOnly)} onClick={() => setFeaturedOnly(v => !v)}>추천</button>
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

      {/* 앨범 그리드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: isMobile ? '1rem' : '1.75rem',
        }}>
          {paginated.map((album, index) => (
            <div key={album.id} style={{
              opacity: 0,
              animation: `fadeIn 0.5s ease-in-out ${index * 30}ms forwards`,
              cursor: 'pointer',
            }}>
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                background: 'var(--hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
                outline: album.is_featured ? '2px solid #2d7a4f' : 'none',
                outlineOffset: '2px',
                position: 'relative',
              }}>
                {album.is_featured && (
                  <span style={{
                    position: 'absolute', top: 0, left: 0,
                    fontFamily: 'bjorkfont, sans-serif',
                    fontSize: '1rem',
                    color: '#fff',
                    background: '#2d7a4f',
                    width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                    lineHeight: 1,
                    paddingTop: '4px',
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
              <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
                {album.title}
              </p>
              <p
                onClick={(e) => { e.stopPropagation(); router.push(`/artists/${encodeURIComponent(album.artist)}`) }}
                style={{ fontSize: '0.8rem', color: 'var(--meta-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem', cursor: 'pointer' }}
              >
                {album.artist}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--meta-color)', opacity: 0.65 }}>
                {album.region}{album.album_type ? ` · ${album.album_type}` : ''}{album.release_date ? ` · ${formatDate(album.release_date)}` : ''}
              </p>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', padding: '2rem 0 1rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  background: page === p ? 'var(--selected-bg)' : 'none',
                  border: '1px solid var(--border)',
                  color: page === p ? 'var(--text-color)' : 'var(--meta-color)',
                  width: 32, height: 32,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'background-color 0.15s',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
