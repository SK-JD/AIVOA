import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setField } from '../redux/formSlice'
import { api } from '../services/api'

// HCP Name with directory autocomplete + a VERIFIED badge and specialty subtitle when the
// current name matches a directory entry (the AI can also fill this via search_hcp).
export default function HCPNameField({ highlight = false }) {
  const dispatch = useDispatch()
  const value = useSelector((s) => s.form.hcp_name)
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [matched, setMatched] = useState(null)
  const boxRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    let alive = true
    const name = (value || '').trim()
    if (!name) { setMatched(null); return }
    api.searchHcps(name).then((rows) => {
      if (!alive) return
      setMatched(rows.find((r) => r.name.toLowerCase() === name.toLowerCase()) || null)
    }).catch(() => {})
    return () => { alive = false }
  }, [value])

  async function onChange(e) {
    const v = e.target.value
    dispatch(setField({ field: 'hcp_name', value: v }))
    if (v.trim().length >= 1) {
      try {
        const rows = await api.searchHcps(v)
        setResults(rows)
        setOpen(rows.length > 0)
      } catch { setResults([]) }
    } else {
      setOpen(false)
    }
  }

  function pick(name) {
    dispatch(setField({ field: 'hcp_name', value: name }))
    setOpen(false)
  }

  return (
    <div className={`relative mb-4 ${highlight ? 'animate-flash rounded-lg' : ''}`} ref={boxRef}>
      <label className="field-label">HCP Name <span className="req">*</span></label>
      <div className="relative">
        <input type="text" placeholder="Search or select HCP..." value={value} onChange={onChange}
          onFocus={() => results.length && setOpen(true)} />
        {matched && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-violet-200 bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-600">
            VERIFIED
          </span>
        )}
      </div>
      {matched && (
        <div className="mt-1.5 text-xs text-slate-400">
          {matched.specialty}{matched.organization ? ` · ${matched.organization}` : ''}
        </div>
      )}
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-[220px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-pop">
          {results.map((r) => (
            <div key={r.id} onClick={() => pick(r.name)} className="cursor-pointer rounded-md px-2.5 py-2 text-[13px] hover:bg-slate-100">
              {r.name}
              <div className="mt-0.5 text-[11.5px] text-slate-400">{r.specialty}{r.organization ? ` · ${r.organization}` : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
