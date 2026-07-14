import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import InteractionForm from '../components/InteractionForm'
import ChatAssistant from '../components/ChatAssistant'
import Icon from '../components/Icon'
import { useSaveInteraction } from '../hooks/useSaveInteraction'
import { resetForm } from '../redux/formSlice'

// The main screen: scrollable form (left) + fixed AI Assistant chat (right, docked).
export default function LogInteractionPage() {
  const dispatch = useDispatch()
  const { save, saving, error } = useSaveInteraction()
  const [toast, setToast] = useState(null)

  async function handleSave() {
    const id = await save()
    if (id != null) setToast({ ok: true, id })
  }

  return (
    <div className="grid grid-cols-1 items-start lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0 px-4 pb-12 pt-5 sm:px-8">
        <div className="mb-[18px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">
            FIELD ACTIVITY <span className="mx-1.5">/</span> NEW ENTRY
          </div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mb-1.5 text-2xl font-bold tracking-tight">Log HCP Interaction</h1>
              <p className="m-0 max-w-[460px] text-[13px] leading-relaxed text-slate-400">
                Describe the visit to the AI assistant — it structures the details, extracts
                follow-ups, and files it to the CRM.
              </p>
            </div>
            <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
              <Icon name="save" size={15} /> {saving ? 'Saving…' : 'Save Interaction'}
            </button>
          </div>

          {toast?.ok && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
              <Icon name="check" size={15} /> Saved as record #{toast.id}.
              <Link to="/pipeline" className="ml-1.5 font-semibold">View in Pipeline →</Link>
            </div>
          )}
          {error && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
              <Icon name="alert" size={15} /> {error}
            </div>
          )}
        </div>

        <InteractionForm onSave={handleSave} saving={saving} onDiscard={() => { dispatch(resetForm()); setToast(null) }} />
      </div>

      <div className="sticky top-[60px] h-[600px] border-t border-slate-200 bg-white lg:h-[calc(100vh-60px)] lg:border-l lg:border-t-0">
        <ChatAssistant />
      </div>
    </div>
  )
}
