import Link from 'next/link'

const LINKS = [
  { href: '/articles', label: 'articles' },
  { href: '/albums',   label: 'albums'   },
]

export default function HomeNav() {
  return (
    <nav
      className="hero-nav"
      style={{
        display: 'flex',
        gap: '1.2rem',
        alignItems: 'center',
        fontFamily: 'var(--mono)',
      }}
    >
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="home-nav-btn"
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
