import type { CSSProperties } from 'react'

export const selectStyle: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontWeight: 400,
  background: '#0a0a0a',
  border: '1px solid var(--border)',
  color: 'var(--text-color)',
  fontSize: '0.78rem',
  letterSpacing: '0.05em',
  padding: '0.4rem 0.7rem',
  cursor: 'pointer',
  outline: 'none',
  textTransform: 'lowercase',
  appearance: 'none',
}

export const ghostButtonStyle: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontWeight: 400,
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--text-color)',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontSize: '0.78rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

export const tabStyle = (active: boolean): CSSProperties => ({
  fontFamily: 'var(--mono)',
  fontWeight: active ? 700 : 400,
  background: active ? 'var(--text-color)' : 'none',
  border: '1px solid var(--border)',
  color: active ? 'var(--bg-color)' : 'var(--meta-color)',
  fontSize: '0.78rem',
  padding: '0.35rem 0.85rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  transition: 'background-color 0.08s steps(2, end), color 0.08s steps(2, end)',
})

export const pageButtonStyle = (active: boolean): CSSProperties => ({
  fontFamily: 'var(--mono)',
  fontWeight: active ? 700 : 400,
  background: active ? 'var(--text-color)' : 'none',
  border: '1px solid var(--border)',
  color: active ? 'var(--bg-color)' : 'var(--meta-color)',
  minWidth: 36,
  height: 32,
  padding: '0 0.5rem',
  cursor: 'pointer',
  fontSize: '0.78rem',
  letterSpacing: '0.06em',
  transition: 'background-color 0.08s steps(2, end), color 0.08s steps(2, end)',
})
