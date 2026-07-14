// Shared constants and the canonical empty form (mirrors backend FormState).

export const INTERACTION_TYPES = ['Meeting', 'Call', 'Email', 'Conference', 'Virtual']
export const SENTIMENTS = ['Positive', 'Neutral', 'Negative']

export const EMPTY_FORM = {
  hcp_name: '',
  interaction_type: 'Meeting',
  date: '',
  time: '',
  attendees: [],
  topics: '',
  materials_shared: [],
  samples_distributed: [],
  sentiment: 'Neutral',
  outcomes: '',
  followup_actions: '',
}
