import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addSample, removeSample } from '../redux/formSlice'
import Icon from './Icon'

// Samples Distributed — physical product samples given to the HCP (name + quantity).
// Kept visually and semantically distinct from Materials Shared.
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
    <div className="matbox">
      <div className="matbox-head">
        <span className="t">Samples Distributed</span>
      </div>

      <div className="sample-add">
        <input
          type="text"
          placeholder="Sample name (e.g. Product X Sample)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <input
          type="number"
          min="1"
          className="qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          title="Quantity"
        />
        <button className="btn primary sm" onClick={add}>Add</button>
      </div>

      {items.length === 0 ? (
        <div className="empty">No samples added.</div>
      ) : (
        <div className="chips">
          {items.map((s, i) => (
            <span className="chip sample" key={`${s.name}-${i}`}>
              <Icon name="box" size={14} />
              {s.name} <b>×{s.quantity}</b>
              <button onClick={() => dispatch(removeSample(i))} title="Remove">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
