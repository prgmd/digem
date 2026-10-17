'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Album, Artist } from '@/lib/types'
import CategoryHeader from '@/components/CategoryHeader'

interface Props {
  artist: Artist
  albums: Album[]
}

export default function ArtistClient({ artist, albums }: Props) {
  const router = useRouter()
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null)

  return (
    <div className="page-shell">
      <CategoryHeader currentCategory="albums" />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 5vw, 3rem)',
        }}
      >
      <button
        onClick={() => router.back()}
        className="bracket-btn"
        style={{ marginBottom: 'var(--sp-8)' }}
      >
        ← back
      </button>

      <h1
        style={{
          fontFamily: 'var(--font-text)',
          fontSize: 'var(--fs-2xl)',
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
          style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-muted)', letterSpacing: '0.06em' }}
        >
          {artist.name}
        </p>
      )}

      <div
        className="mono"
        style={{
          marginTop: '1.5rem',
          paddingBottom: '0.5rem',
          fontSize: 'var(--fs-2xs)',
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
          style={{ color: 'var(--ink-muted)', marginTop: 'var(--sp-8)', fontSize: 'var(--fs-sm)' }}
        >
          &gt; no records on file.
        </p>
      ) : (
        <div className="album-grid" style={{ marginTop: 'var(--sp-8)' }}>
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
                        fontWeight: 600,
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
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '0.25rem',
                  opacity: hoveredAlbum === album.id ? 1 : 0.92,
                  transition: 'opacity var(--t-hover)',
                }}
              >
                {album.title}
              </p>
              <p
                className="mono"
                style={{
                  fontSize: 'var(--fs-2xs)',
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
    </div>
  )
}
