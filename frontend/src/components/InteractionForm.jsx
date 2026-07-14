import { useDispatch, useSelector } from 'react-redux'
import { setField, addSuggestionToFollowups } from '../redux/formSlice'
import { INTERACTION_TYPES, REQUIRED_FIELDS } from '../utils/constants'
import HCPNameField from './HCPNameField'
import ChipList from './ChipList'
import MaterialsField from './MaterialsField'
import SamplesField from './SamplesField'
import Icon from './Icon'

const SENTIMENT_META = [
  { value: 'Positive', icon: 'smile', cls: 'pos' },
  { value: 'Neutral', icon: 'meh', cls: 'neu' },
  { value: 'Negative', icon: 'frown', cls: 'neg' },
]

// The Log HCP Interaction form (left panel) — a live, structured mirror of the conversation.
// Fields the AI just changed briefly highlight; required fields are marked.
export default function InteractionForm() {
  const dispatch = useDispatch()
  const form = useSelector((s) => s.form)
  const updated = form.updatedFields || []
  const set = (field) => (e) => dispatch(setField({ field, value: e.target.value }))
  const cls = (field) => `field${updated.includes(field) ? ' updated' : ''}`
  const req = (field) => (REQUIRED_FIELDS.includes(field) ? <span className="req">*</span> : null)

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="dot" /> Interaction Details
      </div>
      <div className="panel-body">
        <div className="row">
          <HCPNameField highlight={updated.includes('hcp_name')} />
          <div className={cls('interaction_type')}>
            <label>Interaction Type</label>
            <select value={form.interaction_type} onChange={set('interaction_type')}>
              {INTERACTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className={cls('date')}>
            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className={cls('time')}>
            <label>Time</label>
            <input type="time" value={form.time} onChange={set('time')} />
          </div>
        </div>

        <div className={cls('attendees')}>
          <label>Attendees</label>
          <ChipList field="attendees" placeholder="Add a name (e.g. Regional Manager) and press Enter..." emptyText="No attendees added." />
        </div>

        <div className={cls('topics')}>
          <label>Topics Discussed {req('topics')}</label>
          <textarea placeholder="Key discussion points (e.g. Product X efficacy, dosage, pricing)..." value={form.topics} onChange={set('topics')} />
          <button className="btn ghost sm voice-btn" title="Voice logging (coming soon)" disabled>
            <Icon name="mic" size={15} /> Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        <div className="subhead">Materials Shared / Samples Distributed</div>
        <div className={updated.includes('materials_shared') ? 'flash' : ''}>
          <MaterialsField />
        </div>
        <div className={updated.includes('samples_distributed') ? 'flash' : ''}>
          <SamplesField />
        </div>

        <div className={cls('sentiment')} style={{ marginTop: 20 }}>
          <label>Observed / Inferred HCP Sentiment</label>
          <div className="sentiments">
            {SENTIMENT_META.map((s) => (
              <div
                key={s.value}
                className={`sent ${s.cls} ${form.sentiment === s.value ? 'on' : ''}`}
                onClick={() => dispatch(setField({ field: 'sentiment', value: s.value }))}
              >
                <Icon name={s.icon} size={20} className="icn" />
                <span className="lbl">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cls('outcomes')}>
          <label>Outcomes <span className="hint">— what happened</span></label>
          <textarea placeholder="Result of the meeting (e.g. Showed interest, requested clinical data)..." value={form.outcomes} onChange={set('outcomes')} />
        </div>

        <div className={cls('followup_actions')}>
          <label>Follow-up Actions <span className="hint">— what happens next</span></label>
          <textarea placeholder="Next steps (e.g. Send Phase III PDF, call in two weeks)..." value={form.followup_actions} onChange={set('followup_actions')} />
          {form.suggestions.length > 0 && (
            <div className="suggests">
              <div className="s-title"><Icon name="sparkles" size={14} /> AI Suggested Follow-ups</div>
              <div className="s-list">
                {form.suggestions.map((s) => (
                  <span className="suggest-item" key={s} onClick={() => dispatch(addSuggestionToFollowups(s))}>
                    <Icon name="plus" size={14} className="plus" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {form.savedId != null && (
          <div className="saved-banner"><Icon name="check" size={16} /> Saved to CRM as record #{form.savedId}</div>
        )}
      </div>
    </div>
  )
}
