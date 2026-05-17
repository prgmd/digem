import HomeNav from '@/components/HomeNav'

export default function Home() {
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

      {/* 하단: 네비 */}
      <div style={{
        flex: 0.9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '2.5rem',
        width: '100%',
      }}>
        <HomeNav />
      </div>
    </div>
  )
}
