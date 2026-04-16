import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, List, Grid3X3, Clock, MapPin, User } from 'lucide-react'
import '../../styles/schedule.css'
import { getSchedule } from '../../services/api'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi' }
const DAY_SHORT = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer', thursday: 'Jeu', friday: 'Ven', saturday: 'Sam' }
const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const COLORS = ['primary','green','orange','purple','teal','rose']

function timeToMin(t) { const [h,m] = t.split(':').map(Number); return h * 60 + m }
function slotTop(t) { return ((timeToMin(t) - 480) / 60) * 70 }
function slotHeight(s, e) { return ((timeToMin(e) - timeToMin(s)) / 60) * 70 - 4 }

export default function Schedule() {
  const [view, setView] = useState('week')
  const [activeDay, setActiveDay] = useState('monday')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSchedule()
      .then(res => {
        const mapped = (res.data || []).map((ev, i) => ({
          id: ev.id,
          course: ev.course_name || ev.course?.name || ev.course,
          teacher: ev.teacher_name || ev.course?.teacher || '',
          room: ev.room_name || ev.room?.name || '',
          day: ev.day,
          start: ev.start_time?.slice(0, 5),
          end: ev.end_time?.slice(0, 5),
          color: COLORS[i % COLORS.length],
        }))
        setEvents(mapped)
      })
      .catch(() => {
        setEvents([])
      })
      .finally(() => setLoading(false))
  }, [])

  const dayEvents = (d) => events.filter(e => e.day === d)
  const todayIdx = DAYS.indexOf(activeDay)
  const prevDay = () => setActiveDay(DAYS[(todayIdx - 1 + DAYS.length) % DAYS.length])
  const nextDay = () => setActiveDay(DAYS[(todayIdx + 1) % DAYS.length])

  if (loading) return <div className="schedule-loading"><div className="spinner" /><span>Chargement...</span></div>

  /* Message global si aucun cours */
  if (events.length === 0) {
    return (
      <div className="schedule-page">
        <div className="schedule-header">
          <div>
            <h2 className="schedule-title">Emploi du Temps</h2>
            <p className="schedule-subtitle">0 séance cette semaine</p>
          </div>
        </div>
        <div className="schedule-empty">
          <Calendar size={48} />
          <h3>Il n'y a pas de cours pour cette semaine</h3>
          <p>Aucune séance n'a été programmée. Revenez plus tard ou contactez l'administration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="schedule-page">
      {/* Header */}
      <div className="schedule-header">
        <div>
          <h2 className="schedule-title">Emploi du Temps</h2>
          <p className="schedule-subtitle">{events.length} séance{events.length > 1 ? 's' : ''} cette semaine</p>
        </div>
        <div className="view-tabs">
          {[{v:'week',icon:Grid3X3,l:'Semaine'},{v:'day',icon:Calendar,l:'Jour'},{v:'list',icon:List,l:'Liste'}].map(t=>(
            <button key={t.v} className={`view-tab ${view===t.v?'active':''}`} onClick={()=>setView(t.v)}>
              <t.icon size={14}/>{t.l}
            </button>
          ))}
        </div>
      </div>

      {/* === WEEK VIEW === */}
      {view === 'week' && (
        <div className="week-wrapper">
          <div className="week-grid">
            <div className="time-col">
              <div className="time-col-header" />
              {HOURS.map(h=><div key={h} className="time-label">{h}</div>)}
            </div>
            {DAYS.map(d=>(
              <div key={d} className="day-col">
                <div className="day-col-header">
                  <span className="day-short">{DAY_SHORT[d]}</span>
                </div>
                <div className="day-slots">
                  {HOURS.map(h=><div key={h} className="hour-slot" />)}
                  {dayEvents(d).map(ev=>(
                    <div key={ev.id} className={`event-block color-${ev.color}`} style={{top:slotTop(ev.start),height:slotHeight(ev.start,ev.end)}}>
                      <span className="ev-course">{ev.course}</span>
                      <span className="ev-meta">{ev.start} - {ev.end}</span>
                      <span className="ev-meta">{ev.room}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === DAY VIEW === */}
      {view === 'day' && (
        <div className="day-view">
          <div className="day-nav">
            <button className="nav-btn" onClick={prevDay}><ChevronLeft size={16}/></button>
            <h3 className="day-nav-title">{DAY_LABELS[activeDay]}</h3>
            <button className="nav-btn" onClick={nextDay}><ChevronRight size={16}/></button>
          </div>
          <div className="day-cards">
            {dayEvents(activeDay).length === 0 && <p className="no-events">Aucune séance ce jour</p>}
            {dayEvents(activeDay).map(ev=>(
              <div key={ev.id} className={`day-card color-${ev.color}`}>
                <div className={`day-card-bar color-${ev.color}`} />
                <div className="day-card-body">
                  <h4 className="day-card-title">{ev.course}</h4>
                  <div className="day-card-infos">
                    <span><Clock size={12}/>{ev.start} - {ev.end}</span>
                    <span><MapPin size={12}/>{ev.room}</span>
                    <span><User size={12}/>{ev.teacher}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === LIST VIEW === */}
      {view === 'list' && (
        <div className="list-view">
          {DAYS.map(d=>{
            const evs = dayEvents(d)
            if(!evs.length) return null
            return (
              <div key={d} className="list-day-group">
                <h3 className="list-day-title">{DAY_LABELS[d]}</h3>
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Cours</th>
                      <th>Enseignant</th>
                      <th>Horaire</th>
                      <th>Salle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evs.map(ev=>(
                      <tr key={ev.id}>
                        <td className="list-course"><span className={`list-dot color-${ev.color}`}/>{ev.course}</td>
                        <td className="list-teacher">{ev.teacher}</td>
                        <td className="list-time">{ev.start} - {ev.end}</td>
                        <td className="list-room">{ev.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
