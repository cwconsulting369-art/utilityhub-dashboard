'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="de">
      <body style={{ background: '#0a0c10', color: '#e8eaf0', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Etwas ist schiefgelaufen.</h2>
          <button onClick={() => reset()} style={{ background: '#3a6fd8', color: '#fff', border: 'none', padding: '0.6rem 1.4rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  )
}
