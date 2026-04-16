import React from 'react'
import {
  Users,
  BookOpen,
  TrendingUp,
  Bell,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'

const stats = [
  { label: 'Total Étudiants', value: '1,248', change: '+12%', icon: Users },
  { label: 'Cours Actifs', value: '42', change: '+3', icon: BookOpen },
  { label: 'Taux de Présence', value: '94.2%', change: '+2.1%', icon: TrendingUp },
  { label: 'Notifications', value: '8', change: 'Nouveau', icon: Bell },
]

const recentStudents = [
  { name: 'Aminata Diallo', email: 'a.diallo@univ.edu', status: 'Actif', course: 'Informatique' },
  { name: 'Moussa Traoré', email: 'm.traore@univ.edu', status: 'Actif', course: 'Mathématiques' },
  { name: 'Fatou Bamba', email: 'f.bamba@univ.edu', status: 'En attente', course: 'Physique' },
  { name: 'Ibrahim Koné', email: 'i.kone@univ.edu', status: 'Actif', course: 'Chimie' },
  { name: 'Awa Coulibaly', email: 'a.coulibaly@univ.edu', status: 'Inactif', course: 'Biologie' },
]

const upcoming = [
  { title: 'Examen Algorithmique', date: '15 Avril', time: '09:00' },
  { title: 'Réunion Département', date: '16 Avril', time: '14:00' },
  { title: 'Conférence IA', date: '18 Avril', time: '10:30' },
]

export default function DashboardHome() {
  return (
    <>
      {/* STATS */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-top">
              <div className="stat-icon-box">
                <s.icon size={16} />
              </div>
              <span className="stat-badge">{s.change}</span>
            </div>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* STUDENTS TABLE */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Étudiants Récents</h2>
            <button className="card-link">
              Voir tout <ChevronRight size={12} />
            </button>
          </div>
          <table className="students-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th className="hide-mobile">Filière</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((st) => (
                <tr key={st.email}>
                  <td>
                    <p className="student-name">{st.name}</p>
                    <p className="student-email">{st.email}</p>
                  </td>
                  <td className="hide-mobile student-course">{st.course}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        st.status === 'Actif'
                          ? 'status-active'
                          : st.status === 'En attente'
                          ? 'status-pending'
                          : 'status-inactive'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td>
                    <button className="more-btn">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EVENTS */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Événements à Venir</h2>
          </div>
          <div className="events-list">
            {upcoming.map((ev) => (
              <div className="event-item" key={ev.title}>
                <div className="event-date-box">
                  <span className="event-day">{ev.date.split(' ')[0]}</span>
                  <span className="event-month">{ev.date.split(' ')[1]}</span>
                </div>
                <div>
                  <p className="event-title">{ev.title}</p>
                  <p className="event-time">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
