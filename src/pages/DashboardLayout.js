import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  Settings,
  LogOut,
  GraduationCap,
  Search,
  Bell,
} from 'lucide-react'
import '../styles/dashboard.css'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Entraide étudiants', path: '/dashboard/students' },
    { icon: BookOpen, label: 'Cours', path: '/dashboard/courses' },
    { icon: Calendar, label: 'Emploi du temps', path: '/dashboard/schedule' },
    { icon: Briefcase, label: 'Jobs', path: '/dashboard/jobs' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-box">
            <GraduationCap size={16} color="#fff" />
          </div>
          <span className="sidebar-logo-text">Student Life &amp; Services</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.label}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          Déconnexion
        </button>
      </aside>

      {/* MAIN */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <h1 className="topbar-title">Dashboard</h1>
          <div className="topbar-actions">
            <div className="topbar-search">
              <Search size={14} className="search-icon" />
              <input className="search-input" placeholder="Rechercher..." />
            </div>
            <button className="topbar-bell">
              <Bell size={16} />
              <span className="bell-dot" />
            </button>
            <div className="topbar-avatar">AD</div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
