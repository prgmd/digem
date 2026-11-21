import Link from 'next/link'
import { ARTICLES_ENABLED } from '@/lib/features'

const LINKS = [
  { href: '/albums', label: 'albums' },
  ...(ARTICLES_ENABLED ? [{ href: '/articles', label: 'articles' }] : []),
]

export default function HomeNav() {
  return (
    <nav className="hero-nav" aria-label="메뉴">
      {LINKS.map(({ href, label }) => (
        <Link key={href} href={href} className="home-nav-btn">
          {label}
        </Link>
      ))}
    </nav>
  )
}
