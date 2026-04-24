import React, { useState, useEffect } from 'react'
import {
  HelpCircle, Plus, Search, MessageCircle, CheckCircle2, Clock,
  User, Tag, Send, X, ChevronLeft, Filter, AlertCircle
} from 'lucide-react'
import '../../styles/help.css'
import {
  getHelpRequests, createHelpRequest,
  createHelpResponse, acceptHelpResponse, resolveHelpRequest
} from '../../services/api'

import api from '../../services/api'

const STATUS_LABELS = { open: 'Ouvert', resolved: 'Résolu' }

export default function Help() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // Modal create
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '' })
  const [submitting, setSubmitting] = useState(false)

  // Detail view (discussion)
  const [selected, setSelected] = useState(null)
  const [responses, setResponses] = useState([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [newResponse, setNewResponse] = useState('')
  const [sending, setSending] = useState(false)

  // ✅ Lecture sécurisée de l'ID utilisateur depuis le token JWT
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("access")
      if (!token) return null
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.user_id
    } catch {
      return null
    }
  }
  const currentUserId = getCurrentUserId()

  useEffect(() => { loadRequests() }, [])

  const loadRequests = () => {
    setLoading(true)
    getHelpRequests()
      .then(res => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  const openDiscussion = (req) => {
    setSelected(req)
    setLoadingResponses(true)

    api.get(`help/${req.id}/`)
      .then(res => {
        setSelected(res.data)
        setResponses(res.data.responses || [])
      })
      .catch(() => setResponses([]))
      .finally(() => setLoadingResponses(false))
  }

  const closeDiscussion = () => {
    setSelected(null)
    setResponses([])
    setNewResponse('')
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    createHelpRequest(form)
      .then(res => {
        setRequests(prev => [res.data, ...prev])
        setForm({ title: '', description: '', category: '' })
        setShowCreate(false)
      })
      .catch(() => alert("Erreur lors de la création de la demande"))
      .finally(() => setSubmitting(false))
  }

  const handleSendResponse = (e) => {
    e.preventDefault()
    if (!newResponse.trim() || !selected) return
    setSending(true)
    createHelpResponse(selected.id, { content: newResponse })
      .then(res => {
        setResponses(prev => [...prev, res.data])
        setNewResponse('')
      })
      .catch(() => alert("Erreur lors de l'envoi de la réponse"))
      .finally(() => setSending(false))
  }

  const handleAcceptResponse = (responseId) => {
    acceptHelpResponse(responseId)
      .then(() => {
        setResponses(prev => prev.map(r => ({ ...r, is_accepted: r.id === responseId })))
      })
      .catch(() => alert("Erreur lors de l'acceptation"))
  }

  const handleResolve = () => {
    if (!selected) return
    resolveHelpRequest(selected.id)
      .then(() => {
        const updated = { ...selected, status: 'resolved' }
        setSelected(updated)
        setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
      })
      .catch(() => alert("Erreur lors du marquage comme résolu"))
  }

  const categories = [...new Set(requests.map(r => r.category).filter(Boolean))]

  const filtered = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchCategory = filterCategory === 'all' || r.category === filterCategory
    return matchSearch && matchStatus && matchCategory
  })

  if (loading) return (
    <div className="help-loading"><div className="spinner" /><span>Chargement...</span></div>
  )

  // === DETAIL / DISCUSSION VIEW ===
  if (selected) {
    return (
      <div className="help-page">
        <button className="help-back" onClick={closeDiscussion}>
          <ChevronLeft size={16} /> Retour aux demandes
        </button>

        <div className="help-detail-card">
          <div className="help-detail-header">
            <div className="help-detail-meta">
              <span className={`help-status-badge status-${selected.status}`}>
                {selected.status === 'resolved'
                  ? <CheckCircle2 size={12} />
                  : <AlertCircle size={12} />}
                {STATUS_LABELS[selected.status]}
              </span>
              {selected.category && (
                <span className="help-category-badge">
                  <Tag size={11} />{selected.category}
                </span>
              )}
            </div>

            {/* ✅ Bouton visible uniquement pour le créateur de la demande */}
            {selected.status === 'open' &&
             selected.user_id !== undefined &&
             currentUserId !== undefined &&
             String(selected.user_id) === String(currentUserId) && (
              <button className="help-resolve-btn" onClick={handleResolve}>
                <CheckCircle2 size={14} /> Marquer comme résolu
              </button>
            )}
          </div>

          <h2 className="help-detail-title">{selected.title}</h2>
          <div className="help-detail-author">
            <User size={13} />
            {/* ✅ Affichage du nom via user_name */}
            <span>{selected.user_name || 'Utilisateur'}</span>
            <span className="help-dot">•</span>
            <Clock size={13} />
            <span>{new Date(selected.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}</span>
          </div>
          <p className="help-detail-description">{selected.description}</p>
        </div>

        {/* Discussion */}
        <div className="help-discussion">
          <h3 className="help-discussion-title">
            <MessageCircle size={16} />
            Discussion ({responses.length})
          </h3>

          {loadingResponses ? (
            <div className="help-loading-inline"><div className="spinner-sm" />Chargement des réponses...</div>
          ) : responses.length === 0 ? (
            <div className="help-no-responses">
              <MessageCircle size={32} />
              <p>Aucune réponse pour le moment. Soyez le premier à aider !</p>
            </div>
          ) : (
            <div className="help-responses-list">
              {responses
                .sort((a, b) => (b.is_accepted ? 1 : 0) - (a.is_accepted ? 1 : 0))
                .map(resp => (
                  <div key={resp.id} className={`help-response ${resp.is_accepted ? 'accepted' : ''}`}>
                    {resp.is_accepted && (
                      <div className="help-accepted-badge">
                        <CheckCircle2 size={12} /> Réponse acceptée
                      </div>
                    )}
                    <div className="help-response-header">
                      <div className="help-response-author">
                        {/* ✅ Avatar : première lettre du user_name */}
                        <div className="help-avatar">
                          {(resp.user_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          {/* ✅ Nom affiché via user_name */}
                          <div className="help-response-name">
                            {resp.user_name || 'Utilisateur'}
                          </div>
                          <div className="help-response-date">
                            {new Date(resp.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      {selected.status === 'open' && !resp.is_accepted && (
                        <button
                          className="help-accept-btn"
                          onClick={() => handleAcceptResponse(resp.id)}
                          title="Choisir cette réponse comme solution"
                        >
                          <CheckCircle2 size={13} /> Accepter
                        </button>
                      )}
                    </div>
                    <p className="help-response-content">{resp.content}</p>
                  </div>
                ))}
            </div>
          )}

          {/* Reply form */}
          {selected.status === 'open' ? (
            <form className="help-reply-form" onSubmit={handleSendResponse}>
              <textarea
                placeholder="Écrivez votre réponse..."
                value={newResponse}
                onChange={e => setNewResponse(e.target.value)}
                rows={3}
                maxLength={2000}
              />
              <button type="submit" className="help-send-btn" disabled={sending || !newResponse.trim()}>
                <Send size={14} />
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          ) : (
            <div className="help-closed-notice">
              <CheckCircle2 size={14} /> Cette demande est résolue. Les nouvelles réponses sont fermées.
            </div>
          )}
        </div>
      </div>
    )
  }

  // === LIST VIEW ===
  return (
    <div className="help-page">
      {/* Header */}
      <div className="help-header">
        <div>
          <h2 className="help-title">Entraide</h2>
          <p className="help-subtitle">
            {requests.length} demande{requests.length > 1 ? 's' : ''} d'aide
          </p>
        </div>
        <button className="help-new-btn" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Nouvelle demande
        </button>
      </div>

      {/* Toolbar */}
      <div className="help-toolbar">
        <div className="help-search">
          <Search size={14} />
          <input
            placeholder="Rechercher une demande..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="help-filters">
          <Filter size={14} />
          {['all', 'open', 'resolved'].map(s => (
            <button
              key={s}
              className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
            </button>
          ))}
          {categories.length > 0 && (
            <select
              className="help-select"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="help-empty">
          <HelpCircle size={48} />
          <h3>Aucune demande d'aide</h3>
          <p>Soyez le premier à poser une question à la communauté.</p>
        </div>
      )}

      {/* List */}
      <div className="help-list">
        {filtered.map(req => (
          <div key={req.id} className="help-card" onClick={() => openDiscussion(req)}>
            <div className="help-card-top">
              <span className={`help-status-badge status-${req.status}`}>
                {req.status === 'resolved'
                  ? <CheckCircle2 size={11} />
                  : <AlertCircle size={11} />}
                {STATUS_LABELS[req.status]}
              </span>
              {req.category && (
                <span className="help-category-badge">
                  <Tag size={10} />{req.category}
                </span>
              )}
              <span className="help-card-date">
                <Clock size={11} />
                {new Date(req.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'short'
                })}
              </span>
            </div>

            <h3 className="help-card-title">{req.title}</h3>
            <p className="help-card-desc">{req.description}</p>

            <div className="help-card-footer">
              {/* ✅ Nom affiché via user_name dans la liste */}
              <span className="help-card-author">
                <User size={12} />
                {req.user_name || 'Utilisateur'}
              </span>
              <span className="help-card-responses">
                <MessageCircle size={12} />
                {req.responses_count ?? req.responses?.length ?? 0} réponse{(req.responses_count ?? 0) > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="help-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>Nouvelle demande d'aide</h3>
              <button className="help-modal-close" onClick={() => setShowCreate(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="help-modal-form">
              <label>
                <span>Titre <em>*</em></span>
                <input
                  type="text"
                  placeholder="Ex: Comment résoudre un problème en algèbre ?"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  maxLength={255}
                  required
                />
              </label>
              <label>
                <span>Catégorie</span>
                <input
                  type="text"
                  placeholder="Ex: Mathématiques, Informatique..."
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  maxLength={100}
                />
              </label>
              <label>
                <span>Description <em>*</em></span>
                <textarea
                  placeholder="Décrivez votre problème en détail..."
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
              </label>
              <div className="help-modal-actions">
                <button type="button" className="help-cancel-btn" onClick={() => setShowCreate(false)}>
                  Annuler
                </button>
                <button type="submit" className="help-submit-btn" disabled={submitting}>
                  {submitting ? 'Publication...' : 'Publier la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}