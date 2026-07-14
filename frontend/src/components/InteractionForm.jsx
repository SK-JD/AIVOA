import { useDispatch, useSelector } from 'react-redux'
import { setField, addSuggestionToFollowups } from '../redux/formSlice'
import { INTERACTION_TYPES } from '../utils/constants'
import HCPNameField from './HCPNameField'
import ChipList from './ChipList'
import MaterialBox from './MaterialBox'
import Icon from './Icon'

const SENTIMENT_META = [
  { value: 'Positive', icon: 'smile', cls: 'pos' },
  { value: 'Neutral', icon: 'meh', cls: 'neu' },
  { value: 'Negative', icon: 'frown', cls: 'neg' },
]

// The Log HCP Interaction form (left panel). Every field is driven by Redux, so the AI
// Assistant's form patches update it live; fields can also be adjusted manually.
export default function InteractionForm() {
  const dispatch = useDispatch()
  const form = useSelector((s) => s.form)
  const set = (field) => (e) => dispatch(setField({ field, value: e.target.value }))

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="dot" /> Interaction Details
      </div>
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
          <button className="btn ghost sm voice-btn" title="Use the AI Assistant to summarize a voice note">
            <Icon name="mic" size={15} /> Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        <div className="subhead">Materials Shared / Samples Distributed</div>
        <MaterialBox
          field="materials_shared"
          title="Materials Shared"
          icon="search"
          buttonLabel="Search / Add"
          emptyText="No materials added."
          placeholder="Add a brochure / PDF..."
        />
        <MaterialBox
          field="samples_distributed"
          title="Samples Distributed"
          icon="plus"
          buttonLabel="Add Sample"
          emptyText="No samples added."
          placeholder="Add a sample..."
        />

        <div className="field" style={{ marginTop: 20 }}>
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

        <div className="field">
          <label>Outcomes</label>
          <textarea placeholder="Key outcomes or agreements..." value={form.outcomes} onChange={set('outcomes')} />
        </div>

        <div className="field">
          <label>Follow-up Actions</label>
          <textarea placeholder="Enter next steps or tasks..." value={form.followup_actions} onChange={set('followup_actions')} />
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
