import type { CSSProperties } from 'react'

interface SpinnerProps {
  size?: number
  style?: CSSProperties
}

export default function Spinner({ size = 32, style }: SpinnerProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '2px solid var(--meta-color)',
      borderTopColor: 'var(--text-color)',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
      ...style,
    }} />
  )
}
