import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMaterial, removeMaterial } from '../redux/formSlice'
import { MATERIAL_TYPES, MATERIAL_ICON } from '../utils/constants'
import Icon from './Icon'

// Materials Shared — catalog-backed picker rendering each item as a preview card
// (type icon + name + remove). The AI also fills this via log_interaction / search_materials.
export default function MaterialsField() {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.form.materials_shared) || []
  const [open, setOpen] = useState(false)
  const [type, setType] = useState(MATERIAL_TYPES[0].type)
  const [name, setName] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function add() {
    dispatch(addMaterial({ type, name: name.trim() || type }))
    setName('')
    setOpen(false)
  }

  return (
    <div className="matbox" ref={boxRef}>
      <div className="matbox-head">
        <span className="t">Materials Shared</span>
        <button className="btn sm" onClick={() => setOpen((o) => !o)}>
          <Icon name="plus" size={15} /> Add Material
        </button>
      </div>

      {items.length === 0 && !open && <div className="empty">No materials added.</div>}

      {open && (
        <div className="picker">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {MATERIAL_TYPES.map((m) => (
              <option key={m.type} value={m.type}>{m.type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Name (optional, e.g. Product X Brochure)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          />
          <button className="btn primary sm" onClick={add}>Add</button>
        </div>
      )}

      {items.length > 0 && (
        <div className="mat-cards">
          {items.map((m, i) => (
            <div className="mat-card" key={`${m.name}-${i}`}>
              <span className="mat-icon"><Icon name={MATERIAL_ICON[m.type] || 'doc'} size={18} /></span>
              <span className="mat-meta">
                <span className="mat-name">{m.name}</span>
                <span className="mat-type">{m.type}</span>
              </span>
              <button className="mat-remove" onClick={() => dispatch(removeMaterial(i))} title="Remove">
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
