import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../services/api'
import { setToken, setSettings, setTestResult, setStatus, setError } from '../redux/adminSlice'

const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant']

// Admin panel: paste/rotate the Groq API key, pick the model, Test Connection, and Save.
// Settings persist server-side (app_settings) and take effect without a restart.
export default function AdminPage() {
  const dispatch = useDispatch()
  const { token, settings, testResult, status, error } = useSelector((s) => s.admin)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('openai/gpt-oss-120b')

  async function loadSettings() {
    if (!token) return
    try {
      const s = await api.getSettings(token)
      dispatch(setSettings(s))
      setModel(s.groq_model)
      dispatch(setStatus('idle'))
    } catch (e) {
      dispatch(setError(e.message))
    }
  }

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onTest() {
    dispatch(setTestResult(null))
    dispatch(setStatus('loading'))
    try {
      const res = await api.testConnection(token, {
        groq_api_key: apiKey || null,
        groq_model: model,
      })
      dispatch(setTestResult(res))
      dispatch(setStatus('idle'))
    } catch (e) {
      dispatch(setError(e.message))
    }
  }

  async function onSave() {
    dispatch(setStatus('loading'))
    try {
      const s = await api.saveSettings(token, {
        groq_api_key: apiKey || null,
        groq_model: model,
      })
      dispatch(setSettings(s))
      setApiKey('')
      dispatch(setStatus('saved'))
    } catch (e) {
      dispatch(setError(e.message))
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Admin · Settings</h1>
      <p className="page-sub">Configure the Groq LLM used by the agent. Changes apply immediately — no restart.</p>
      <div className="panel card">
        <div className="panel-header"><span className="dot" /> Groq / LLM Configuration</div>
        <div className="panel-body">
          <div className="field">
            <label>Admin Token</label>
            <input
              type="password"
              placeholder="X-Admin-Token (from backend .env)"
              value={token}
              onChange={(e) => dispatch(setToken(e.target.value))}
              onBlur={loadSettings}
            />
            <div className="form-note">Required to view or change settings.</div>
          </div>

          <div className="field">
            <label>Groq API Key</label>
            <input
              type="password"
              placeholder={
                settings?.has_key ? `Saved: ${settings.groq_api_key_masked} — paste to replace` : 'gsk_...'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="form-note">Stored server-side; shown masked. Leave blank to keep the current key.</div>
          </div>

          <div className="field">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn" onClick={onTest} disabled={status === 'loading' || !token}>
              Test Connection
            </button>
            <button className="btn primary" onClick={onSave} disabled={status === 'loading' || !token}>
              Save Settings
            </button>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            {testResult && (
              testResult.ok ? (
                <span className="pill ok">✓ Connected to Groq ({testResult.model})</span>
              ) : (
                <span className="pill bad">✗ {testResult.error}</span>
              )
            )}
            {status === 'saved' && <span className="pill ok">✓ Settings saved — active immediately</span>}
            {error && <span className="pill bad">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
