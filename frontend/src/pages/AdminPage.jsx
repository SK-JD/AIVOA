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

  const pill = (ok) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold ${
      ok ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'
    }`

  return (
    <div className="px-4 pb-12 pt-6 sm:px-8">
      <h1 className="text-xl font-bold tracking-tight">Admin · Settings</h1>
      <p className="mb-5 text-[13px] text-slate-400">Configure the Groq LLM used by the agent. Changes apply immediately — no restart.</p>
      <div className="card max-w-[620px] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-5 py-3.5 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_0_4px_theme(colors.brand.soft)]" /> Groq / LLM Configuration
        </div>
        <div className="p-[22px]">
          <div className="mb-4">
            <label className="field-label">Admin Token</label>
            <input type="password" placeholder="X-Admin-Token (from backend .env)" value={token}
              onChange={(e) => dispatch(setToken(e.target.value))} onBlur={loadSettings} />
            <div className="mt-1.5 text-xs text-slate-400">Required to view or change settings.</div>
          </div>

          <div className="mb-4">
            <label className="field-label">Groq API Key</label>
            <input type="password"
              placeholder={settings?.has_key ? `Saved: ${settings.groq_api_key_masked} — paste to replace` : 'gsk_...'}
              value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <div className="mt-1.5 text-xs text-slate-400">Stored server-side; shown masked. Leave blank to keep the current key.</div>
          </div>

          <div className="mb-4">
            <label className="field-label">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="mt-2 flex gap-2.5">
            <button className="btn" onClick={onTest} disabled={status === 'loading' || !token}>Test Connection</button>
            <button className="btn btn-primary" onClick={onSave} disabled={status === 'loading' || !token}>Save Settings</button>
          </div>

          <div className="mt-4 flex flex-col items-start gap-2">
            {testResult && (
              testResult.ok
                ? <span className={pill(true)}>✓ Connected to Groq ({testResult.model})</span>
                : <span className={pill(false)}>✗ {testResult.error}</span>
            )}
            {status === 'saved' && <span className={pill(true)}>✓ Settings saved — active immediately</span>}
            {error && <span className={pill(false)}>{error}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
