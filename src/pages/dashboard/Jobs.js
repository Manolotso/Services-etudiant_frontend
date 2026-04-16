import React, { useState, useEffect } from 'react'
import { Briefcase, Search, ExternalLink, Clock, Building2, Tag, MapPin, FileText, Layers } from 'lucide-react'
import '../../styles/jobs.css'
import { getJobs } from '../../services/api'

const TYPE_LABELS = { internship: 'Stage', job: 'Emploi', freelance: 'Freelance' }
const TYPE_COLORS = { internship: 'green', job: 'primary', freelance: 'orange' }

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterContract, setFilterContract] = useState('all')

  useEffect(() => {
    getJobs()
      .then(res => setJobs(res.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const isNew = (dateString) => {
  const jobDate = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - jobDate) / (1000 * 60 * 60);
  return diffInHours < 24; // Change 24 par 48 si tu veux 2 jours
};

  const uniqueContracts = [...new Set(jobs.map(j => j.contract).filter(Boolean))]

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || j.job_type === filterType
    const matchContract = filterContract === 'all' || j.contract === filterContract
    
    // On ne garde que la recherche, le type et le contrat
    return matchSearch && matchType && matchContract
  })

  const activeFilters = [filterType, filterContract].filter(f => f !== 'all').length
  const clearFilters = () => { 
    setFilterType('all'); 
    setFilterContract('all'); 
    setSearch('') 
  }


  if (loading) return <div className="jobs-loading"><div className="spinner" /><span>Chargement...</span></div>

  return (
    <div className="jobs-page">
      {/* Header */}
      <div className="jobs-header">
        <div>
          <h2 className="jobs-title">Offres & Opportunités</h2>
          <p className="jobs-subtitle">
            {filtered.length} offre{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
            {jobs.length !== filtered.length && <span> sur {jobs.length}</span>}
          </p>
        </div>
        {activeFilters > 0 && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Réinitialiser les filtres ({activeFilters})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="jobs-toolbar">
        <div className="jobs-search">
          <Search size={14} />
          <input
            placeholder="Rechercher un poste, entreprise ou lieu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="jobs-filters-grid">
        {/* Type */}
        <div className="filter-group">
          <label className="filter-label"><Tag size={12} /> Type</label>
          <div className="filter-chips">
            {['all', 'internship', 'job', 'freelance'].map(t => (
              <button key={t} className={`filter-chip ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
                {t === 'all' ? 'Tout' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Contract */}
        {uniqueContracts.length > 0 && (
          <div className="filter-group">
            <label className="filter-label"><FileText size={12} /> Contrat</label>
            <select className="filter-select" value={filterContract} onChange={e => setFilterContract(e.target.value)}>
              <option value="all">Tous les contrats</option>
              {uniqueContracts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="jobs-empty">
          <Briefcase size={48} />
          <h3>Aucune offre disponible</h3>
          <p>Il n'y a pas d'offres correspondant à votre recherche pour le moment.</p>
          {activeFilters > 0 && <button className="clear-filters-btn" onClick={clearFilters}>Réinitialiser les filtres</button>}
        </div>
      )}

      {/* Job cards */}
      <div className="jobs-grid">
        {filtered.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-card-top">
              <div className={`job-type-badge color-${TYPE_COLORS[job.job_type] || 'primary'}`}>
                <Tag size={10} />
                {TYPE_LABELS[job.job_type] || job.job_type}

                {/* NOUVEAU BADGE ICI */}
                  {isNew(job.created_at) && (
                  <div className="new-badge">Nouveau</div>
                )}

              </div>
              {job.contract && <div className="job-contract-badge">{job.contract}</div>}
              <div className="job-date">
                <Clock size={12} />
                {new Date(job.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <h3 className="job-card-title">{job.title}</h3>

            <div className="job-meta-row">
              {job.company && (
                <div className="job-company">
                  <Building2 size={13} />
                  {job.company_link ? (
                    <a href={job.company_link} target="_blank" rel="noopener noreferrer" className="company-link">{job.company}</a>
                  ) : job.company}
                </div>
              )}
              {job.location && (
                <div className="job-location">
                  <MapPin size={13} />
                  {job.location}
                </div>
              )}
            </div>

            {job.category && (
              <div className="job-category">
                <Layers size={12} />
                {job.category}
              </div>
            )}

            {job.description && <p className="job-description">{job.description}</p>}

            <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
              Voir l'offre <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}