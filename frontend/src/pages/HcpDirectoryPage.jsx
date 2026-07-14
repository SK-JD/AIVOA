import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import Icon from '../components/Icon'

// HCP Directory — the seeded HCP list from the database.
export default function HcpDirectoryPage() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    api.searchHcps('').then(setRows).catch((e) => setError(e.message))
  }, [])

  const filtered = useMemo(
    () => (rows || []).filter((r) => r.name.toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  )

  return (
    <div className="px-4 pb-12 pt-6 sm:px-8">
      <div className="mb-[18px] flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">HCP Directory</h1>
          <p className="text-[13px] text-slate-400">Healthcare professionals in the CRM.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-400">
          <Icon name="search" size={15} />
          <input type="text" placeholder="Search HCPs..." value={q} onChange={(e) => setQ(e.target.value)}
            className="w-[200px] border-none p-0 text-[13px] outline-none focus:ring-0" />
        </div>
      </div>

      {error && <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700"><Icon name="alert" size={15} /> {error}</div>}
      {rows === null && !error && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[13.5px] text-slate-400">Loading…</div>}

      {rows && (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Specialty</th><th>Organization</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold text-slate-900">
                    <span className="mr-2.5 inline-grid h-[26px] w-[26px] place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-600 align-middle">
                      {r.name.replace(/^Dr\.?\s*/, '').charAt(0)}
                    </span>
                    {r.name}
                  </td>
                  <td>{r.specialty || '—'}</td>
                  <td>{r.organization || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
