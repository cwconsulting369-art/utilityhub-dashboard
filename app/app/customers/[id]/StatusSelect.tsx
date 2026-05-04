"use client"

import { useState, useTransition } from "react"
import { updateCustomerStatus } from "./actions"

const OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "active",   label: "Aktiv",      color: "#3fb950" },
  { value: "inactive", label: "Inaktiv",    color: "#8b949e" },
  { value: "blocked",  label: "Gesperrt",   color: "#f85149" },
  { value: "pending",  label: "Ausstehend", color: "#8b949e" },
]

interface Props {
  customerId:    string
  currentStatus: string
}

export function StatusSelect({ customerId, currentStatus }: Props) {
  const [status,    setStatus]    = useState(currentStatus)
  const [errorMsg,  setErrorMsg]  = useState("")
  const [isPending, startTransition] = useTransition()

  const option = OPTIONS.find(o => o.value === status) ?? { color: "#8b949e", label: status }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setErrorMsg("")
    setStatus(next)
    startTransition(async () => {
      const result = await updateCustomerStatus(customerId, next as Parameters<typeof updateCustomerStatus>[1])
      if (result.error) {
        setStatus(status) // revert on error
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        style={{
          background:    "transparent",
          border:        `1px solid ${option.color}55`,
          borderRadius:  "999px",
          padding:       "2px 28px 2px 10px",
          color:         option.color,
          fontSize:      "var(--text-xs)",
          fontWeight:    600,
          cursor:        isPending ? "not-allowed" : "pointer",
          appearance:    "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(option.color)}'/%3E%3C/svg%3E")`,
          backgroundRepeat:   "no-repeat",
          backgroundPosition: "right 9px center",
          opacity:       isPending ? 0.6 : 1,
          minWidth:      "110px",
        }}
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value} style={{ color: "var(--text)", background: "var(--surface-2)" }}>
            {o.label}
          </option>
        ))}
      </select>
      {errorMsg && (
        <span style={{ fontSize: "10px", color: "#f85149" }}>{errorMsg}</span>
      )}
    </div>
  )
}
