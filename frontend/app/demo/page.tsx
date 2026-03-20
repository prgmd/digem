'use client'
import { useState, useEffect, useRef } from 'react'

type Mode = 'blobs' | 'aurora' | 'noise' | 'radial' | 'particle'

// ── Blobs (현재 방식 + 블롭 추가) ──────────────────────────────────────────
function BlobsBg() {
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null),
                useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  useEffect(() => {
    let raf: number, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5
    const onMove = (e: MouseEvent) => { tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight }
    const tick = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08
      const dx = cx - 0.5, dy = cy - 0.5
      const moves = [[260,220],[-320,-280],[180,-200],[-150,180],[220,-150]] as [number,number][]
      moves.forEach(([mx, my], i) => {
        if (refs[i].current) refs[i].current!.style.transform = `translate(${dx * mx}px, ${dy * my}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
  const colors = ['#1a4a2e','#0d2818','#2d6a4f','#1b3a2a','#0a3320']
  const sizes = ['600px','500px','450px','400px','350px']
  const positions = [['10%','15%'],['60%','50%'],['30%','70%'],['75%','10%'],['20%','40%']]
  return (
    <div style={{ position:'fixed', inset:0, background:'#050f08', overflow:'hidden', zIndex:0 }}>
      {refs.map((ref, i) => (
        <div key={i} ref={ref} style={{
          position:'absolute', borderRadius:'50%',
          width: sizes[i], height: sizes[i],
          left: positions[i][0], top: positions[i][1],
          background: colors[i],
          filter: 'blur(80px)', opacity: 0.7, willChange:'transform',
          transform: 'translate(-50%,-50%)',
        }} />
      ))}
    </div>
  )
}

// ── Aurora ─────────────────────────────────────────────────────────────────
function AuroraBg() {
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  useEffect(() => {
    let raf: number, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5
    const onMove = (e: MouseEvent) => { tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight }
    const tick = () => {
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05
      const dx = cx - 0.5, dy = cy - 0.5
      if (refs[0].current) refs[0].current.style.transform = `translate(${dx * 200}px, ${dy * 60}px) rotate(${dx * 15}deg)`
      if (refs[1].current) refs[1].current.style.transform = `translate(${-dx * 160}px, ${-dy * 80}px) rotate(${-dx * 10}deg)`
      if (refs[2].current) refs[2].current.style.transform = `translate(${dx * 100}px, ${-dy * 40}px) rotate(${dy * 8}deg)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div style={{ position:'fixed', inset:0, background:'#030c06', overflow:'hidden', zIndex:0 }}>
      {[
        { color:'linear-gradient(90deg,transparent,#1a5c35,transparent)', top:'20%', width:'120%', height:'180px', left:'-10%' },
        { color:'linear-gradient(90deg,transparent,#0d3d22,transparent)', top:'50%', width:'110%', height:'120px', left:'-5%' },
        { color:'linear-gradient(90deg,transparent,#2d7a4f,transparent)', top:'70%', width:'130%', height:'100px', left:'-15%' },
      ].map((s, i) => (
        <div key={i} ref={refs[i]} style={{
          position:'absolute', top: s.top, left: s.left,
          width: s.width, height: s.height,
          background: s.color,
          filter: 'blur(40px)', opacity: 0.8, willChange:'transform',
        }} />
      ))}
    </div>
  )
}

// ── Noise ──────────────────────────────────────────────────────────────────
function NoiseBg() {
  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf: number, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5
    const onMove = (e: MouseEvent) => { tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight }
    const tick = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06
      if (divRef.current) {
        divRef.current.style.backgroundPosition = `${cx * 100}% ${cy * 100}%`
      }
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div style={{ position:'fixed', inset:0, background:'#050f08', overflow:'hidden', zIndex:0 }}>
      <svg width={0} height={0} style={{ position:'absolute' }}>
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div ref={divRef} style={{
        position:'absolute', inset:0,
        background: 'radial-gradient(ellipse 80% 60% at 30% 40%, #1a5c35 0%, #0a2e18 40%, #050f08 80%)',
        backgroundSize: '200% 200%',
        transition: 'background-position 0.1s',
      }} />
      <div style={{
        position:'absolute', inset:0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
        opacity: 0.08, mixBlendMode: 'overlay',
      }} />
    </div>
  )
}

// ── Radial Burst ───────────────────────────────────────────────────────────
function RadialBg() {
  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf: number, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5
    const onMove = (e: MouseEvent) => { tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight }
    const tick = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08
      if (divRef.current) {
        divRef.current.style.background =
          `radial-gradient(ellipse 50% 50% at ${cx*100}% ${cy*100}%, #2d7a4f 0%, #0d3d22 35%, #050f08 70%)`
      }
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div ref={divRef} style={{ position:'fixed', inset:0, background:'#050f08', zIndex:0, willChange:'background' }} />
  )
}

// ── Particle ───────────────────────────────────────────────────────────────
function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf: number, mx = window.innerWidth / 2, my = window.innerHeight / 2
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const N = 60
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    }))
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#050f08'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx + (mx / canvas.width - 0.5) * 0.3
        p.y += p.vy + (my / canvas.height - 0.5) * 0.3
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
      })
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(45,122,79,${1 - d / 120})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
        ctx.beginPath()
        ctx.arc(a.x, a.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#2d7a4f'; ctx.fill()
      })
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', onResize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0 }} />
}

// ── Demo Page ──────────────────────────────────────────────────────────────
const OPTIONS: { key: Mode; label: string }[] = [
  { key: 'blobs',    label: 'Blobs (현재 + 추가)' },
  { key: 'aurora',   label: 'Aurora' },
  { key: 'noise',    label: 'Noise Gradient' },
  { key: 'radial',   label: 'Radial Burst' },
  { key: 'particle', label: 'Particle' },
]

export default function DemoPage() {
  const [mode, setMode] = useState<Mode>('blobs')
  return (
    <>
      {mode === 'blobs'    && <BlobsBg />}
      {mode === 'aurora'   && <AuroraBg />}
      {mode === 'noise'    && <NoiseBg />}
      {mode === 'radial'   && <RadialBg />}
      {mode === 'particle' && <ParticleBg />}

      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 999,
        background: 'rgba(0,0,0,0.6)', border: '1px solid #2d7a4f',
        borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {OPTIONS.map(o => (
          <label key={o.key} style={{ display:'flex', alignItems:'center', gap: 8, cursor:'pointer', color:'#E8D5A0', fontSize: 13 }}>
            <input type="radio" name="mode" value={o.key} checked={mode === o.key} onChange={() => setMode(o.key)} />
            {o.label}
          </label>
        ))}
      </div>
    </>
  )
}
