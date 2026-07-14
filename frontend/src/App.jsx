import { NavLink, Route, Routes } from 'react-router-dom'
import LogInteractionPage from './pages/LogInteractionPage'
import AdminPage from './pages/AdminPage'
import DocsPage from './pages/DocsPage'

export default function App() {
  return (
    <>
      <nav className="nav">
        <span className="brand">🩺 AI-First CRM</span>
        <NavLink to="/" end>Log Interaction</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/docs">Docs</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<LogInteractionPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </>
  )
}
