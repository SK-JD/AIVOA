// Shared constants and the canonical empty form (mirrors backend FormState).

export const INTERACTION_TYPES = ['In-person Meeting', 'Call', 'Email', 'Virtual', 'Conference']
export const SENTIMENTS = ['Positive', 'Neutral', 'Negative']

// Marketing-collateral catalog (mirrors backend app/config/catalog.py). `icon` → Icon name.
export const MATERIAL_TYPES = [
  { type: 'Brochure', icon: 'book' },
  { type: 'Product Leaflet', icon: 'doc' },
  { type: 'Clinical Study', icon: 'beaker' },
  { type: 'Research Paper', icon: 'doc' },
  { type: 'Product Catalogue', icon: 'book' },
  { type: 'Presentation Deck', icon: 'monitor' },
  { type: 'Safety Information', icon: 'shield' },
  { type: 'Other Marketing Material', icon: 'doc' },
]

export const MATERIAL_ICON = Object.fromEntries(MATERIAL_TYPES.map((m) => [m.type, m.icon]))

// Fields the user must provide for a meaningful log (mirrors backend form_logic).
export const REQUIRED_FIELDS = ['hcp_name', 'topics']

export const EMPTY_FORM = {
  hcp_name: '',
  interaction_type: 'In-person Meeting',
  date: '',
  time: '',
  duration: '',
  attendees: [], // [{ name, role }]
  topics: '',
  materials_shared: [], // [{ type, name }]
  samples_distributed: [], // [{ name, quantity }]
  sentiment: 'Neutral',
  outcomes: '',
  followup_actions: '',
}
