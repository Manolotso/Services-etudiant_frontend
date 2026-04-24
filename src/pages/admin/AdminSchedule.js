// src/pages/admin/AdminSchedule.js
import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Edit2, Trash2, Clock, MapPin, User, BookOpen, X, Save, Search, ArrowLeft } from 'lucide-react'
import '../../styles/admin-schedule.css'
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getCourses,
  getRooms,
  getUsers,
  createCourse,
  createRoom
} from '../../services/api'

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' }
]

const EMPTY_FORM = {
  user: '',
  course: '',
  room: '',
  day: 'monday',
  start_time: '08:00',
  end_time: '10:00'
}

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([])
  const [courses, setCourses] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDay, setFilterDay] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [users, setUsers] = useState([])
  const [newCourse, setNewCourse] = useState({
  name: '',
  teacher: ''
})

const [newRoom, setNewRoom] = useState({
  name: ''
})

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      getSchedules().then(r => r.data).catch(() => []),
      getCourses().then(r => r.data).catch(() => []),
      getRooms().then(r => r.data).catch(() => []),
      getUsers().then(r => r.data).catch(() => [])
    ]).then(([s, c, r, u]) => {
      setSchedules(s)
      setCourses(c)
      setRooms(r)
      setUsers(u)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const handleGoBack = () => {
    window.history.back()
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      user: item.user?.id || '',
      course: item.course?.id || item.course || '',
      room: item.room?.id || item.room || '',
      day: item.day,
      start_time: item.start_time?.slice(0, 5) || '08:00',
      end_time: item.end_time?.slice(0, 5) || '10:00'
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (!form.course || !form.day || !form.start_time || !form.end_time) return

  setSubmitting(true)

  try {
    const payload = {
        user: form.user ? Number(form.user) : undefined,
      course: Number(form.course),
      room: form.room ? Number(form.room) : null,
      day: form.day,
      start_time: form.start_time,
      end_time: form.end_time,
    }

    console.log("PAYLOAD SENT:", payload) // DEBUG IMPORTANT

    if (editingId) {
      await updateSchedule(editingId, payload)
    } else {
      await createSchedule(payload)
    }

    closeModal()
    loadAll()

  } catch (err) {
    console.error("CREATE SCHEDULE ERROR:", err.response?.data || err)
  } finally {
    setSubmitting(false)
  }
}

    const handleCreateCourse = async () => {
  if (!newCourse.name || !newCourse.teacher) return

  try {
    const res = await createCourse(newCourse)

    setCourses(prev => [...prev, res.data])

    setForm({
      ...form,
      course: res.data.id
    })

    setNewCourse({
      name: '',
      teacher: ''
    })
  } catch (err) {
    console.error(err)
  }
}

const handleCreateRoom = async () => {
  if (!newRoom.name) return

  try {
    const res = await createRoom(newRoom)

    setRooms(prev => [...prev, res.data])

    setForm({
      ...form,
      room: res.data.id
    })

    setNewRoom({
      name: ''
    })
  } catch (err) {
    console.error(err)
  }
}

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id)
      setConfirmDelete(null)
      loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  const getCourseName = (item) => {
    if (item.course?.name) return item.course.name
    const c = courses.find(x => x.id === item.course)
    return c?.name || '—'
  }

  const getCourseTeacher = (item) => {
    if (item.course?.teacher) return item.course.teacher
    const c = courses.find(x => x.id === item.course)
    return c?.teacher || '—'
  }

  const getRoomName = (item) => {
    if (item.room?.name) return item.room.name
    const r = rooms.find(x => x.id === item.room)
    return r?.name || '—'
  }

  const filtered = schedules.filter(s => {
    const courseName = getCourseName(s).toLowerCase()
    const teacher = getCourseTeacher(s).toLowerCase()
    const matchSearch = courseName.includes(search.toLowerCase()) || teacher.includes(search.toLowerCase())
    const matchDay = filterDay === 'all' || s.day === filterDay
    return matchSearch && matchDay
  })

  if (loading) return (
    <div className="adsch-loading"><div className="spinner" /><span>Chargement...</span></div>
  )

  return (
    <div className="adsch-page">
      {/* Header */}
      <div className="adsch-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="icon-btn" 
            onClick={handleGoBack}
            title="Retour"
            style={{ padding: '8px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="adsch-title">Gestion de l'emploi du temps</h2>
            <p className="adsch-subtitle">{schedules.length} créneau{schedules.length > 1 ? 'x' : ''} planifié{schedules.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button className="adsch-btn-primary" onClick={openCreate}>
          <Plus size={14} /> Nouveau créneau
        </button>
      </div>

      {/* Toolbar */}
      <div className="adsch-toolbar">
        <div className="adsch-search">
          <Search size={14} />
          <input
            placeholder="Rechercher un cours ou un enseignant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="adsch-filters">
          <button
            className={`filter-btn ${filterDay === 'all' ? 'active' : ''}`}
            onClick={() => setFilterDay('all')}
          >Tout</button>
          {DAYS.map(d => (
            <button
              key={d.key}
              className={`filter-btn ${filterDay === d.key ? 'active' : ''}`}
              onClick={() => setFilterDay(d.key)}
            >{d.label}</button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="adsch-empty">
          <Calendar size={48} />
          <h3>Aucun créneau</h3>
          <p>Aucun cours ne correspond à votre recherche.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="adsch-table-wrap">
          <table className="adsch-table">
            <thead>
              <tr>
                <th>Cours</th>
                <th>Enseignant</th>
                <th>Jour</th>
                <th>Horaire</th>
                <th>Salle</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="cell-course">
                      <BookOpen size={13} />
                      {getCourseName(item)}
                    </div>
                  </td>
                  <td><div className="cell-muted"><User size={12} />{getCourseTeacher(item)}</div></td>
                  <td><span className="day-badge">{DAYS.find(d => d.key === item.day)?.label || item.day}</span></td>
                  <td><div className="cell-muted"><Clock size={12} />{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</div></td>
                  <td><div className="cell-muted"><MapPin size={12} />{getRoomName(item)}</div></td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(item)} title="Modifier">
                        <Edit2 size={13} />
                      </button>
                      <button className="icon-btn danger" onClick={() => setConfirmDelete(item.id)} title="Supprimer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="adsch-modal-overlay" onClick={closeModal}>
          <div className="adsch-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier le créneau' : 'Nouveau créneau'}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={14} /></button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
                <div className="form-group">
    <label>Utilisateur assigné</label>
    <select
      value={form.user}
      onChange={e => setForm({ ...form, user: e.target.value })}
    >
      <option value="">Moi (par défaut)</option>
      {users.map(u => (
        <option key={u.id} value={u.id}>
          {u.custom_username || u.email}
        </option>
      ))}
    </select>
  </div>
              <div className="form-group">
                <label>Cours</label>
                <select
                  value={form.course}
                  onChange={e => setForm({ ...form, course: e.target.value })}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.teacher})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
  <label>Nouveau cours</label>

  <input
    type="text"
    placeholder="Nom du cours"
    value={newCourse.name}
    onChange={e =>
      setNewCourse({
        ...newCourse,
        name: e.target.value
      })
    }
  />

  <input
    type="text"
    placeholder="Nom enseignant"
    value={newCourse.teacher}
    onChange={e =>
      setNewCourse({
        ...newCourse,
        teacher: e.target.value
      })
    }
  />

  <button
    type="button"
    className="adsch-btn-ghost"
    onClick={handleCreateCourse}
  >
    + Ajouter cours
  </button>
</div>

              <div className="form-group">
                <label>Salle</label>
                <select
                  value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value })}
                >
                  <option value="">— Aucune —</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
  <label>Nouvelle salle</label>

  <input
    type="text"
    placeholder="Nom de la salle"
    value={newRoom.name}
    onChange={e =>
      setNewRoom({
        name: e.target.value
      })
    }
  />

  <button
    type="button"
    className="adsch-btn-ghost"
    onClick={handleCreateRoom}
  >
    + Ajouter salle
  </button>
</div>

              <div className="form-group">
                <label>Jour</label>
                <select
                  value={form.day}
                  onChange={e => setForm({ ...form, day: e.target.value })}
                  required
                >
                  {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Début</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fin</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="adsch-btn-ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="adsch-btn-primary" disabled={submitting}>
                  <Save size={13} /> {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="adsch-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adsch-modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Supprimer ce créneau ?</h3>
            </div>
            <div className="modal-body">
              <p className="confirm-text">Cette action est irréversible.</p>
              <div className="modal-footer">
                <button className="adsch-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
                <button className="adsch-btn-danger" onClick={() => handleDelete(confirmDelete)}>
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}