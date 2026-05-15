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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 5vw, 3rem)',
        animation: 'pageFadeIn 0.4s steps(12, end) both',
      }}
    >
      <button
        onClick={() => router.back()}
        className="bracket-btn"
        style={{ marginBottom: '2.5rem' }}
      >
        ← back
      </button>

      <div
        className="mono"
        style={{
          fontSize: '0.7rem',
          color: 'var(--meta-dim)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        // artist
      </div>

      <h1
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          marginBottom: '0.4rem',
          lineHeight: 1.1,
          letterSpacing: '0.04em',
        }}
      >
        {artist.name_ko || artist.name}
      </h1>
      {artist.name_ko && (
        <p
          className="mono"
          style={{ fontSize: '0.8rem', color: 'var(--meta-color)', letterSpacing: '0.06em' }}
        >
          {artist.name}
        </p>
      )}

      <div
        className="mono"
        style={{
          marginTop: '1.5rem',
          paddingBottom: '0.5rem',
          fontSize: '0.72rem',
          color: 'var(--meta-color)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--border)',
        }}
      >
        discography · {String(albums.length).padStart(2, '0')} records
      </div>

      {albums.length === 0 ? (
        <p
          className="mono"
          style={{ color: 'var(--meta-color)', marginTop: '2rem', fontSize: '0.85rem' }}
        >
          &gt; no records on file.
        </p>
      ) : (
        <div
          className="album-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1.6rem',
            marginTop: '2rem',
          }}
        >
          {albums.map((album, i) => (
            <div
              key={album.id}
              className="album-card"
              onMouseEnter={() => setHoveredAlbum(album.id)}
              onMouseLeave={() => setHoveredAlbum(null)}
              style={{
                opacity: 0,
                animation: `pixelFadeIn 0.4s steps(10, end) ${i * 35}ms forwards`,
              }}
            >
              <div className="album-artwork">
                {album.artwork_url
                  ? <img src={album.artwork_url} alt={album.title} />
                  : <span
                      className="mono"
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: 'var(--border-bright)',
                        letterSpacing: '0.18em',
                      }}
                    >
                      {album.title[0].toUpperCase()}
                    </span>
                }
              </div>
              <p
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-color)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '0.25rem',
                  opacity: hoveredAlbum === album.id ? 1 : 0.92,
                  transition: 'opacity 0.1s steps(3, end)',
                }}
              >
                {album.title}
              </p>
              <p
                className="mono"
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--meta-dim)',
                  letterSpacing: '0.06em',
                  textTransform: 'lowercase',
                }}
              >
                {album.album_type ? album.album_type.toLowerCase() : ''}
                {album.release_date ? ` · ${album.release_date.slice(0, 4)}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
