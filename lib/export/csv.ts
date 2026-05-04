type CellValue = string | number | null | undefined

/** Escape a single cell value per RFC 4180. */
function escapeCell(v: CellValue): string {
  if (v == null) return ""
  const s = String(v)
  // Wrap in quotes if value contains comma, newline, carriage return, or double-quote
  if (s.includes(",") || s.includes("\n") || s.includes("\r") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/** Build a complete CSV string with UTF-8 BOM (for Excel compatibility). */
export function buildCsv(headers: string[], rows: CellValue[][]): string {
  const BOM   = "﻿"
  const lines = [headers, ...rows].map(row => row.map(escapeCell).join(","))
  return BOM + lines.join("\r\n")
}

/** Standard CSV response headers. */
export function csvHeaders(filename: string): Record<string, string> {
  return {
    "Content-Type":        "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
  }
}
