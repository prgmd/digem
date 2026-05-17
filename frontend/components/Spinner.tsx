'use client'
import { useEffect, useState, type CSSProperties } from 'react'

interface SpinnerProps {
  size?: number
  style?: CSSProperties
}

const FRAMES = ['◜', '◝', '◞', '◟']
const CAPTIONS = [
  'reading mainframe',
  'parsing manifest',
  'fetching artwork',
  'decoding stream',
  'sync //db',
  'buffering frames',
]

export default function Spinner({ size = 40, style }: SpinnerProps) {
  const [frame, setFrame] = useState(0)
  const [tick, setTick] = useState(0)
  const [captionIdx, setCaptionIdx] = useState(0)
  const [seed, setSeed] = useState('00000000')

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES.length)
      setTick(t => (t + 1) % 13)
    }, 90)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setCaptionIdx(i => (i + 1) % CAPTIONS.length)
      // pseudo-random hex digits — purely cosmetic detail
      const hex = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0')
      setSeed(hex)
    }, 900)
    return () => clearInterval(id)
  }, [])

  const filled = '█'.repeat(tick)
  const empty = '░'.repeat(12 - tick)
  const percent = Math.round((tick / 12) * 100)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
        fontFamily: 'var(--mono)',
        color: 'var(--text-color)',
        ...style,
      }}
    >
      {/* dot wave (3 amber blocks bouncing) */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: size * 0.55 }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: size * 0.22,
              height: size * 0.22,
              background: 'var(--text-color)',
              display: 'inline-block',
              animation: `dotWave 1s steps(8, end) ${i * 0.15}s infinite`,
              boxShadow: '0 0 12px rgba(232, 213, 160, 0.35)',
            }}
          />
        ))}
      </div>

      {/* rotating glyph + progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.78rem',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ fontSize: '1rem', display: 'inline-block', width: '1em', textAlign: 'center' }}>
          {FRAMES[frame]}
        </span>
        <span className="ascii-bar" style={{ fontSize: '0.78rem' }}>
          [<span className="bar-filled">{filled}</span>
          <span style={{ color: 'var(--meta-dim)' }}>{empty}</span>]
        </span>
        <span style={{ color: 'var(--meta-color)', fontSize: '0.72rem', minWidth: '2.5em', textAlign: 'right' }}>
          {String(percent).padStart(2, '0')}%
        </span>
      </div>

      {/* dynamic caption + seed */}
      <div
        style={{
          fontSize: '0.66rem',
          color: 'var(--meta-dim)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: '14em',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--text-color)', opacity: 0.7 }}>&gt;</span>
        <span style={{ minWidth: '11em', textAlign: 'left' }}>{CAPTIONS[captionIdx]}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ color: 'var(--text-color)', opacity: 0.55 }}>0x{seed}</span>
      </div>
    </div>
  )
}
