import { NavLink, Route, Routes } from 'react-router-dom'
import LogInteractionPage from './pages/LogInteractionPage'
import PipelinePage from './pages/PipelinePage'
import HcpDirectoryPage from './pages/HcpDirectoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DocsPage from './pages/DocsPage'
import Icon from './components/Icon'

const NAV = [
  ['/', 'Log Interaction', true],
  ['/pipeline', 'Pipeline'],
  ['/directory', 'HCP Directory'],
  ['/analytics', 'Analytics'],
  ['/docs', 'Docs'],
]

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-[13.5px] transition ${
    isActive
      ? 'bg-brand-soft font-semibold text-brand-600'
      : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-700'
  }`

export default function App() {
  return (
    <>
      <nav className="sticky top-0 z-50 flex h-[60px] items-center gap-1.5 border-b border-slate-200 bg-white/85 px-7 backdrop-blur-md">
        <span className="mr-6 flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-gradient-to-br from-brand to-violet-400 text-white shadow-sm">
            <Icon name="activity" size={16} />
          </span>
          AI-First CRM
        </span>
        <div className="flex gap-1 overflow-x-auto">
          {NAV.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
          ))}
        </div>
        <span className="flex-1" />
        <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-[5px] text-xs font-medium text-slate-700 sm:inline-flex">
          <span className="h-[7px] w-[7px] rounded-full bg-emerald-500" /> HCP Module · v2.4
        </span>
        <span className="ml-3 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand to-violet-400 text-xs font-bold text-white">SK</span>
      </nav>
      <Routes>
        <Route path="/" element={<LogInteractionPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/directory" element={<HcpDirectoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </>
  )
}
