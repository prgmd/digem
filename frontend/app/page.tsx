import HomeNav from '@/components/HomeNav'
import HomeStatus from '@/components/HomeStatus'
import { supabase } from '@/lib/supabase'

export const revalidate = 600 // 10 min

async function getCounts() {
  try {
    const [articlesRes, albumsRes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }).neq('translation_status', 'failed'),
      supabase.from('albums').select('id', { count: 'exact', head: true }),
    ])
    return {
      articles: articlesRes.count ?? 0,
      albums: albumsRes.count ?? 0,
    }
  } catch {
    return { articles: 0, albums: 0 }
  }
}

export default async function Home() {
  const counts = await getCounts()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      overflowX: 'hidden',
    }}>
      {/* 상단: 로고 + 태그라인 */}
      <div style={{
        flex: 1.1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '1rem',
        paddingBottom: '1.5rem',
      }}>
        <span
          className="hero-logo glitch-on-hover"
          style={{
            fontFamily: 'bjorkfont, sans-serif',
            fontSize: '8rem',
            color: 'var(--text-color)',
            lineHeight: 1,
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          digem.
        </span>
        <span
          className="hero-tagline mono"
          style={{
            fontSize: '0.78rem',
            color: 'var(--meta-color)',
            opacity: 0.85,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          // dig your uncut gems
        </span>
      </div>

      {/* ASCII 디바이더 */}
      <div
        className="hero-divider"
        style={{
          fontFamily: 'var(--mono)',
          color: 'var(--meta-dim)',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        ─────── ◆ ───────
      </div>

      {/* 하단: 네비 + 터미널 상태 */}
      <div style={{
        flex: 0.9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '1.75rem',
        gap: '3rem',
        width: '100%',
      }}>
        <HomeNav />
        <HomeStatus articleCount={counts.articles} albumCount={counts.albums} />
      </div>
    </div>
  )
}
