'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CategoryHeader from '@/components/CategoryHeader'

interface Album {
  id: number
  title: string
  artist: string
  artwork_url: string
  release_date: string
  region: string
  type: string
}

const DUMMY_ALBUMS: Album[] = [
  { id: 1, title: "Short n' Sweet", artist: 'Sabrina Carpenter', artwork_url: '', release_date: '2024-08-23', region: '해외', type: '정규' },
  { id: 2, title: 'HIT ME HARD AND SOFT', artist: 'Billie Eilish', artwork_url: '', release_date: '2024-05-17', region: '해외', type: '정규' },
  { id: 3, title: 'Manning Fireworks', artist: 'MJ Lenderman', artwork_url: '', release_date: '2024-09-06', region: '해외', type: '정규' },
  { id: 4, title: 'Chromakopia', artist: 'Tyler, the Creator', artwork_url: '', release_date: '2024-10-28', region: '해외', type: '정규' },
  { id: 5, title: 'Imaginal Disk', artist: 'Magdalena Bay', artwork_url: '', release_date: '2024-10-25', region: '해외', type: '정규' },
  { id: 6, title: 'Diamond Jubilee', artist: 'Cindy Lee', artwork_url: '', release_date: '2024-03-27', region: '해외', type: '정규' },
  { id: 7, title: 'Loner', artist: 'Kevin Abstract', artwork_url: '', release_date: '2024-04-12', region: '해외', type: 'EP' },
  { id: 8, title: '웨인', artist: '혁오', artwork_url: '', release_date: '2024-03-15', region: '국내', type: '정규' },
  { id: 9, title: 'Eternal Sunshine', artist: 'Ariana Grande', artwork_url: '', release_date: '2024-03-08', region: '해외', type: '정규' },
  { id: 10, title: '유미의 세포들 OST', artist: 'Various Artists', artwork_url: '', release_date: '2024-07-01', region: '국내', type: 'EP' },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}/${m}/${d}`
}

export default function AlbumsPage() {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const [fadeIn] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true
    const skip = sessionStorage.getItem('nofade')
    if (skip) { sessionStorage.removeItem('nofade'); return false }
    return true
  })

  const currentYear = new Date().getFullYear().toString()
  const currentMonth = (new Date().getMonth() + 1).toString()
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const handleExitToHome = () => {
    setIsExiting(true)
    setTimeout(() => router.push('/'), 350)
  }

  const availableYears = [
    'all',
    ...Array.from(new Set(DUMMY_ALBUMS.map(a => new Date(a.release_date).getFullYear().toString())))
      .sort((a, b) => Number(b) - Number(a))
  ]
  const availableMonths = ['all', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())]

  const filteredAlbums = DUMMY_ALBUMS.filter(album => {
    const albumYear = new Date(album.release_date).getFullYear().toString()
    const albumMonth = (new Date(album.release_date).getMonth() + 1).toString()
    return (
      (selectedRegion === 'all' || album.region === selectedRegion) &&
      (selectedType === 'all' || album.type === selectedType) &&
      (selectedYear === 'all' || albumYear === selectedYear) &&
      (selectedMonth === 'all' || albumMonth === selectedMonth)
    )
  })

  const selectStyle: React.CSSProperties = {
    background: '#0a0a0a',
    border: '1px solid var(--border)',
    color: 'var(--text-color)',
    fontSize: '0.85rem',
    padding: '0.4rem 0.75rem',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Noto Serif KR', serif",
  }

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
        gap: '0.6rem',
        padding: isMobile ? '1rem' : '1.25rem 2rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
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
          {availableYears.map(y => (
            <option key={y} value={y}>{y === 'all' ? '연도' : y}</option>
          ))}
        </select>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={selectStyle}>
          {availableMonths.map(m => (
            <option key={m} value={m}>{m === 'all' ? '월' : `${m}월`}</option>
          ))}
        </select>
      </div>

      {/* 앨범 그리드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: isMobile ? '1rem' : '1.75rem',
        }}>
          {filteredAlbums.map((album, index) => (
            <div
              key={album.id}
              style={{
                opacity: 0,
                animation: `fadeIn 0.5s ease-in-out ${index * 50}ms forwards`,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                background: 'var(--hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                overflow: 'hidden',
              }}>
                {album.artwork_url ? (
                  <Image
                    src={album.artwork_url}
                    alt={album.title}
                    width={200}
                    height={200}
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
              <p style={{ fontSize: '0.8rem', color: 'var(--meta-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
                {album.artist}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--meta-color)', opacity: 0.65 }}>
                {album.region}{album.type ? ` · ${album.type}` : ''}{album.release_date ? ` · ${formatDate(album.release_date)}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
