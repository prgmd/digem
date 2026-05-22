'use client'
import { useRef, useEffect, CSSProperties } from 'react'

interface Props {
  children: string
  style?: CSSProperties
  className?: string
  speed?: number  // px per second
  onClick?: (e: React.MouseEvent) => void
  active?: boolean  // when defined, marquee is parent-controlled instead of self-hover
}

export default function MarqueeText({ children, style, className, speed = 40, onClick, active }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<Animation | null>(null)

  const getOverflow = () => {
    if (!wrapRef.current || !textRef.current) return 0
    const original = textRef.current.style.maxWidth
    textRef.current.style.maxWidth = 'none'
    const overflow = Math.max(0, textRef.current.scrollWidth - wrapRef.current.clientWidth)
    textRef.current.style.maxWidth = original
    return overflow
  }

  const start = () => {
    const overflow = getOverflow()
    if (!overflow || !textRef.current) return
    textRef.current.style.maxWidth = 'none'
    textRef.current.style.textOverflow = 'clip'
    animRef.current?.cancel()
    animRef.current = textRef.current.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(-${overflow}px)` }],
      { duration: (overflow / speed) * 1000, fill: 'forwards', easing: 'linear', delay: 500 }
    )
  }

  const stop = () => {
    animRef.current?.cancel()
    if (textRef.current) {
      textRef.current.style.transform = ''
      textRef.current.style.maxWidth = ''
      textRef.current.style.textOverflow = ''
    }
  }

  useEffect(() => {
    if (active === undefined) return
    if (active) start()
    else stop()
    return () => stop()
  }, [active])

  const isControlled = active !== undefined

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ overflow: 'hidden', ...style }}
      onMouseEnter={isControlled ? undefined : start}
      onMouseLeave={isControlled ? undefined : stop}
      onClick={onClick}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'bottom',
        }}
      >
        {children}
      </span>
    </div>
  )
}
