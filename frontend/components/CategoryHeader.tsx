import Link from 'next/link'
import { ARTICLES_ENABLED } from '@/lib/features'

interface CategoryHeaderProps {
  currentCategory: 'articles' | 'albums' | 'info'
}

const ALL_CATEGORIES = [
  { label: 'articles', path: '/articles', key: 'articles' },
  { label: 'albums',   path: '/albums',   key: 'albums'   },
  { label: 'info',     path: '/info',     key: 'info'     },
] as const

// 칼럼 섹션 비공개 중에는 메뉴에서 제외한다.
const CATEGORIES = ALL_CATEGORIES.filter(c => c.key !== 'articles' || ARTICLES_ENABLED)

export default function CategoryHeader({ currentCategory }: CategoryHeaderProps) {
  return (
    <header className="category-header">
      <Link href="/" className="header-logo" aria-label="digem home">
        <span className="glitch-on-hover">d</span>
      </Link>

      <nav className="header-nav">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.key}
            href={cat.path}
            aria-current={cat.key === currentCategory ? 'page' : undefined}
          >
            {cat.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
