"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import type { SearchResult } from "@/app/api/search/route"

const TYPE_LABELS: Record<string, string> = {
  object: "Objekte",
  org:    "Hausverwaltungen",
}

const TYPE_ICONS: Record<string, string> = {
  object: "🏠",
  org:    "🏢",
}

export default function GlobalSearch({
  apiPath    = "/api/search",
  placeholder = "Objekt oder Hausverwaltung suchen…",
}: {
  apiPath?:     string
  placeholder?: string
}) {
  const router = useRouter()

  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [cursor,  setCursor]  = useState(-1)

  const inputRef    = useRef<HTMLInputElement>(null)
  const listRef     = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults([])
      setCursor(-1)
    }
  }, [open])

  // Fetch with debounce
  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res  = await fetch(`${apiPath}?q=${encodeURIComponent(q)}`)
      const data = await res.json() as SearchResult[]
      setResults(Array.isArray(data) ? data : [])
      setCursor(-1)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(val), 220)
  }

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setCursor(c => Math.min(c + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setCursor(c => Math.max(c - 1, 0))
    } else if (e.key === "Enter" && cursor >= 0) {
      navigate(results[cursor].href)
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (cursor < 0 || !listRef.current) return
    const el = listRef.current.querySelectorAll<HTMLElement>("[data-result]")[cursor]
    el?.scrollIntoView({ block: "nearest" })
  }, [cursor])

  // Group results
  const groups: { type: string; items: SearchResult[] }[] = []
  for (const r of results) {
    let g = groups.find(x => x.type === r.type)
    if (!g) { g = { type: r.type, items: [] }; groups.push(g) }
    g.items.push(r)
  }

  let itemIndex = -1 // global counter for cursor comparison

  return (
    <>
      {/* Search trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.12 }}
        title="Suche (⌘K)"
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
          height:       "38px",
          padding:      "0 14px",
          background:   "rgba(255,255,255,0.04)",
          border:       "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          cursor:       "pointer",
          color:        "var(--text-muted)",
          fontSize:     "13px",
          flexShrink:   0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Suche…</span>
        <span style={{
          marginLeft:   "8px",
          padding:      "1px 6px",
          background:   "rgba(255,255,255,0.07)",
          borderRadius: "4px",
          fontSize:     "11px",
          fontFamily:   "monospace",
          color:        "var(--text-muted)",
          border:       "1px solid var(--border)",
        }}>⌘K</span>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position:        "fixed",
              inset:           0,
              background:      "rgba(0,0,0,0.55)",
              backdropFilter:  "blur(3px)",
              zIndex:          100,
              display:         "flex",
              alignItems:      "flex-start",
              justifyContent:  "center",
              paddingTop:      "12vh",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                width:        "560px",
                maxWidth:     "calc(100vw - 32px)",
                background:   "var(--surface)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow:    "0 16px 48px rgba(0,0,0,0.6)",
                overflow:     "hidden",
              }}
            >
              {/* Input */}
              <div style={{
                display:     "flex",
                alignItems:  "center",
                gap:         "12px",
                padding:     "0 16px",
                borderBottom: results.length > 0 ? "1px solid var(--border)" : "none",
              }}>
                {loading
                  ? <Spinner />
                  : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  )
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  style={{
                    flex:        1,
                    height:      "56px",
                    background:  "transparent",
                    border:      "none",
                    outline:     "none",
                    fontSize:    "16px",
                    color:       "var(--text)",
                  }}
                />
                <kbd style={{
                  padding:      "2px 7px",
                  background:   "rgba(255,255,255,0.06)",
                  border:       "1px solid var(--border)",
                  borderRadius: "4px",
                  fontSize:     "11px",
                  color:        "var(--text-muted)",
                  flexShrink:   0,
                }}>Esc</kbd>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div
                  ref={listRef}
                  style={{ maxHeight: "400px", overflowY: "auto", padding: "8px" }}
                >
                  {groups.map(group => (
                    <div key={group.type}>
                      <div style={{
                        padding:     "6px 8px 4px",
                        fontSize:    "11px",
                        fontWeight:  600,
                        color:       "var(--text-muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}>
                        {TYPE_ICONS[group.type]} {TYPE_LABELS[group.type] ?? group.type}
                      </div>
                      {group.items.map(item => {
                        itemIndex++
                        const idx     = itemIndex
                        const isActive = cursor === idx
                        return (
                          <motion.button
                            key={item.id}
                            data-result
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setCursor(idx)}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              display:      "flex",
                              alignItems:   "center",
                              gap:          "12px",
                              width:        "100%",
                              padding:      "10px 12px",
                              borderRadius: "var(--radius-md)",
                              background:   isActive ? "rgba(255,255,255,0.07)" : "transparent",
                              border:       "none",
                              cursor:       "pointer",
                              textAlign:    "left",
                              transition:   "background 100ms ease",
                            }}
                          >
                            <span style={{ fontSize: "18px", lineHeight: 1 }}>{TYPE_ICONS[item.type]}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize:     "var(--text-sm)",
                                fontWeight:   500,
                                color:        "var(--text)",
                                overflow:     "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace:   "nowrap",
                              }}>
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: isActive ? 1 : 0 }}>
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </motion.button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {query.length >= 2 && !loading && results.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                  Keine Ergebnisse für „{query}"
                </div>
              )}

              {/* Hint bar */}
              <div style={{
                display:      "flex",
                gap:          "16px",
                padding:      "8px 16px",
                borderTop:    "1px solid var(--border)",
                fontSize:     "11px",
                color:        "var(--text-muted)",
              }}>
                <span><Kbd>↑↓</Kbd> Navigieren</span>
                <span><Kbd>↵</Kbd> Öffnen</span>
                <span><Kbd>Esc</Kbd> Schließen</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      padding:      "1px 5px",
      background:   "rgba(255,255,255,0.06)",
      border:       "1px solid var(--border)",
      borderRadius: "3px",
      fontFamily:   "monospace",
      fontSize:     "10px",
    }}>
      {children}
    </kbd>
  )
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{
        width:        "18px",
        height:       "18px",
        borderRadius: "50%",
        border:       "2px solid var(--border)",
        borderTopColor: "var(--text-muted)",
        flexShrink:   0,
      }}
    />
  )
}
