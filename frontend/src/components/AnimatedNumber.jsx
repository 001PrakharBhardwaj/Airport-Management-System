import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, className }) {
  const numericValue = Number(value) || 0
  const [displayValue, setDisplayValue] = useState(0)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericValue)
      return undefined
    }

    let frame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return

      observer.disconnect()
      const start = performance.now()
      const duration = 900

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration)
        const eased = 1 - (1 - progress) ** 3
        setDisplayValue(Math.round(numericValue * eased))
        if (progress < 1) frame = window.requestAnimationFrame(tick)
      }

      frame = window.requestAnimationFrame(tick)
    }, { threshold: 0.4 })

    observer.observe(element)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [numericValue])

  return (
    <strong className={className} ref={elementRef}>
      {displayValue}
    </strong>
  )
}
