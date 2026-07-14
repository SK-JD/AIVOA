import { useDispatch, useSelector } from 'react-redux'
import { setField, addSuggestionToFollowups } from '../redux/formSlice'
import { INTERACTION_TYPES } from '../utils/constants'
import HCPNameField from './HCPNameField'
import AttendeesField from './AttendeesField'
import MaterialsField from './MaterialsField'
import SamplesField from './SamplesField'
import VoiceNoteButton from './VoiceNoteButton'
import Icon from './Icon'

const SENTIMENT_META = [
  { value: 'Positive', icon: 'smile', ring: 'ring-emerald-500/20 border-emerald-500 bg-emerald-50', ic: 'text-emerald-500', dot: 'bg-emerald-500' },
  { value: 'Neutral', icon: 'meh', ring: 'ring-amber-500/20 border-amber-500 bg-amber-50', ic: 'text-amber-500', dot: 'bg-amber-500' },
  { value: 'Negative', icon: 'frown', ring: 'ring-red-500/20 border-red-500 bg-red-50', ic: 'text-red-500', dot: 'bg-red-500' },
]

// The Log HCP Interaction form — a live, structured mirror of the conversation.
export default function InteractionForm({ onSave, saving, onDiscard }) {
  const dispatch = useDispatch()
  const form = useSelector((s) => s.form)
  const updated = form.updatedFields || []
  const set = (field) => (e) => dispatch(setField({ field, value: e.target.value }))
  const flash = (field) => (updated.includes(field) ? 'animate-flash rounded-lg' : '')
  const anyFilled = form.hcp_name || form.topics

  return (
    <div className="flex flex-col gap-4">
      {/* Interaction Details */}
      <section className="card">
        <div className="flex items-center justify-between border-b border-slate-200 px-[18px] py-3.5">
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <Icon name="clipboard" size={16} className="text-brand" /> Interaction Details
            {anyFilled && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">Auto-filled</span>}
          </span>
          <span className="text-[11.5px] text-slate-400">Section 1 of 1</span>
        </div>
        <div className="p-[18px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HCPNameField highlight={updated.includes('hcp_name')} />
            <div className={`mb-4 ${flash('interaction_type')}`}>
              <label className="field-label">Interaction Type <span className="req">*</span></label>
              <select value={form.interaction_type} onChange={set('interaction_type')}>
                {INTERACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={`mb-4 ${flash('date')}`}>
              <label className="field-label flex items-center gap-1.5"><Icon name="calendar" size={13} className="text-slate-400" /> Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className={`mb-4 ${flash('time')}`}>
              <label className="field-label flex items-center gap-1.5"><Icon name="clock" size={13} className="text-slate-400" /> Time</label>
              <input type="time" value={form.time} onChange={set('time')} />
            </div>
            <div className={`mb-4 ${flash('duration')}`}>
              <label className="field-label">Duration</label>
              <input type="text" placeholder="e.g. 25 minutes" value={form.duration} onChange={set('duration')} />
            </div>
          </div>

          <div className={`mb-4 ${flash('attendees')}`}>
            <label className="field-label flex items-center gap-1.5"><Icon name="users" size={13} className="text-slate-400" /> Attendees</label>
            <AttendeesField />
          </div>

          <div className={`mb-1 ${flash('topics')}`}>
            <label className="field-label">Topics Discussed <span className="req">*</span></label>
            <textarea placeholder="Key discussion points (e.g. efficacy, dosage, pricing)..." value={form.topics} onChange={set('topics')} />
            <div className="mt-2.5 flex flex-wrap gap-2">
              <VoiceNoteButton />
              <button className="btn btn-ghost btn-sm" title="Ask the assistant to suggest topics" disabled>
                <Icon name="sparkles" size={14} /> Suggest topics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Materials / Samples */}
      <div className="mt-3 mb-1 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
        Materials Shared / Samples Distributed
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <section className="card p-[18px]">
        <MaterialsField />
        <SamplesField />
      </section>

      {/* Sentiment */}
      <div className={flash('sentiment')}>
        <label className="field-label">Observed / Inferred HCP Sentiment</label>
        <div className="grid grid-cols-3 gap-2.5">
          {SENTIMENT_META.map((s) => {
            const on = form.sentiment === s.value
            return (
              <div
                key={s.value}
                onClick={() => dispatch(setField({ field: 'sentiment', value: s.value }))}
                className={`relative flex cursor-pointer items-center gap-2.5 rounded-[10px] border-[1.5px] px-3 py-2.5 transition ${on ? `${s.ring} ring-[3px]` : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <Icon name={s.icon} size={20} className={s.ic} />
                <span className="text-[13px] font-semibold text-slate-700">{s.value}</span>
                {on && <span className={`absolute right-3 h-[7px] w-[7px] rounded-full ${s.dot}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className={`mt-4 ${flash('outcomes')}`}>
        <label className="field-label">Outcomes <span className="text-[11.5px] font-medium text-slate-400">— what happened</span></label>
        <textarea placeholder="Result of the meeting (e.g. Showed interest, requested clinical data)..." value={form.outcomes} onChange={set('outcomes')} />
      </div>

      <div className={flash('followup_actions')}>
        <label className="field-label">Follow-up Actions <span className="text-[11.5px] font-medium text-slate-400">— what happens next</span></label>
        <textarea placeholder="Next steps (e.g. Send Phase III PDF, call in two weeks)..." value={form.followup_actions} onChange={set('followup_actions')} />
        {form.suggestions.length > 0 && (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
              <Icon name="sparkles" size={14} className="text-brand" /> AI Suggested Follow-ups
            </div>
            <div className="flex flex-col gap-1.5">
              {form.suggestions.map((s) => (
                <span key={s} onClick={() => dispatch(addSuggestionToFollowups(s))}
                  className="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12.5px] text-slate-600 transition hover:border-violet-100 hover:bg-brand-soft hover:text-brand-600">
                  <Icon name="plus" size={14} className="text-brand" /> {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span className="text-xs text-slate-400">
          {form.savedId != null ? `Saved to CRM · record #${form.savedId}` : 'All fields synced with CRM'}
        </span>
        <div className="flex gap-2.5">
          <button className="btn btn-ghost" onClick={onDiscard}>Discard</button>
          <button className="btn btn-dark" onClick={onSave} disabled={saving}>
            <Icon name="save" size={15} /> {saving ? 'Saving…' : 'Save Interaction'}
          </button>
        </div>
      </div>
    </div>
  )
}
