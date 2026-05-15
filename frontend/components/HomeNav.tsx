import Link from 'next/link'

const LINKS = [
  { href: '/articles', label: 'ARTICLES' },
  { href: '/albums',   label: 'ALBUMS'   },
]

export default function HomeNav() {
  return (
    <nav className="hero-nav" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 600,
            fontSize: '1.1rem',
            color: 'var(--meta-color)',
            textDecoration: 'none',
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
