'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Artist {
  id: string
  name: string
  name_ko?: string
}

interface Album {
  id: string
  title: string
  artist: string
  artwork_url: string
  release_date: string
  album_type: string
}

interface Props {
  artist: Artist
  albums: Album[]
}

export default function ArtistClient({ artist, albums }: Props) {
  const router = useRouter()
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null)
  const [backHover, setBackHover] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 5vw, 3rem)' }}>
      <button
        onClick={() => router.back()}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{ background: 'none', border: 'none', color: backHover ? 'var(--text-color)' : 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '2rem', transition: 'color 0.2s' }}
      >
        ← 뒤로
      </button>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        {artist.name_ko || artist.name}
      </h1>
      {artist.name_ko && (
        <p style={{ fontSize: '0.85rem', color: 'var(--meta-color)', marginBottom: '2.5rem' }}>{artist.name}</p>
      )}

      {albums.length === 0 ? (
        <p style={{ color: 'var(--meta-color)', marginTop: '2rem' }}>등록된 앨범이 없습니다.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}>
          {albums.map((album, i) => (
            <div
              key={album.id}
              onMouseEnter={() => setHoveredAlbum(album.id)}
              onMouseLeave={() => setHoveredAlbum(null)}
              style={{ opacity: 0, animation: `fadeIn 0.4s ease ${i * 40}ms forwards` }}
            >
              <div style={{
                aspectRatio: '1/1',
                background: 'var(--hover-bg)',
                overflow: 'hidden',
                marginBottom: '0.6rem',
                transform: hoveredAlbum === album.id ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}>
                {album.artwork_url
                  ? <img src={album.artwork_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'bjorkfont, sans-serif', fontSize: '2rem', color: 'var(--border)' }}>{album.title[0]}</span>
                    </div>
                }
              </div>
              <p style={{ fontSize: '0.85rem', color: hoveredAlbum === album.id ? 'var(--text-color)' : 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'opacity 0.2s', opacity: hoveredAlbum === album.id ? 1 : 0.85 }}>{album.title}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--meta-color)', opacity: 0.7 }}>
                {album.album_type}{album.release_date ? ` · ${album.release_date.slice(0, 4)}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
