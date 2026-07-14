import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addSample, removeSample } from '../redux/formSlice'
import Icon from './Icon'

// Samples Distributed — physical product samples given to the HCP (name + quantity).
export default function SamplesField() {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.form.samples_distributed) || []
  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)

  function add() {
    if (!name.trim()) return
    dispatch(addSample({ name: name.trim(), quantity: Number(qty) || 1 }))
    setName('')
    setQty(1)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
      <span className="text-[13px] font-semibold text-slate-700">Samples Distributed</span>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <input className="min-w-0 flex-1 basis-[180px]" type="text" placeholder="Sample name (e.g. Product X Sample)"
          value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
        <input className="w-20 shrink-0 text-center" type="number" min="1" value={qty}
          onChange={(e) => setQty(e.target.value)} title="Quantity" />
        <button className="btn btn-primary btn-sm shrink-0" onClick={add}>Add</button>
      </div>

      {items.length === 0 ? (
        <div className="mt-2 text-[12.5px] text-slate-400">No samples added.</div>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {items.map((s, i) => (
            <span key={`${s.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 py-1 pl-2.5 pr-1.5 text-[12.5px] font-medium text-emerald-700">
              <Icon name="box" size={14} />
              {s.name} <b>×{s.quantity}</b>
              <button onClick={() => dispatch(removeSample(i))} title="Remove" className="grid place-items-center opacity-70 hover:opacity-100">
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
