'use client'
import { useRef, useEffect, CSSProperties } from 'react'

interface Props {
  children: string
  style?: CSSProperties
  className?: string
  speed?: number  // px per second
  onClick?: (e: React.MouseEvent) => void
}

export default function MarqueeText({ children, style, className, speed = 40, onClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<Animation | null>(null)

  useEffect(() => {
    // recalculate overflow when text or container size changes
  }, [children])

  const getOverflow = () => {
    if (!wrapRef.current || !textRef.current) return 0
    return Math.max(0, textRef.current.scrollWidth - wrapRef.current.clientWidth)
  }

  const handleEnter = () => {
    const overflow = getOverflow()
    if (!overflow || !textRef.current) return
    animRef.current?.cancel()
    animRef.current = textRef.current.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(-${overflow}px)` }],
      { duration: (overflow / speed) * 1000, fill: 'forwards', easing: 'linear', delay: 500 }
    )
  }

  const handleLeave = () => {
    animRef.current?.cancel()
    if (textRef.current) {
      textRef.current.style.transform = ''
    }
  }

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ overflow: 'hidden', ...style }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      <span ref={textRef} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  )
}
