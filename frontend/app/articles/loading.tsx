const DOT_STYLE = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#E8D5A0',
  animation: 'dotWave 1.2s ease-in-out infinite',
}

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ ...DOT_STYLE, animationDelay: '0s' }} />
        <span style={{ ...DOT_STYLE, animationDelay: '0.2s' }} />
        <span style={{ ...DOT_STYLE, animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}
