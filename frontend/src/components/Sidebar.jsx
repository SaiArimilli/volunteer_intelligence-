/**
 * Sidebar.jsx - Navigation sidebar
 */
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CheckSquare, UserPlus, ShieldAlert, Leaf } from 'lucide-react'

const NAV = [
  { label: 'Overview',   icon: LayoutDashboard, path: '/' },
  { label: 'Register',   icon: UserPlus,        path: '/register' },
  { label: 'Tasks',      icon: CheckSquare,     path: '/tasks' },
  { label: 'Volunteers', icon: Users,           path: '/admin#volunteers' },
  { label: 'Admin',      icon: ShieldAlert,     path: '/admin' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={18} />
        </div>
        <div className="sidebar-logo-text">
          VIS
          <span>Volunteer Intelligence</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            className={`nav-item ${location.pathname === path.split('#')[0] ? 'active' : ''}`}
            onClick={() => navigate(path.split('#')[0])}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: 'rgba(61,255,160,0.06)',
          border: '1px solid rgba(61,255,160,0.15)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-3)',
          lineHeight: 1.5
        }}>
          <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>💡 AI Powered</div>
          Skills extracted, tasks matched &amp; retention predicted automatically.
        </div>
      </div>
    </nav>
  )
}
