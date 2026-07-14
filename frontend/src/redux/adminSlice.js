import { createSlice } from '@reduxjs/toolkit'

// Admin panel state: current settings, the admin token, and test-connection status.
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    token: localStorage.getItem('adminToken') || '',
    settings: null, // { groq_api_key_masked, groq_model, has_key }
    testResult: null, // { ok, model, error }
    status: 'idle', // idle | loading | saved | error
    error: null,
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload
      localStorage.setItem('adminToken', action.payload)
    },
    setSettings(state, action) {
      state.settings = action.payload
    },
    setTestResult(state, action) {
      state.testResult = action.payload
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

export const { setToken, setSettings, setTestResult, setStatus, setError } = adminSlice.actions
export default adminSlice.reducer
