/**
 * Read-only Notion API client.
 * Server-only — uses NOTION_API_KEY which must never be exposed to the browser.
 */

const NOTION_VERSION = "2022-06-28"
const BASE           = "https://api.notion.com/v1"

function headers(): Record<string, string> {
  return {
    Authorization:    `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type":   "application/json",
  }
}

// ── Property extraction ───────────────────────────────────────────────────────

type NotionProp = Record<string, unknown>

function propToString(prop: NotionProp): string | null {
  const t = prop.type as string

  if (t === "title")
    return (prop.title as { plain_text: string }[])
      .map(r => r.plain_text).join("").trim() || null

  if (t === "rich_text")
    return (prop.rich_text as { plain_text: string }[])
      .map(r => r.plain_text).join("").trim() || null

  if (t === "select") {
    const s = prop.select as { name: string } | null
    return s?.name?.trim() || null
  }

  if (t === "date") {
    const d = prop.date as { start: string } | null
    return d?.start ?? null
  }

  if (t === "number")
    return prop.number != null ? String(prop.number) : null

  return null
}

/**
 * Flatten a Notion page's properties to Record<string, string>.
 * Property keys are trimmed (handles trailing spaces like "Laufzeit ").
 */
export function pageToRecord(page: Record<string, unknown>): Record<string, string> {
  const props = page.properties as Record<string, NotionProp>
  const record: Record<string, string> = {}

  for (const [key, prop] of Object.entries(props)) {
    const val = propToString(prop)
    if (val !== null && val !== "") record[key.trim()] = val
  }

  return record
}

// ── API calls ─────────────────────────────────────────────────────────────────

export interface NotionDatabaseInfo {
  id:            string
  title:         string
  propertyCount: number
  properties:    Record<string, string> // name → type
}

/** GET /databases/:id — connection test + schema. */
export async function getDatabaseInfo(dbId: string): Promise<NotionDatabaseInfo> {
  const res = await fetch(`${BASE}/databases/${dbId}`, { headers: headers() })
  if (!res.ok) {
    const err = await res.json() as { message?: string }
    throw new Error(`Notion ${res.status}: ${err.message ?? JSON.stringify(err)}`)
  }
  const data = await res.json() as {
    id:         string
    title:      { plain_text: string }[]
    properties: Record<string, { type: string }>
  }
  return {
    id:            data.id,
    title:         data.title[0]?.plain_text ?? "Unbekannte DB",
    propertyCount: Object.keys(data.properties).length,
    properties:    Object.fromEntries(
      Object.entries(data.properties).map(([k, v]) => [k.trim(), v.type])
    ),
  }
}

/** POST /databases/:id/query — fetches ALL pages with automatic cursor pagination. */
export async function queryAllPages(dbId: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = []
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = { page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const res = await fetch(`${BASE}/databases/${dbId}/query`, {
      method:  "POST",
      headers: headers(),
      body:    JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json() as { message?: string }
      throw new Error(`Notion ${res.status}: ${err.message ?? JSON.stringify(err)}`)
    }

    const data = await res.json() as {
      results:     Record<string, unknown>[]
      has_more:    boolean
      next_cursor: string | null
    }

    for (const page of data.results) rows.push(pageToRecord(page))

    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined
  } while (cursor)

  return rows
}

// ── Rich page fetch (used by sync route) ─────────────────────────────────────

export interface NotionPageWithMeta {
  pageId:       string   // Notion page UUID
  lastEditedAt: string   // ISO timestamp from Notion (last_edited_time)
  props:        Record<string, string>  // flattened property values
}

/**
 * Like queryAllPages but preserves page ID and last_edited_time.
 * Used by the sync route — queryAllPages discards these fields.
 */
export async function queryAllPagesWithMeta(dbId: string): Promise<NotionPageWithMeta[]> {
  const pages: NotionPageWithMeta[] = []
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = { page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const res = await fetch(`${BASE}/databases/${dbId}/query`, {
      method:  "POST",
      headers: headers(),
      body:    JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json() as { message?: string }
      throw new Error(`Notion ${res.status}: ${err.message ?? JSON.stringify(err)}`)
    }

    const data = await res.json() as {
      results:     { id: string; last_edited_time: string; [key: string]: unknown }[]
      has_more:    boolean
      next_cursor: string | null
    }

    for (const page of data.results) {
      pages.push({
        pageId:       page.id,
        lastEditedAt: page.last_edited_time,
        props:        pageToRecord(page as Record<string, unknown>),
      })
    }

    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined
  } while (cursor)

  return pages
}
