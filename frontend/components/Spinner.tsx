'use client'
import { useEffect, useState, type CSSProperties } from 'react'

interface SpinnerProps {
  size?: number
  style?: CSSProperties
}

const FRAMES = ['▖', '▘', '▝', '▗']

export default function Spinner({ size = 32, style }: SpinnerProps) {
  const [frame, setFrame] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES.length)
      setTick(t => (t + 1) % 12)
    }, 110)
    return () => clearInterval(id)
  }, [])

  const filled = '█'.repeat(tick)
  const empty = '░'.repeat(12 - tick)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        fontFamily: 'var(--mono)',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: size * 0.75,
          color: 'var(--text-color)',
          lineHeight: 1,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {FRAMES[frame]}
      </div>
      <div
        className="ascii-bar"
        style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
      >
        <span className="bar-filled">{filled}</span>
        <span style={{ color: 'var(--meta-dim)' }}>{empty}</span>
      </div>
      <div
        style={{
          fontSize: '0.65rem',
          color: 'var(--meta-dim)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        loading…
      </div>
    </div>
  )
}
