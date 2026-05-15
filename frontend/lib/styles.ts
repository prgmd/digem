import type { CSSProperties } from 'react'

export const selectStyle: CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontWeight: 300,
  background: '#0a0a0a',
  border: '1px solid var(--border)',
  color: 'var(--text-color)',
  fontSize: '1.05rem',
  padding: '0.4rem 0.75rem',
  cursor: 'pointer',
  outline: 'none',
}

export const ghostButtonStyle: CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontWeight: 300,
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--text-color)',
  padding: '0.5rem 1.5rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
}

export const tabStyle = (active: boolean): CSSProperties => ({
  fontFamily: 'Pretendard, sans-serif',
  fontWeight: active ? 600 : 300,
  background: active ? 'var(--selected-bg)' : 'none',
  border: '1px solid var(--border)',
  color: active ? 'var(--text-color)' : 'var(--meta-color)',
  fontSize: '1.05rem',
  padding: '0.35rem 0.85rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  transition: 'background-color 0.15s, color 0.15s',
})

export const pageButtonStyle = (active: boolean): CSSProperties => ({
  fontFamily: 'Pretendard, sans-serif',
  fontWeight: active ? 600 : 300,
  background: active ? 'var(--selected-bg)' : 'none',
  border: '1px solid var(--border)',
  color: active ? 'var(--text-color)' : 'var(--meta-color)',
  width: 36, height: 36,
  cursor: 'pointer',
  fontSize: '1.05rem',
  transition: 'background-color 0.15s, color 0.15s',
})
