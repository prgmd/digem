'use client'

const SIZE = 40

export default function Spinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink)',
      }}
    >
      {/* dot wave (3 amber blocks bouncing) */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: SIZE * 0.55 }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: SIZE * 0.22,
              height: SIZE * 0.22,
              background: 'var(--ink)',
              display: 'inline-block',
              animation: `dotWave 1s steps(8, end) ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      {/* single static caption */}
      <div
        style={{
          fontSize: '0.66rem',
          color: 'var(--ink-muted)',
          letterSpacing: '0.16em',
          textTransform: 'lowercase',
        }}
      >
        loading
      </div>
    </div>
  )
}
