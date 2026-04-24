// src/pages/admin/AdminHelpRequests.js
import api from '../../services/api'
import React, { useState, useEffect } from 'react'
import {
  HelpCircle, Plus, Edit2, Trash2, Search, X, Save,
  MessageSquare, Tag, User, CheckCircle2, Clock, Send, ArrowLeft
} from 'lucide-react'
import '../../styles/admin-help.css'
import {
  getHelpRequests,
  createHelpRequest,
  createHelpResponse,
  acceptHelpResponse,
  // resolveHelpRequest,  ← supprimé (inutilisé)
} from '../../services/api'

import { deleteHelpResponse } from '../../services/api'

// ✅ SUPPRIMÉ : handleDeleteResponse était ici HORS du composant,
//    ce qui causait l'erreur "setResponses is not defined"

const STATUS_OPTIONS = [
  { key: 'open', label: 'Ouvert', color: 'orange', icon: Clock },
  { key: 'resolved', label: 'Résolu', color: 'green', icon: CheckCircle2 }
]

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  status: 'open'
}

export default function AdminHelpRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')

  // Responses panel
  const [activeRequest, setActiveRequest] = useState(null)
  const [responses, setResponses] = useState([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [newResponse, setNewResponse] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)

  const loadRequests = () => {
    setLoading(true)
    getHelpRequests()
      .then(r => setRequests(r.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRequests() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  const openEdit = (req) => {
    setEditingId(req.id)
    setForm({
      title: req.title || '',
      description: req.description || '',
      category: req.category || '',
      status: req.status || 'open'
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
    if (!form.title || !form.description) return

    setSubmitting(true)
    setError('')

    try {
      if (editingId) {
        await createHelpRequest(form) // fallback simple
      } else {
        await createHelpRequest(form)
      }

      closeModal()
      loadRequests()

    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Erreur lors de l'enregistrement."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setRequests(prev => prev.filter(r => r.id !== id))
      setConfirmDelete(null)
      if (activeRequest?.id === id) closeResponses()
      loadRequests()
    } catch (err) {
      console.error(err)
    }
  }

  const openResponses = (req) => {
    setActiveRequest(req)
    setResponsesLoading(true)
    setResponses([])
    setNewResponse('')

    api.get(`help/${req.id}/`)
      .then(res => {
        setResponses(res.data.responses || [])
      })
      .catch(() => setResponses([]))
      .finally(() => setResponsesLoading(false))
  }

  const closeResponses = () => {
    setActiveRequest(null)
    setResponses([])
    setNewResponse('')
  }

  const handleSendResponse = async (e) => {
    e.preventDefault()
    if (!newResponse.trim() || !activeRequest) return
    setSendingResponse(true)
    try {
      const r = await createHelpResponse(activeRequest.id, { content: newResponse })
      setResponses(prev => [...prev, r.data])
      setNewResponse('')
    } catch (err) {
      console.error(err)
    } finally {
      setSendingResponse(false)
    }
  }

  const handleAcceptResponse = async (responseId) => {
    try {
      await acceptHelpResponse(responseId)
      setResponses(prev => prev.map(r => ({
        ...r,
        is_accepted: r.id === responseId
      })))
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ CORRIGÉ : handleDeleteResponse est maintenant DANS le composant
  //    et appelle bien l'API deleteHelpResponse
  const handleDeleteResponse = async (responseId) => {
    try {
      await deleteHelpResponse(responseId)
      setResponses(prev => prev.filter(r => r.id !== responseId))
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusMeta = (key) => STATUS_OPTIONS.find(s => s.key === key) || STATUS_OPTIONS[0]

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    const matchSearch =
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.user?.username?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    } catch {
      return '—'
    }
  }

  const userLabel = (u) => {
    if (!u) return '—'
    if (typeof u === 'string' || typeof u === 'number') return `#${u}`
    return u.username || u.email || u.full_name || `#${u.id}`
  }

  const handleGoBack = () => {
    window.history.back()
  }

  if (loading) return (
    <div className="adhelp-loading"><div className="spinner" /><span>Chargement...</span></div>
  )

  return (
    <div className="adhelp-page">
      {/* Header */}
      <div className="adhelp-header">
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
            <h2 className="adhelp-title">Demandes d'aide</h2>
            <p className="adhelp-subtitle">
              {requests.length} demande{requests.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <button className="adhelp-btn-primary" onClick={openCreate}>
          <Plus size={14} /> Nouvelle demande
        </button>
      </div>

      {/* Toolbar */}
      <div className="adhelp-toolbar">
        <div className="adhelp-search">
          <Search size={14} />
          <input
            placeholder="Rechercher par titre, description, utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="adhelp-filters">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >Tout</button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.key}
              className={`filter-btn ${filterStatus === s.key ? 'active' : ''}`}
              onClick={() => setFilterStatus(s.key)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="adhelp-empty">
          <HelpCircle size={48} />
          <h3>Aucune demande</h3>
          <p>Aucune demande ne correspond à votre recherche.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="adhelp-table-wrap">
          <table className="adhelp-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Utilisateur</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Réponses</th>
                <th>Date</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => {
                const status = getStatusMeta(req.status)
                const StatusIcon = status.icon
                const respCount = req.responses_count ?? req.responses?.length ?? 0
                return (
                  <tr key={req.id}>
                    <td>
                      <div className="cell-title">
                        <button
                          className="title-link"
                          onClick={() => openResponses(req)}
                          title="Voir les réponses"
                        >
                          {req.title}
                        </button>
                        {req.description && (
                          <span className="desc-preview">
                            {req.description.length > 80
                              ? req.description.slice(0, 80) + '…'
                              : req.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="cell-muted">
                        <User size={12} />
                        {userLabel(req.user)}
                      </div>
                    </td>
                    <td>
                      <div className="cell-muted">
                        <Tag size={12} />{req.category || '—'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge color-${status.color}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="responses-pill"
                        onClick={() => openResponses(req)}
                      >
                        <MessageSquare size={12} />
                        {respCount}
                      </button>
                    </td>
                    <td>
                      <div className="cell-muted">{formatDate(req.created_at)}</div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(req)} title="Modifier">
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setConfirmDelete(req.id)}
                          title="Supprimer"
                        >
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
        <div className="adhelp-modal-overlay" onClick={closeModal}>
          <div className="adhelp-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Modifier la demande" : 'Nouvelle demande'}</h3>
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
                  placeholder="Comment intégrer une API REST ?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez votre problème..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    placeholder="Tech, Carrière..."
                  />
                </div>
                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    required
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="adhelp-btn-ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="adhelp-btn-primary" disabled={submitting}>
                  <Save size={13} /> {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="adhelp-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adhelp-modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Supprimer cette demande ?</h3>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Cette action supprimera également toutes les réponses associées. Elle est irréversible.
              </p>
              <div className="modal-footer">
                <button className="adhelp-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
                <button className="adhelp-btn-danger" onClick={() => handleDelete(confirmDelete)}>
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responses panel */}
      {activeRequest && (
        <div className="adhelp-modal-overlay" onClick={closeResponses}>
          <div className="adhelp-modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{activeRequest.title}</h3>
                <p className="panel-sub">
                  {(() => {
                    const s = getStatusMeta(activeRequest.status)
                    return (
                      <span className={`status-badge color-${s.color}`}>
                        <s.icon size={11} />
                        {s.label}
                      </span>
                    )
                  })()}
                  <span className="panel-sub-meta">
                    par {userLabel(activeRequest.user)} · {formatDate(activeRequest.created_at)}
                  </span>
                </p>
              </div>
              <button className="icon-btn" onClick={closeResponses}><X size={14} /></button>
            </div>

            <div className="modal-body">
              <div className="request-description">
                {activeRequest.description}
              </div>

              <div className="responses-section">
                <div className="responses-head">
                  <MessageSquare size={14} />
                  <span>Réponses ({responses.length})</span>
                </div>

                {responsesLoading && (
                  <div className="adhelp-loading inline">
                    <div className="spinner" /><span>Chargement...</span>
                  </div>
                )}

                {!responsesLoading && responses.length === 0 && (
                  <div className="responses-empty">Aucune réponse pour le moment.</div>
                )}

                <div className="responses-list">
                  {responses.map(resp => (
                    <div
                      key={resp.id}
                      className={`response-card ${resp.is_accepted ? 'accepted' : ''}`}
                    >
                      <div className="response-head">
                        <div className="response-author">
                          <User size={12} />
                          <strong>{userLabel(resp.user)}</strong>
                          <span className="response-date">{formatDate(resp.created_at)}</span>
                          {resp.is_accepted && (
                            <span className="accepted-badge">
                              <CheckCircle2 size={11} /> Acceptée
                            </span>
                          )}
                        </div>
                        <div className="response-actions">
                          {!resp.is_accepted && (
                            <button
                              className="icon-btn"
                              onClick={() => handleAcceptResponse(resp.id)}
                              title="Accepter cette réponse"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDeleteResponse(resp.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="response-content">{resp.content}</div>
                    </div>
                  ))}
                </div>

                <form className="response-form" onSubmit={handleSendResponse}>
                  <textarea
                    rows={3}
                    placeholder="Écrire une réponse en tant qu'admin..."
                    value={newResponse}
                    onChange={e => setNewResponse(e.target.value)}
                  />
                  <div className="modal-footer">
                    <button
                      type="submit"
                      className="adhelp-btn-primary"
                      disabled={sendingResponse || !newResponse.trim()}
                    >
                      <Send size={13} /> {sendingResponse ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
