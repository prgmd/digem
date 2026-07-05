'use client'
import { useEffect, useRef, type CSSProperties } from 'react'

// 은은한 앰비언트 blob 3개. amber(브랜드색)와 딥그린을 섞어 팔레트에 녹이고,
// 저알파 + 강한 blur로 "빛 번짐"처럼 보이게 해 텍스트 가독성을 해치지 않음.
const BLOBS: { size: number; bg: string; cfg: Cfg }[] = [
  {
    size: 620,
    bg: 'radial-gradient(circle, rgba(232, 213, 160, 0.20) 0%, rgba(232, 213, 160, 0.07) 45%, transparent 70%)',
    cfg: { xFreq: 0.11, yFreq: 0.14, xPhase: 0.0, yPhase: 1.2, xAmp: 160, yAmp: 120 },
  },
  {
    size: 560,
    bg: 'radial-gradient(circle, rgba(232, 213, 160, 0.17) 0%, rgba(232, 213, 160, 0.06) 45%, transparent 70%)',
    cfg: { xFreq: 0.13, yFreq: 0.10, xPhase: 2.1, yPhase: 0.5, xAmp: 190, yAmp: 150 },
  },
  {
    size: 480,
    bg: 'radial-gradient(circle, rgba(232, 213, 160, 0.14) 0%, rgba(232, 213, 160, 0.05) 45%, transparent 70%)',
    cfg: { xFreq: 0.09, yFreq: 0.12, xPhase: 4.3, yPhase: 3.1, xAmp: 140, yAmp: 130 },
  },
]

interface Cfg {
  xFreq: number; yFreq: number
  xPhase: number; yPhase: number
  xAmp: number; yAmp: number
}

export default function MeshBackground() {
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  useEffect(() => {
    // 로드마다 시작 위치를 랜덤 배치해 매번 다른 구도
    const rand = () => Math.random() * 70 - 5
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.style.left = `${rand()}%`
        ref.current.style.top = `${rand()}%`
      }
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId = 0
    let start: number | null = null
    const animate = (ts: number) => {
      if (start === null) start = ts
      const t = (ts - start) / 1000
      refs.forEach((ref, i) => {
        if (!ref.current) return
        const c = BLOBS[i].cfg
        const x = Math.sin(t * c.xFreq + c.xPhase) * c.xAmp
        const y = Math.cos(t * c.yFreq + c.yPhase) * c.yAmp
        ref.current.style.transform = `translate(${x}px, ${y}px)`
      })
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  const wrap: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: -1,
    overflow: 'hidden',
    pointerEvents: 'none',
  }

  return (
    <div style={wrap} aria-hidden="true">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={refs[i]}
          style={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: b.bg,
            filter: 'blur(60px)',
            opacity: 0.9,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      ))}
    </div>
  )
}
