import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setField } from '../redux/formSlice'
import { api } from '../services/api'

// HCP Name field with directory autocomplete (GET /api/hcps). The AI can also fill this
// via search_hcp; this input lets the value be confirmed/adjusted against the directory.
export default function HCPNameField() {
  const dispatch = useDispatch()
  const value = useSelector((s) => s.form.hcp_name)
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function onChange(e) {
    const v = e.target.value
    dispatch(setField({ field: 'hcp_name', value: v }))
    if (v.trim().length >= 1) {
      try {
        const rows = await api.searchHcps(v)
        setResults(rows)
        setOpen(rows.length > 0)
      } catch {
        setResults([])
      }
    } else {
      setOpen(false)
    }
  }

  function pick(name) {
    dispatch(setField({ field: 'hcp_name', value: name }))
    setOpen(false)
  }

  return (
    <div className="field autocomplete" ref={boxRef}>
      <label>HCP Name</label>
      <input
        type="text"
        placeholder="Search or select HCP..."
        value={value}
        onChange={onChange}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && (
        <div className="suggestions-list">
          {results.map((r) => (
            <div key={r.id} onClick={() => pick(r.name)}>
              {r.name}
              <div className="sp-sub">
                {r.specialty}
                {r.organization ? ` · ${r.organization}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
