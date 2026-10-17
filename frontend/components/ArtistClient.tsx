'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Album, Artist } from '@/lib/types'

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
        background: 'transparent',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 5vw, 3rem)',
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
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: 'var(--ink-muted)',
          letterSpacing: '0.04em',
          marginBottom: '0.35rem',
        }}
      >
        artist
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-text)',
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
          style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', letterSpacing: '0.06em' }}
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
          color: 'var(--ink-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--line)',
        }}
      >
        discography · {String(albums.length).padStart(2, '0')} records
      </div>

      {albums.length === 0 ? (
        <p
          className="mono"
          style={{ color: 'var(--ink-muted)', marginTop: '2rem', fontSize: '0.85rem' }}
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
          {albums.map(album => (
            <div
              key={album.id}
              className="album-card"
              onMouseEnter={() => setHoveredAlbum(album.id)}
              onMouseLeave={() => setHoveredAlbum(null)}
            >
              <div className="album-artwork">
                {album.artwork_url
                  ? <img src={album.artwork_url} alt={album.title} />
                  : <span
                      className="mono"
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: 'var(--line-strong)',
                        letterSpacing: '0.18em',
                      }}
                    >
                      {album.title[0].toUpperCase()}
                    </span>
                }
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  color: 'var(--ink)',
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
                  color: 'var(--ink-muted)',
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
