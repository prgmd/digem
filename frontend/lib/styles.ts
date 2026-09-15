import type { CSSProperties } from 'react'

export const selectStyle: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontWeight: 400,
  background: '#0a0a0a',
  // amber chevron drawn as inline SVG so the dropdown affordance is visible
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%238a7a5a' stroke-width='1.4' fill='none'/></svg>\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.6rem center',
  border: '1px solid var(--border-bright)',
  color: 'var(--text-color)',
  fontSize: '0.78rem',
  letterSpacing: '0.05em',
  padding: '0.4rem 1.7rem 0.4rem 0.7rem',
  cursor: 'pointer',
  outline: 'none',
  textTransform: 'lowercase',
  appearance: 'none',
}
