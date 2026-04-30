'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LINKS = [
  { href: '/articles', label: 'Articles' },
  { href: '/albums',   label: 'Albums'   },
]

export default function HomeNav() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = (href: string) => {
    setLoading(href)
    router.push(href)
  }

  return (
    <nav className="hero-nav" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
      {LINKS.map(({ href, label }) => {
        const isLoading = loading === href
        const isDimmed  = loading !== null && !isLoading
        return (
          <button
            key={href}
            onClick={() => handleClick(href)}
            disabled={loading !== null}
            style={{
              background: 'none',
              border: 'none',
              cursor: loading !== null ? 'default' : 'pointer',
              fontSize: '1.5rem',
              color: isDimmed ? 'transparent' : 'var(--meta-color)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              opacity: isDimmed ? 0 : 1,
              transition: 'opacity 0.2s',
              padding: 0,
            }}
          >
            {isLoading && (
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: '2px solid var(--meta-color)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }} />
            )}
            {label}
          </button>
        )
      })}
    </nav>
  )
}
