'use client'
import { useEffect, useRef } from 'react'

export default function MeshBackground() {
  const blob1 = useRef<HTMLDivElement>(null)
  const blob2 = useRef<HTMLDivElement>(null)
  const blob3 = useRef<HTMLDivElement>(null)
  const blob4 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number
    let startTime: number | null = null

    // 블롭마다 주파수·위상을 다르게 줘서 서로 독립적으로 떠다니는 것처럼 보이게 함
    const configs = [
      { xFreq: 0.18, yFreq: 0.23, xPhase: 0.0, yPhase: 1.2, xAmp: 220, yAmp: 180 },
      { xFreq: 0.22, yFreq: 0.17, xPhase: 2.1, yPhase: 0.5, xAmp: 260, yAmp: 220 },
      { xFreq: 0.15, yFreq: 0.20, xPhase: 4.3, yPhase: 3.1, xAmp: 180, yAmp: 200 },
      { xFreq: 0.19, yFreq: 0.14, xPhase: 1.5, yPhase: 5.0, xAmp: 240, yAmp: 160 },
    ]

    const blobs = [blob1, blob2, blob3, blob4]

    const rand = () => Math.random() * 80 - 10
    blobs.forEach(ref => {
      if (ref.current) {
        ref.current.style.left = `${rand()}%`
        ref.current.style.top  = `${rand()}%`
      }
    })

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const t = (timestamp - startTime) / 1000

      blobs.forEach((ref, i) => {
        if (!ref.current) return
        const { xFreq, yFreq, xPhase, yPhase, xAmp, yAmp } = configs[i]
        const x = Math.sin(t * xFreq + xPhase) * xAmp
        const y = Math.cos(t * yFreq + yPhase) * yAmp
        ref.current.style.transform = `translate(${x}px, ${y}px)`
      })

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="mesh-bg" aria-hidden="true">
      <div className="mesh-blob mesh-blob-1" ref={blob1} />
      <div className="mesh-blob mesh-blob-2" ref={blob2} />
      <div className="mesh-blob mesh-blob-3" ref={blob3} />
      <div className="mesh-blob mesh-blob-4" ref={blob4} />
    </div>
  )
}
