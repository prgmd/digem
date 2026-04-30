export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1.5rem',
    }}>
      <span style={{ fontFamily: 'bjorkfont, sans-serif', fontSize: '3rem', color: '#E8D5A0', opacity: 0.4 }}>
        digem
      </span>
      <span style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '2px solid #8a7a5a',
        borderTopColor: '#E8D5A0',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}
