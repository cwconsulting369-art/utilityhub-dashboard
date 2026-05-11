'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import StatCounter from './StatCounter'

interface Props {
  value: number
  prefix?: string
  unit: string
  label: string
  decimals?: number
  delay?: number
}

export default function KPICard({ value, prefix, unit, label, decimals = 0, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      style={{
        textAlign: 'center',
        padding: 'clamp(1.5rem, 3vw, 2.5rem) 1rem',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <StatCounter value={value} prefix={prefix} unit={unit} label={label} decimals={decimals} />
    </motion.div>
  )
}
