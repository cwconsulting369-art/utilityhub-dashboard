// Customer-name formatting helpers shared between the admin tables.
//
// `full_name` follows the convention "<Hausverwaltung> / <Strasse Nr>".
// Some legacy rows have the slash padded with non-space whitespace (incl. `\n`),
// so the split must tolerate any whitespace around the slash, not just `" / "`.

export function getStreet(fullName: string): string {
  const m = /\s*\/\s*/.exec(fullName)
  if (!m) return fullName
  const tail = fullName.slice(m.index + m[0].length).trim()
  return tail || fullName
}
