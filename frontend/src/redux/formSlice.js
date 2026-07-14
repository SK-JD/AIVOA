import { createSlice } from '@reduxjs/toolkit'
import { EMPTY_FORM } from '../utils/constants'

// Holds the Log HCP Interaction form. AI-driven writes arrive as a partial `form_patch`
// and are merged via `applyPatch`; `updatedFields` briefly flags what the AI just changed
// so the UI can highlight it (the form as a live mirror of the conversation).
const formSlice = createSlice({
  name: 'form',
  initialState: { ...EMPTY_FORM, savedId: null, suggestions: [], updatedFields: [] },
  reducers: {
    setField(state, action) {
      const { field, value } = action.payload
      state[field] = value
    },
    applyPatch(state, action) {
      const patch = action.payload || {}
      const changed = []
      Object.entries(patch).forEach(([key, value]) => {
        if (key in EMPTY_FORM) {
          state[key] = value
          changed.push(key)
        }
      })
      state.updatedFields = changed
    },
    clearUpdated(state) {
      state.updatedFields = []
    },
    // Materials Shared — list of { type, name }
    addMaterial(state, action) {
      const { type, name } = action.payload
      const label = (name || type || '').trim()
      if (label && !state.materials_shared.some((m) => m.name === label)) {
        state.materials_shared.push({ type, name: label })
      }
    },
    removeMaterial(state, action) {
      state.materials_shared = state.materials_shared.filter((_, i) => i !== action.payload)
    },
    // Samples Distributed — list of { name, quantity }
    addSample(state, action) {
      const { name, quantity } = action.payload
      const label = (name || '').trim()
      if (label && !state.samples_distributed.some((s) => s.name === label)) {
        state.samples_distributed.push({ name: label, quantity: quantity || 1 })
      }
    },
    removeSample(state, action) {
      state.samples_distributed = state.samples_distributed.filter((_, i) => i !== action.payload)
    },
    setSuggestions(state, action) {
      state.suggestions = action.payload || []
    },
    addSuggestionToFollowups(state, action) {
      const text = action.payload
      const existing = state.followup_actions.trim()
      state.followup_actions = existing ? `${existing}\n${text}` : text
      state.suggestions = state.suggestions.filter((s) => s !== text)
    },
    setSavedId(state, action) {
      state.savedId = action.payload
    },
    resetForm() {
      return { ...EMPTY_FORM, savedId: null, suggestions: [], updatedFields: [] }
    },
  },
})

export const {
  setField,
  applyPatch,
  clearUpdated,
  addMaterial,
  removeMaterial,
  addSample,
  removeSample,
  setSuggestions,
  addSuggestionToFollowups,
  setSavedId,
  resetForm,
} = formSlice.actions
export default formSlice.reducer
