import { useDispatch, useSelector } from 'react-redux'
import { setField, addSuggestionToFollowups } from '../redux/formSlice'
import { INTERACTION_TYPES, SENTIMENTS } from '../utils/constants'
import HCPNameField from './HCPNameField'
import ChipList from './ChipList'

// The Log HCP Interaction form (left panel). Every field is driven by Redux, so the AI
// Assistant's form patches update it live; fields can also be adjusted manually.
export default function InteractionForm() {
  const dispatch = useDispatch()
  const form = useSelector((s) => s.form)
  const set = (field) => (e) => dispatch(setField({ field, value: e.target.value }))

  return (
    <div className="panel">
      <div className="panel-header">Interaction Details</div>
      <div className="panel-body">
        <div className="row">
          <HCPNameField />
          <div className="field">
            <label>Interaction Type</label>
            <select value={form.interaction_type} onChange={set('interaction_type')}>
              {INTERACTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" value={form.time} onChange={set('time')} />
          </div>
        </div>

        <div className="field">
          <label>Attendees</label>
          <ChipList field="attendees" placeholder="Enter names and press Enter..." emptyText="No attendees added." />
        </div>

        <div className="field">
          <label>Topics Discussed</label>
          <textarea placeholder="Enter key discussion points..." value={form.topics} onChange={set('topics')} />
          <button className="btn" style={{ marginTop: 8 }} title="Use the AI Assistant to summarize a voice note">
            🎙 Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        <div className="subhead">Materials Shared / Samples Distributed</div>
        <div className="field">
          <label>Materials Shared</label>
          <ChipList field="materials_shared" placeholder="Add a brochure / PDF and press Enter..." emptyText="No materials added." />
        </div>
        <div className="field">
          <label>Samples Distributed</label>
          <ChipList field="samples_distributed" placeholder="Add a sample and press Enter..." emptyText="No samples added." />
        </div>

        <div className="field">
          <label>Observed/Inferred HCP Sentiment</label>
          <div className="sentiments">
            {SENTIMENTS.map((s) => (
              <label key={s}>
                <input
                  type="radio"
                  name="sentiment"
                  checked={form.sentiment === s}
                  onChange={() => dispatch(setField({ field: 'sentiment', value: s }))}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Outcomes</label>
          <textarea placeholder="Key outcomes or agreements..." value={form.outcomes} onChange={set('outcomes')} />
        </div>

        <div className="field">
          <label>Follow-up Actions</label>
          <textarea placeholder="Enter next steps or tasks..." value={form.followup_actions} onChange={set('followup_actions')} />
          {form.suggestions.length > 0 && (
            <div className="suggests">
              <div className="s-title">AI Suggested Follow-ups:</div>
              {form.suggestions.map((s) => (
                <a key={s} onClick={() => dispatch(addSuggestionToFollowups(s))}>+ {s}</a>
              ))}
            </div>
          )}
        </div>

        {form.savedId != null && (
          <div className="status-ok">✓ Saved to CRM as record #{form.savedId}</div>
        )}
      </div>
    </div>
  )
}
