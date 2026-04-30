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
      {/* 상단 절반: 로고 + 태그라인 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '1rem',
        paddingBottom: '2rem',
      }}>
        <span
          className="hero-logo"
          style={{ fontFamily: 'bjorkfont, sans-serif', fontSize: '8rem', color: '#E8D5A0', lineHeight: 1 }}
        >
          digem
        </span>
        <span
          className="hero-tagline"
          style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '0.95rem', color: '#E8D5A0', opacity: 0.6, letterSpacing: '0.1em' }}
        >
          dig your uncut gems
        </span>
      </div>

      {/* 구분선: 정확히 세로 중앙 */}
      <hr
        className="hero-divider"
        style={{ width: '200px', border: 'none', borderTop: '1px solid var(--border)', flexShrink: 0 }}
      />

      {/* 하단 절반: 네비게이션 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '2rem',
      }}>
        <HomeNav />
      </div>
    </div>
  )
}
