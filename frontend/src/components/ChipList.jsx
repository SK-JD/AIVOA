import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setField } from '../redux/formSlice'

// Renders a list-type form field (attendees / materials / samples) as removable chips
// with a small add-input. The AI fills these via tools; this allows manual tweaks too.
export default function ChipList({ field, placeholder, emptyText }) {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.form[field]) || []
  const [draft, setDraft] = useState('')

  function commit() {
    const v = draft.trim()
    if (!v) return
    if (!items.includes(v)) dispatch(setField({ field, value: [...items, v] }))
    setDraft('')
  }

  function remove(item) {
    dispatch(setField({ field, value: items.filter((i) => i !== item) }))
  }

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commit())}
      />
      {items.length === 0 ? (
        <div className="muted" style={{ marginTop: 6 }}>{emptyText}</div>
      ) : (
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
