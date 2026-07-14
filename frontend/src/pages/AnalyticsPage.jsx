import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import Icon from '../components/Icon'

const StatCard = ({ icon, iconCls = '', num, label }) => (
  <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
    <span className={`grid h-10 w-10 flex-none place-items-center rounded-[11px] ${iconCls || 'bg-brand-soft text-brand-600'}`}><Icon name={icon} size={18} /></span>
    <div>
      <div className="text-[22px] font-bold tracking-tight">{num}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  </div>
)

const BAR_CLS = { Positive: 'bg-emerald-500', Neutral: 'bg-amber-500', Negative: 'bg-red-500' }

// Analytics — simple real stats computed from the saved interactions.
export default function AnalyticsPage() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.listInteractions().then(setRows).catch((e) => setError(e.message))
  }, [])

  const stats = useMemo(() => {
    const r = rows || []
    const bySent = { Positive: 0, Neutral: 0, Negative: 0 }
    let materials = 0
    let samples = 0
    r.forEach((x) => {
      bySent[x.sentiment] = (bySent[x.sentiment] || 0) + 1
      materials += x.materials_shared?.length || 0
      samples += x.samples_distributed?.reduce((n, s) => n + (s.quantity || 1), 0) || 0
    })
    return { total: r.length, bySent, materials, samples }
  }, [rows])

  const pct = (n) => (stats.total ? Math.round((n / stats.total) * 100) : 0)

  return (
    <div className="px-4 pb-12 pt-6 sm:px-8">
      <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
      <p className="mb-5 text-[13px] text-slate-400">A snapshot of your logged HCP interactions.</p>

      {error && <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700"><Icon name="alert" size={15} /> {error}</div>}
      {rows === null && !error && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[13.5px] text-slate-400">Loading…</div>}

      {rows && (
        <>
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <StatCard icon="clipboard" num={stats.total} label="Interactions" />
            <StatCard icon="smile" iconCls="bg-emerald-50 text-emerald-700" num={stats.bySent.Positive} label="Positive" />
            <StatCard icon="doc" num={stats.materials} label="Materials shared" />
            <StatCard icon="box" num={stats.samples} label="Samples distributed" />
          </div>

          <div className="card mt-[18px]">
            <div className="flex items-center gap-2 border-b border-slate-200 px-[18px] py-3.5 text-sm font-semibold">
              <Icon name="chart" size={16} className="text-brand" /> Sentiment breakdown
            </div>
            <div className="p-[18px]">
              {['Positive', 'Neutral', 'Negative'].map((s) => (
                <div key={s} className="my-2.5 flex items-center gap-3">
                  <span className="w-[70px] text-[12.5px] font-medium">{s}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span className={`block h-full rounded-full transition-all ${BAR_CLS[s]}`} style={{ width: `${pct(stats.bySent[s])}%` }} />
                  </span>
                  <span className="w-[84px] text-right text-xs text-slate-400">{stats.bySent[s]} · {pct(stats.bySent[s])}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
