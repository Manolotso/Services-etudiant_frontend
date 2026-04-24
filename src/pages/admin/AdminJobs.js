// src/pages/admin/AdminJobs.js
import React, { useState, useEffect } from 'react'
import {
  Briefcase, Plus, Edit2, Trash2, Search, X, Save,
  ExternalLink, MapPin, Building2, Tag, FileText, ArrowLeft
} from 'lucide-react'
import '../../styles/admin-jobs.css'
import {
  getAdminJobs,
  createJob,
  updateJob,
  deleteJob
} from '../../services/api'

const TYPE_OPTIONS = [
  { key: 'internship', label: 'Stage', color: 'green' },
  { key: 'job', label: 'Emploi', color: 'primary' },
  { key: 'freelance', label: 'Freelance', color: 'orange' }
]

const EMPTY_FORM = {
  title: '',
  company: '',
  company_link: '',
  description: '',
  link: '',
  location: '',
  contract: '',
  category: '',
  job_type: 'job'
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')

  const loadJobs = () => {
    setLoading(true)
    getAdminJobs()
      .then(r => setJobs(r.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadJobs() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  const openEdit = (job) => {
    setEditingId(job.id)
    setForm({
      title: job.title || '',
      company: job.company || '',
      company_link: job.company_link || '',
      description: job.description || '',
      link: job.link || '',
      location: job.location || '',
      contract: job.contract || '',
      category: job.category || '',
      job_type: job.job_type || 'job'
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.link || !form.job_type) return
    setSubmitting(true)
    setError('')
    try {
      if (editingId) {
        await updateJob(editingId, form)
      } else {
        await createJob(form)
      }
      closeModal()
      loadJobs()
    } catch (err) {
      const msg = err?.response?.data?.link?.[0]
        || err?.response?.data?.detail
        || "Erreur lors de l'enregistrement."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteJob(id)
      setConfirmDelete(null)
      loadJobs()
    } catch (err) {
      console.error(err)
    }
  }

  const getTypeMeta = (key) => TYPE_OPTIONS.find(t => t.key === key) || TYPE_OPTIONS[1]

  const handleGoBack = () => {
    window.history.back()
  }

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchSearch =
      j.title?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q) ||
      j.category?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q)
    const matchType = filterType === 'all' || j.job_type === filterType
    return matchSearch && matchType
  })

  if (loading) return (
    <div className="adjob-loading"><div className="spinner" /><span>Chargement...</span></div>
  )

  return (
    <div className="adjob-page">
      {/* Header */}
      <div className="adjob-header">
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
            <h2 className="adjob-title">Gestion des jobs</h2>
            <p className="adjob-subtitle">{jobs.length} offre{jobs.length > 1 ? 's' : ''} publiée{jobs.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button className="adjob-btn-primary" onClick={openCreate}>
          <Plus size={14} /> Nouvelle offre
        </button>
      </div>

      {/* Toolbar */}
      <div className="adjob-toolbar">
        <div className="adjob-search">
          <Search size={14} />
          <input
            placeholder="Rechercher par titre, entreprise, catégorie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="adjob-filters">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >Tout</button>
          {TYPE_OPTIONS.map(t => (
            <button
              key={t.key}
              className={`filter-btn ${filterType === t.key ? 'active' : ''}`}
              onClick={() => setFilterType(t.key)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="adjob-empty">
          <Briefcase size={48} />
          <h3>Aucune offre</h3>
          <p>Aucune offre ne correspond à votre recherche.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="adjob-table-wrap">
          <table className="adjob-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Entreprise</th>
                <th>Type</th>
                <th>Lieu</th>
                <th>Catégorie</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => {
                const type = getTypeMeta(job.job_type)
                return (
                  <tr key={job.id}>
                    <td>
                      <div className="cell-title">
                        <a href={job.link} target="_blank" rel="noreferrer" className="title-link">
                          {job.title}
                          <ExternalLink size={11} />
                        </a>
                        {job.contract && <span className="contract-tag">{job.contract}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="cell-muted">
                        <Building2 size={12} />
                        {job.company_link
                          ? <a href={job.company_link} target="_blank" rel="noreferrer" className="company-link">{job.company || '—'}</a>
                          : (job.company || '—')}
                      </div>
                    </td>
                    <td><span className={`type-badge color-${type.color}`}>{type.label}</span></td>
                    <td><div className="cell-muted"><MapPin size={12} />{job.location || '—'}</div></td>
                    <td><div className="cell-muted"><Tag size={12} />{job.category || '—'}</div></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(job)} title="Modifier">
                          <Edit2 size={13} />
                        </button>
                        <button className="icon-btn danger" onClick={() => setConfirmDelete(job.id)} title="Supprimer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="adjob-modal-overlay" onClick={closeModal}>
          <div className="adjob-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Modifier l'offre" : 'Nouvelle offre'}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={14} /></button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Développeur Full-Stack"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Entreprise</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div className="form-group">
                  <label>Site entreprise</label>
                  <input
                    type="url"
                    value={form.company_link}
                    onChange={e => setForm({ ...form, company_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lien de l'offre *</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={form.job_type}
                    onChange={e => setForm({ ...form, job_type: e.target.value })}
                    required
                  >
                    {TYPE_OPTIONS.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Contrat</label>
                  <input
                    type="text"
                    value={form.contract}
                    onChange={e => setForm({ ...form, contract: e.target.value })}
                    placeholder="CDI, CDD, Stage..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lieu</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Paris, Remote..."
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    placeholder="Tech, Marketing..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description du poste..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="adjob-btn-ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="adjob-btn-primary" disabled={submitting}>
                  <Save size={13} /> {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="adjob-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adjob-modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Supprimer cette offre ?</h3>
            </div>
            <div className="modal-body">
              <p className="confirm-text">Cette action est irréversible.</p>
              <div className="modal-footer">
                <button className="adjob-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
                <button className="adjob-btn-danger" onClick={() => handleDelete(confirmDelete)}>
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