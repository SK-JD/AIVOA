import { NavLink, Route, Routes } from 'react-router-dom'
import LogInteractionPage from './pages/LogInteractionPage'
import AdminPage from './pages/AdminPage'
import DocsPage from './pages/DocsPage'
import Icon from './components/Icon'

export default function App() {
  return (
    <>
      <nav className="nav">
        <span className="brand">
          <span className="logo"><Icon name="activity" size={17} /></span>
          AI-First CRM
        </span>
        <NavLink to="/" end>Log Interaction</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/docs">Docs</NavLink>
        <span className="spacer" />
        <span className="badge">HCP Module</span>
      </nav>
      <Routes>
        <Route path="/" element={<LogInteractionPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </>
  )
}
