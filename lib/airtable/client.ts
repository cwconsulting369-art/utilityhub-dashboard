export interface AirtableRecord {
  id:               string
  createdTime:      string
  fields:           Record<string, unknown>
  lastModifiedTime: string | null
}

export interface FetchOptions {
  pat:     string
  baseId:  string
  tableId: string
}

/** Fetches all records from an Airtable table, handling pagination automatically. */
export async function fetchAllRecords(opts: FetchOptions): Promise<AirtableRecord[]> {
  const { pat, baseId, tableId } = opts
  const all: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`)
    url.searchParams.set("pageSize", "100")
    if (offset) url.searchParams.set("offset", offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${pat}` },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable API ${res.status}: ${body}`)
    }

    const json = await res.json() as {
      records: { id: string; createdTime: string; fields: Record<string, unknown> }[]
      offset?: string
    }

    for (const r of json.records) {
      const lastMod = (r.fields["Last Modified"] ?? r.fields["Zuletzt geändert"] ?? null) as string | null
      all.push({ id: r.id, createdTime: r.createdTime, fields: r.fields, lastModifiedTime: lastMod })
    }

    offset = json.offset
  } while (offset)

  return all
}

/** Test connection — returns table name and column count. */
export async function testConnection(opts: FetchOptions): Promise<{ title: string; propertyCount: number }> {
  const { pat, baseId, tableId } = opts

  const metaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: { Authorization: `Bearer ${pat}` },
  })

  if (!metaRes.ok) {
    const body = await metaRes.text()
    throw new Error(`Airtable Meta API ${metaRes.status}: ${body}`)
  }

  const meta = await metaRes.json() as { tables: { id: string; name: string; fields: unknown[] }[] }
  const table = meta.tables.find(t => t.id === tableId || t.name === tableId)
  if (!table) throw new Error(`Tabelle "${tableId}" nicht gefunden`)

  return { title: table.name, propertyCount: table.fields.length }
}
