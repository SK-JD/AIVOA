import { createSlice } from '@reduxjs/toolkit'
import { EMPTY_FORM } from '../utils/constants'

// Holds the Log HCP Interaction form. AI-driven writes arrive as a partial `form_patch`
// and are merged via `applyPatch`; manual field edits use `setField`.
const formSlice = createSlice({
  name: 'form',
  initialState: { ...EMPTY_FORM, savedId: null, suggestions: [] },
  reducers: {
    setField(state, action) {
      const { field, value } = action.payload
      state[field] = value
    },
    applyPatch(state, action) {
      const patch = action.payload || {}
      Object.entries(patch).forEach(([key, value]) => {
        if (key in EMPTY_FORM) state[key] = value
      })
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
      return { ...EMPTY_FORM, savedId: null, suggestions: [] }
    },
  },
})

export const {
  setField,
  applyPatch,
  setSuggestions,
  addSuggestionToFollowups,
  setSavedId,
  resetForm,
} = formSlice.actions
export default formSlice.reducer
