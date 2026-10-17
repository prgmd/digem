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
          className="glitch-on-hover"
          style={{ display: 'inline-block', cursor: 'default', userSelect: 'none' }}
        >
          <span
            className="hero-logo"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '8rem',
              color: 'var(--ink)',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            digem.
          </span>
        </span>
        <span
          className="hero-tagline mono"
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--ink-muted)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          dig your uncut gems<span className="caret" style={{ marginLeft: '0.4em' }} aria-hidden />
        </span>
      </div>

      {/* ASCII 디바이더 */}
      <div
        style={{
          width: '48px',
          height: '1px',
          background: 'var(--line-strong)',
          flexShrink: 0,
        }}
      />

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
