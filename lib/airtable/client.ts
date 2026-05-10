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

/** Test connection — fetches one record to verify PAT + base + table access. */
export async function testConnection(opts: FetchOptions): Promise<{ title: string; propertyCount: number }> {
  const { pat, baseId, tableId } = opts

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`)
  url.searchParams.set("pageSize", "1")

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${pat}` },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Airtable API ${res.status}: ${body}`)
  }

  const json = await res.json() as { records: { fields: Record<string, unknown> }[] }
  const propertyCount = json.records[0] ? Object.keys(json.records[0].fields).length : 0

  return { title: tableId, propertyCount }
}
