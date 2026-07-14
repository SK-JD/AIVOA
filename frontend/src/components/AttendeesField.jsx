import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addAttendee, removeAttendee } from '../redux/formSlice'
import Icon from './Icon'

// Attendees — people present besides the HCP, each with an optional role. Tag-input style.
export default function AttendeesField() {
  const dispatch = useDispatch()
  const attendees = useSelector((s) => s.form.attendees) || []
  const [draft, setDraft] = useState('')

  function commit() {
    const v = draft.trim()
    if (!v) return
    const [name, role] = v.split(/\s*[·,]\s*/)
    dispatch(addAttendee({ name, role: role || '' }))
    setDraft('')
  }

  return (
    <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
      {attendees.map((a, i) => (
        <span key={`${a.name}-${i}`} className="tag-chip">
          {a.name}
          {a.role ? <em className="not-italic font-medium text-violet-400"> · {a.role}</em> : null}
          <button onClick={() => dispatch(removeAttendee(i))} title="Remove" className="grid place-items-center text-brand opacity-70 hover:opacity-100">
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="min-w-[140px] flex-1 border-none p-0 px-0.5 py-1 text-[13px] outline-none focus:ring-0"
        placeholder={attendees.length ? 'Add attendee...' : 'Add attendee (e.g. Anitha Rao · Product Specialist)'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commit())}
      />
    </div>
  )
}
