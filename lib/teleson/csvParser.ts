/**
 * Robust CSV/TSV parser for Teleson and Notion exports.
 * Handles: UTF-8 BOM, CRLF, auto-detect delimiter (;  ,  \t), RFC 4180 quoted fields.
 */
export function parseCsv(rawText: string): Record<string, string>[] {
  // Strip UTF-8 BOM
  const text = rawText.replace(/^﻿/, "")

  // Split lines (handles both CRLF and LF)
  const allLines = text.split(/\r?\n/)

  // Skip leading blank lines to find header
  let headerIdx = 0
  while (headerIdx < allLines.length && allLines[headerIdx].trim() === "") headerIdx++
  if (headerIdx >= allLines.length) return []

  const delimiter = detectDelimiter(allLines[headerIdx])
  const headers   = splitLine(allLines[headerIdx], delimiter).map(h => h.trim())
  if (headers.length === 0 || headers.every(h => h === "")) return []

  const rows: Record<string, string>[] = []

  for (let i = headerIdx + 1; i < allLines.length; i++) {
    const line = allLines[i]
    if (line.trim() === "") continue

    const fields = splitLine(line, delimiter)
    if (fields.every(f => f.trim() === "")) continue   // skip all-empty rows

    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      if (h !== "") row[h] = (fields[idx] ?? "").trim()
    })
    rows.push(row)
  }

  return rows
}

function detectDelimiter(line: string): string {
  const sc = (line.match(/;/g)  ?? []).length
  const co = (line.match(/,/g)  ?? []).length
  const ta = (line.match(/\t/g) ?? []).length
  // Tab wins if clearly dominant (Notion TSV exports)
  if (ta > 0 && ta >= sc && ta >= co) return "\t"
  return sc >= co ? ";" : ","
}

function splitLine(line: string, delimiter: string): string[] {
  const fields: string[] = []
  let current  = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote (RFC 4180)
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current)
      current = ""
    } else {
      current += ch
    }
  }

  fields.push(current)
  return fields
}
