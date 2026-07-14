import { createSlice } from '@reduxjs/toolkit'

// Chat transcript + request status for the AI Assistant panel.
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      {
        role: 'assistant',
        content:
          'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.',
      },
    ],
    status: 'idle', // idle | loading | error
    error: null,
  },
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload)
    },
    setStatus(state, action) {
      state.status = action.payload
    },
    setError(state, action) {
      state.status = 'error'
      state.error = action.payload
    },
  },
})

export const { addMessage, setStatus, setError } = chatSlice.actions
export default chatSlice.reducer
