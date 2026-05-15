'use client'

interface Article {
  id: number
  title: string
  title_ko?: string
  author: string
  source: string
  source_url?: string
  published_at: string
  category: string
}

const SVG_SOURCES: Record<string, string> = {
  pitchfork: '/files/pitchfork.svg',
  stereogum: '/files/stereogum.svg',
  consequence: '/files/consequence.svg',
  bandcamp: '/files/bandcamp.svg',
}

const INVERT_SOURCES = new Set(['pitchfork', 'bandcamp'])

function SourceBadge({ source, active }: { source: string; active?: boolean }) {
  const s = source.toLowerCase()
  if (SVG_SOURCES[s]) {
    return (
      <img
        src={SVG_SOURCES[s]}
        alt={source}
        style={{
          width: 16,
          height: 16,
          objectFit: 'contain',
          flexShrink: 0,
          opacity: 0.85,
          marginTop: 3,
          filter: active
            ? (INVERT_SOURCES.has(s) ? 'none' : 'invert(1)')
            : (INVERT_SOURCES.has(s) ? 'invert(1)' : 'none'),
        }}
      />
    )
  }
  return (
    <span
      className="mono"
      style={{
        fontSize: '0.65rem',
        opacity: 0.7,
        flexShrink: 0,
        letterSpacing: '0.05em',
        marginTop: 2,
      }}
    >
      {source.slice(0, 2).toUpperCase()}
    </span>
  )
}

interface SidebarProps {
  articles: Article[]
  selectedId: number | null
  onSelect: (id: number) => void
  sources: string[]
  selectedSource: string | null
  onSourceSelect: (source: string | null) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  fullWidth?: boolean
}

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  const y = String(d.getFullYear()).slice(2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function Sidebar({
  articles,
  selectedId,
  onSelect,
  sources,
  selectedSource,
  onSourceSelect,
  currentPage,
  totalPages,
  onPageChange,
  fullWidth,
}: SidebarProps) {
  return (
    <aside style={{
      width: fullWidth ? '100%' : '480px',
      height: '100%',
      borderRight: fullWidth ? 'none' : '1px solid var(--border)',
      padding: fullWidth ? '1rem' : '1.5rem 1.25rem',
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 출처 필터 — 가로 토글 */}
      <div
        className="mono"
        style={{
          fontSize: '0.65rem',
          letterSpacing: '0.18em',
          color: 'var(--meta-dim)',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          paddingLeft: '0.25rem',
        }}
      >
        // source
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.2rem 0.4rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => onSourceSelect(null)}
          className={`bracket-btn ${!selectedSource ? 'is-active' : ''}`}
        >
          all
        </button>
        {sources.map(src => (
          <button
            key={src}
            onClick={() => onSourceSelect(src)}
            className={`bracket-btn ${selectedSource === src ? 'is-active' : ''}`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* 칼럼 목록 */}
      <ul style={{ listStyle: 'none', flex: 1 }}>
        {articles.length === 0 && (
          <li
            className="mono"
            style={{
              color: 'var(--meta-color)',
              fontSize: '0.85rem',
              padding: '1rem 0.5rem',
            }}
          >
            &gt; no records found.
          </li>
        )}
        {articles.map(article => (
          <li
            key={article.id}
            onClick={() => onSelect(article.id)}
            className={`list-item ${selectedId === article.id ? 'is-selected' : ''}`}
          >
            <SourceBadge source={article.source} active={selectedId === article.id} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="list-item-meta">
                {article.source} · {fmtDate(article.published_at)}
              </span>
              <span
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 400,
                  fontSize: '1.05rem',
                  lineHeight: 1.35,
                  display: 'block',
                  wordBreak: 'keep-all',
                }}
              >
                {article.title_ko || article.title}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 — ASCII */}
      {totalPages > 1 && (
        <>
          <div
            style={{
              color: 'var(--border-bright)',
              fontFamily: 'var(--mono)',
              fontSize: '0.7rem',
              margin: '1rem 0 0.75rem',
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}
          >
            ───────────────
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              paddingBottom: '0.5rem',
            }}
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="bracket-btn"
              style={{
                opacity: currentPage <= 1 ? 0.3 : 1,
                cursor: currentPage <= 1 ? 'default' : 'pointer',
              }}
            >
              prev
            </button>
            <span
              className="mono"
              style={{
                fontSize: '0.85rem',
                color: 'var(--meta-color)',
                letterSpacing: '0.08em',
                padding: '0 0.5rem',
              }}
            >
              {String(currentPage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="bracket-btn"
              style={{
                opacity: currentPage >= totalPages ? 0.3 : 1,
                cursor: currentPage >= totalPages ? 'default' : 'pointer',
              }}
            >
              next
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
