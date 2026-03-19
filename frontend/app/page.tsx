import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '3rem'
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

      <hr
        className="hero-divider"
        style={{ width: '200px', border: 'none', borderTop: '1px solid var(--border)' }}
      />

      <nav style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
        <Link
          href="/articles"
          className="hero-nav-left"
          style={{ fontSize: '1.5rem', color: 'var(--meta-color)', textDecoration: 'none' }}
        >
          Articles
        </Link>
        <Link
          href="/albums"
          className="hero-nav-right"
          style={{ fontSize: '1.5rem', color: 'var(--meta-color)', textDecoration: 'none' }}
        >
          Albums
        </Link>
      </nav>
    </div>
  )
}
