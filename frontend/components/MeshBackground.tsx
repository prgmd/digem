'use client'
import { useEffect, useRef } from 'react'

export default function MeshBackground() {
  const blob1 = useRef<HTMLDivElement>(null)
  const blob2 = useRef<HTMLDivElement>(null)
  const blob3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number
    let targetX = 0.5, targetY = 0.5
    let currentX = 0.5, currentY = 0.5

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth
      targetY = e.clientY / window.innerHeight
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      const cx = currentX - 0.5
      const cy = currentY - 0.5

      if (blob1.current) blob1.current.style.transform = `translate(${cx * 260}px, ${cy * 220}px)`
      if (blob2.current) blob2.current.style.transform = `translate(${-cx * 320}px, ${-cy * 280}px)`
      if (blob3.current) blob3.current.style.transform = `translate(${cx * 180}px, ${-cy * 200}px)`

      rafId = requestAnimationFrame(animate)
    }

    // 초기 위치 랜덤
    const rand = () => Math.random() * 80 - 10  // -10% ~ 70% 범위
    ;[blob1, blob2, blob3].forEach(ref => {
      if (ref.current) {
        ref.current.style.left = `${rand()}%`
        ref.current.style.top = `${rand()}%`
      }
    })

    window.addEventListener('mousemove', onMouseMove)
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="mesh-bg" aria-hidden="true">
      <div className="mesh-blob mesh-blob-1" ref={blob1} />
      <div className="mesh-blob mesh-blob-2" ref={blob2} />
      <div className="mesh-blob mesh-blob-3" ref={blob3} />
    </div>
  )
}
