import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { api } from '../services/api'
import { loadInteraction, clearUpdated } from '../redux/formSlice'
import Icon from '../components/Icon'

const SENT_CLS = { Positive: 'pos', Neutral: 'neu', Negative: 'neg' }

// Records / Pipeline — a table of all saved interactions.
export default function PipelinePage() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    api.listInteractions().then(setRows).catch((e) => setError(e.message))
  }, [])

  // Load a row back into the form, then jump to the Log screen to edit it via chat.
  function load(row) {
    dispatch(loadInteraction(row))
    navigate('/')
    setTimeout(() => dispatch(clearUpdated()), 1800)
  }

  return (
    <div className="px-4 pb-12 pt-6 sm:px-8">
      <div className="mb-[18px] flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Interaction Pipeline</h1>
          <p className="text-[13px] text-slate-400">Every HCP interaction logged to the CRM.</p>
        </div>
        <Link to="/" className="btn btn-dark"><Icon name="plus" size={15} /> Log interaction</Link>
      </div>

      {error && <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700"><Icon name="alert" size={15} /> {error}</div>}
      {rows === null && !error && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[13.5px] text-slate-400">Loading…</div>}
      {rows && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[13.5px] text-slate-400">No interactions yet. <Link to="/" className="font-semibold text-brand">Log your first one →</Link></div>
      )}

      {rows && rows.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>HCP</th><th>Type</th><th>Date</th><th>Sentiment</th>
                <th>Topics</th><th>Materials</th><th>Samples</th><th>Follow-up</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold text-slate-900">{r.hcp_name || '—'}</td>
                  <td>{r.interaction_type}</td>
                  <td>{r.date || '—'}</td>
                  <td><span className={`sent-badge ${SENT_CLS[r.sentiment] || 'neu'}`}>{r.sentiment}</span></td>
                  <td className="max-w-[240px] truncate">{r.topics || '—'}</td>
                  <td>{r.materials_shared?.length || 0}</td>
                  <td>{r.samples_distributed?.reduce((n, s) => n + (s.quantity || 1), 0) || 0}</td>
                  <td className="max-w-[240px] truncate">{r.followup_actions || '—'}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => load(r)} title="Load into the form to edit via chat">
                      <Icon name="upload" size={14} /> Load
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
