import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMaterial, removeMaterial } from '../redux/formSlice'
import { MATERIAL_TYPES, MATERIAL_ICON } from '../utils/constants'
import Icon from './Icon'

// Materials Shared — catalog-backed picker rendering each item as a preview card.
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
    <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5" ref={boxRef}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-slate-700">Materials Shared</span>
        <button className="btn btn-sm" onClick={() => setOpen((o) => !o)}>
          <Icon name="plus" size={15} /> Add Material
        </button>
      </div>

      {items.length === 0 && !open && <div className="mt-2 text-[12.5px] text-slate-400">No materials added.</div>}

      {open && (
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="w-[160px] shrink-0" value={type} onChange={(e) => setType(e.target.value)}>
            {MATERIAL_TYPES.map((m) => <option key={m.type} value={m.type}>{m.type}</option>)}
          </select>
          <input className="min-w-0 flex-1 basis-[160px]" type="text" placeholder="Name (optional, e.g. Product X Brochure)"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
          <button className="btn btn-primary btn-sm shrink-0" onClick={add}>Add</button>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {items.map((m, i) => (
            <div key={`${m.name}-${i}`} className="flex min-w-[170px] items-center gap-2.5 rounded-[10px] border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
              <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-lg border border-violet-100 bg-brand-soft text-brand-600">
                <Icon name={MATERIAL_ICON[m.type] || 'doc'} size={18} />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[12.5px] font-semibold text-slate-900">{m.name}</span>
                <span className="text-[11px] text-slate-400">{m.type}</span>
              </span>
              <button onClick={() => dispatch(removeMaterial(i))} title="Remove"
                className="ml-auto grid place-items-center rounded-md p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
