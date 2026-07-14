import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setField } from '../redux/formSlice'
import Icon from './Icon'

// A bordered "Materials Shared" / "Samples Distributed" box matching the reference mock:
// a title with an add button that reveals an inline input; added items show as chips.
export default function MaterialBox({ field, title, icon, buttonLabel, emptyText, placeholder }) {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.form[field]) || []
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  function commit() {
    const v = draft.trim()
    if (!v) return
    if (!items.includes(v)) dispatch(setField({ field, value: [...items, v] }))
    setDraft('')
    setOpen(false)
  }

  function remove(item) {
    dispatch(setField({ field, value: items.filter((i) => i !== item) }))
  }

  return (
    <div className="matbox">
      <div className="matbox-head">
        <span className="t">{title}</span>
        <button className="btn sm" onClick={() => setOpen((o) => !o)}>
          <Icon name={icon} size={15} /> {buttonLabel}
        </button>
      </div>

      {items.length === 0 && !open && <div className="empty">{emptyText}</div>}

      {open && (
        <div className="add-row">
          <input
            type="text"
            autoFocus
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commit())}
          />
          <button className="btn primary sm" onClick={commit}>Add</button>
        </div>
      )}

      {items.length > 0 && (
        <div className="chips">
          {items.map((item) => (
            <span className="chip" key={item}>
              {item}
              <button onClick={() => remove(item)} title="Remove">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
