'use client'
import { useEffect, useState } from 'react'

interface Props {
  articleCount: number
  albumCount: number
}

const SOURCES = ['pitchfork', 'stereogum', 'consequence', 'bandcamp', 'melon']

function fmtNum(n: number) {
  return n.toLocaleString('en-US')
}

function fmtSyncTime() {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  const y = kst.getUTCFullYear()
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kst.getUTCDate()).padStart(2, '0')
  return `${y}.${m}.${day} 09:00 kst`
}

export default function HomeStatus({ articleCount, albumCount }: Props) {
  const [time, setTime] = useState<string>('')
  useEffect(() => {
    const update = () => {
      const d = new Date()
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        animation: 'fadeIn 1.2s 1s steps(20, end) both',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.05rem',
        minWidth: '320px',
        textAlign: 'left',
      }}
    >
      <div className="terminal-line">
        <span className="terminal-key">sys</span>dig-em // music journalism mirror
      </div>
      <div className="terminal-line">
        <span className="terminal-key">src</span>{SOURCES.join(' · ')}
      </div>
      <div className="terminal-line">
        <span className="terminal-key">sync</span>{fmtSyncTime()}
      </div>
      <div className="terminal-line">
        <span className="terminal-key">db</span>{fmtNum(articleCount)} articles · {fmtNum(albumCount)} albums
      </div>
      <div className="terminal-line" style={{ marginTop: '0.4rem' }}>
        <span className="terminal-key">{time || '--:--:--'}</span>
        <span className="caret" aria-hidden />
      </div>
    </div>
  )
}
