"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { OnboardingStep, OnboardingStatusResponse } from "@/app/api/onboarding/status/route"

interface Props {
  userId: string
}

const STORAGE_KEY = (id: string) => `uh_onboarding_done_${id}`

export default function OnboardingChecklist({ userId }: Props) {
  const [steps,     setSteps]     = useState<OnboardingStep[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY(userId))) return

    fetch("/api/onboarding/status")
      .then(r => r.json())
      .then((data: OnboardingStatusResponse) => {
        if (!data.show) {
          localStorage.setItem(STORAGE_KEY(userId), "1")
          return
        }
        setSteps(data.steps)
        setVisible(true)
      })
      .catch(() => {})
  }, [userId])

  useEffect(() => {
    if (steps.length > 0 && steps.every(s => s.done)) {
      localStorage.setItem(STORAGE_KEY(userId), "1")
      const t = setTimeout(() => setVisible(false), 1200)
      return () => clearTimeout(t)
    }
  }, [steps, userId])

  if (!visible) return null

  const doneCount  = steps.filter(s => s.done).length
  const totalCount = steps.length
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div style={{
      position:     "fixed",
      bottom:       "var(--space-6)",
      right:        "var(--space-6)",
      zIndex:       50,
      width:        collapsed ? "auto" : "300px",
      background:   "var(--surface)",
      border:       "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
      overflow:     "hidden",
      transition:   "width 0.2s ease",
    }}>

      {/* Header */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "var(--space-3) var(--space-4)",
        borderBottom:   collapsed ? "none" : "1px solid var(--border)",
        cursor:         "pointer",
        userSelect:     "none",
      }} onClick={() => setCollapsed(c => !c)}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "14px" }}>🚀</span>
          {!collapsed && (
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
              Setup-Checkliste
            </span>
          )}
          <span style={{
            fontSize:   "var(--text-xs)",
            fontWeight: 700,
            color:      pct === 100 ? "#3fb950" : "var(--primary-bright)",
            background: pct === 100 ? "rgba(63,185,80,0.12)" : "rgba(88,166,255,0.12)",
            border:     `1px solid ${pct === 100 ? "rgba(63,185,80,0.3)" : "rgba(88,166,255,0.3)"}`,
            borderRadius: "var(--radius-sm)",
            padding:    "1px 7px",
          }}>
            {doneCount}/{totalCount}
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
          {collapsed ? "▲" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "var(--space-3) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>

          {/* Progress bar */}
          <div style={{ marginBottom: "var(--space-2)" }}>
            <div style={{ height: "4px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                width:      `${pct}%`,
                height:     "100%",
                background: pct === 100 ? "#3fb950" : "var(--primary-bright)",
                borderRadius: "999px",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Steps */}
          {steps.map(step => (
            <Link key={step.id} href={step.href} style={{
              display:        "flex",
              alignItems:     "center",
              gap:            "var(--space-3)",
              padding:        "var(--space-2) var(--space-1)",
              borderRadius:   "var(--radius-md)",
              textDecoration: "none",
              color:          "inherit",
              opacity:        step.done ? 0.5 : 1,
              transition:     "opacity 0.2s",
            }}>
              <span style={{
                flexShrink:   0,
                width:        "18px",
                height:       "18px",
                borderRadius: "50%",
                border:       step.done ? "none" : "1.5px solid var(--border)",
                background:   step.done ? "#3fb950" : "transparent",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                fontSize:     "10px",
                color:        "#fff",
              }}>
                {step.done ? "✓" : ""}
              </span>
              <span style={{
                fontSize:        "var(--text-sm)",
                textDecoration:  step.done ? "line-through" : "none",
                color:           step.done ? "var(--text-muted)" : "inherit",
              }}>
                {step.label}
              </span>
            </Link>
          ))}

          <p style={{
            marginTop: "var(--space-2)",
            fontSize:  "var(--text-xs)",
            color:     "var(--text-muted)",
            lineHeight: 1.4,
          }}>
            Erledige alle Schritte, um das Setup abzuschließen.
          </p>
        </div>
      )}
    </div>
  )
}
