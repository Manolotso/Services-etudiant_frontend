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
    .then(res => {
      // 1. On récupère les données
      const data = res.data;

      // 2. On trie par DATE (les plus récents en premier)
      // Mais si les dates sont identiques à la seconde près (ce qui arrive avec un scraper),
      // on utilise l'ID pour départager.
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);

        if (dateB - dateA !== 0) {
          return dateB - dateA; // Trie par jour/heure
        }
        
        // Si la date est identique (même session de scrap), 
        // on trie par ID décroissant pour garder l'ordre du site
        return b.id - a.id; 
      });

      setJobs(sortedData);
    })
    .catch(() => setJobs([]))
    .finally(() => setLoading(false))
}, [])

  // Vérifie si l'offre date de moins de 24h
  const isNew = (dateString) => {
    const jobDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - jobDate) / (1000 * 60 * 60);
    return diffInHours < 24; 
  };

  const uniqueContracts = [...new Set(jobs.map(j => j.contract).filter(Boolean))]

  const filtered = jobs.filter(j => {
    const matchSearch = 
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || j.job_type === filterType
    const matchContract = filterContract === 'all' || j.contract === filterContract
    
    return matchSearch && matchType && matchContract
  })

  const activeFilters = [filterType, filterContract].filter(f => f !== 'all').length
  
  const clearFilters = () => { 
    setFilterType('all'); 
    setFilterContract('all'); 
    setSearch('') 
  }

  if (loading) return <div className="jobs-loading"><div className="spinner" /><span>Chargement des opportunités...</span></div>

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

      {/* Toolbar & Search */}
      <div className="jobs-toolbar">
        <div className="jobs-search">
          <Search size={14} />
          <input
            placeholder="Rechercher un poste, une entreprise ou une ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="jobs-filters-grid">
        <div className="filter-group">
          <label className="filter-label"><Tag size={12} /> Type de mission</label>
          <div className="filter-chips">
            {['all', 'internship', 'job', 'freelance'].map(t => (
              <button 
                key={t} 
                className={`filter-chip ${filterType === t ? 'active' : ''}`} 
                onClick={() => setFilterType(t)}
              >
                {t === 'all' ? 'Tout voir' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {uniqueContracts.length > 0 && (
          <div className="filter-group">
            <label className="filter-label"><FileText size={12} /> Type de contrat</label>
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
          <h3>Aucune offre trouvée</h3>
          <p>Essayez de modifier vos filtres ou votre recherche.</p>
          {activeFilters > 0 && <button className="clear-filters-btn" onClick={clearFilters}>Effacer les filtres</button>}
        </div>
      )}

      {/* Job cards Grid */}
      <div className="jobs-grid">
        {filtered.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-card-top">
              <div className="badge-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className={`job-type-badge color-${TYPE_COLORS[job.job_type] || 'primary'}`}>
                  <Tag size={10} />
                  {TYPE_LABELS[job.job_type] || job.job_type}
                </div>
                
                {/* Badge NOUVEAU */}
                {isNew(job.created_at) && (
                  <span className="new-badge">Nouveau</span>
                )}
              </div>

              <div className="job-date">
                <Clock size={12} />
                {new Date(job.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            <h3 className="job-card-title">{job.title}</h3>

            <div className="job-meta-row">
              {job.company && (
                <div className="job-company">
                  <Building2 size={13} />
                  {job.company_link ? (
                    <a href={job.company_link} target="_blank" rel="noopener noreferrer" className="company-link">
                      {job.company}
                    </a>
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

            {job.contract && (
               <div className="job-contract-tag">
                 <FileText size={12} /> {job.contract}
               </div>
            )}

            {job.category && (
              <div className="job-category">
                <Layers size={12} />
                {job.category}
              </div>
            )}

            {job.description && <p className="job-description">{job.description}</p>}

            <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
              Consulter l'annonce <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}