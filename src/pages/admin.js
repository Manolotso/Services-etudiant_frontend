import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Users, Calendar, Briefcase, Trophy, ChevronRight, Shield } from 'lucide-react'
import '../styles/admin.css'

const ADMIN_SECTIONS = [


  {
    key: 'help',
    title: 'Gestion entraide étudiants',
    description: 'Modérer les demandes d\'aide, valider les réponses et suivre les discussions entre étudiants.',
    icon: Users,
    color: 'primary',
    path: '/admin/help',
    stats: 'Demandes & réponses',
  },
  {
    key: 'schedule',
    title: 'Gestion Emploi du temps',
    description: 'Créer, modifier et organiser les cours, salles et créneaux horaires des étudiants.',
    icon: Calendar,
    color: 'green',
    path: '/admin/schedule',
    stats: 'Cours & salles',
  },
  {
    key: 'jobs',
    title: 'Gestion jobs',
    description: 'Publier et gérer les offres d\'emploi, stages et missions freelance disponibles.',
    icon: Briefcase,
    color: 'orange',
    path: '/admin/jobs',
    stats: 'Offres & opportunités',
  },
  {
    key: 'gamification',
    title: 'Gestion gamification',
    description: 'Configurer les badges, points, classements et récompenses pour motiver les étudiants.',
    icon: Trophy,
    color: 'purple',
    path: '/admin/gamification',
    stats: 'Badges & récompenses',
  },
]



export default function Admin() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-icon">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="admin-title">Espace Administrateur</h2>
          <p className="admin-subtitle">Gérez l'ensemble des modules de la plateforme universitaire</p>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
    <LogOut size={16} />
    Déconnexion
  </button>
      </div>

      {/* Cards grid */}
      <div className="admin-grid">
        {ADMIN_SECTIONS.map(section => {
          const Icon = section.icon
          return (
            <button
              key={section.key}
              className="admin-card"
              onClick={() => navigate(section.path)}
            >
              <div className={`admin-card-icon color-${section.color}`}>
                <Icon size={22} />
              </div>

              <div className="admin-card-content">
                <h3 className="admin-card-title">{section.title}</h3>
                <p className="admin-card-description">{section.description}</p>
                <span className={`admin-card-tag color-${section.color}`}>{section.stats}</span>
              </div>

              <div className="admin-card-arrow">
                <ChevronRight size={18} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
