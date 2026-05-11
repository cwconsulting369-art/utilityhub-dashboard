'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  prefix?: string
  unit: string
  label: string
  decimals?: number
}

function useCountUp(target: number, active: boolean, duration = 2000, decimals = 0) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!active) return
    if (prefersReduced.current) { setCount(target); return }

    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.min(now - start, duration)
      const progress = elapsed / duration
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(+(eased * target).toFixed(decimals))
      if (elapsed < duration) { rafRef.current = requestAnimationFrame(tick) }
      else { setCount(target) }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, target, duration, decimals])

  return count
}

export default function StatCounter({ value, prefix, unit, label, decimals = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const count = useCountUp(value, inView, 2000, decimals)

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4 }}
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: 'var(--color-accent)',
          marginBottom: '0.4rem',
        }}
      >
        {prefix && <span style={{ fontSize: '0.65em', fontWeight: 700 }}>{prefix}</span>}
        {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
        <span style={{
          fontSize: '0.55em', fontWeight: 700,
          color: 'var(--color-text-muted)', marginLeft: '0.15em',
        }}>{unit}</span>
      </motion.div>
      <p style={{
        fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
        fontWeight: 500, lineHeight: 1.4,
      }}>
        {label}
      </p>
    </div>
  )
}
