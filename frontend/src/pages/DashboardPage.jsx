import { useState, useEffect, useRef } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { TrendingUp, FileText, Briefcase, Calendar, MoreHorizontal, Plus, X, ArrowRight, Trash2, ChevronDown } from 'lucide-react'
import './DashboardPage.css'

const API_BASE = 'http://localhost:5000'

const STATUS_COLUMNS = [
  { id: 'saved', title: 'Saved', color: 'var(--cl-on-surface-variant)' },
  { id: 'applied', title: 'Applied', color: 'var(--cl-tertiary)' },
  { id: 'interview', title: 'Interview', color: 'var(--cl-warning)' },
  { id: 'offer', title: 'Offer', color: 'var(--cl-secondary)' },
  { id: 'rejected', title: 'Rejected', color: 'var(--cl-error)' },
]

const DEMO_CARDS = [
  { _id: 'demo-1', company: 'Google', jobTitle: 'Senior Frontend Engineer', fitScore: 92, tags: ['Remote'], status: 'saved', updatedAt: '2026-05-20' },
  { _id: 'demo-2', company: 'Stripe', jobTitle: 'Full Stack Developer', fitScore: 85, tags: ['Hybrid'], status: 'saved', updatedAt: '2026-05-18' },
  { _id: 'demo-3', company: 'Vercel', jobTitle: 'React Developer', fitScore: 88, tags: ['Remote'], status: 'saved', updatedAt: '2026-05-17' },
  { _id: 'demo-4', company: 'Netflix', jobTitle: 'UI Engineer', fitScore: 79, tags: ['On-site'], status: 'applied', updatedAt: '2026-05-15' },
  { _id: 'demo-5', company: 'Shopify', jobTitle: 'Frontend Lead', fitScore: 91, tags: ['Remote'], status: 'applied', updatedAt: '2026-05-14' },
  { _id: 'demo-6', company: 'Figma', jobTitle: 'Design Engineer', fitScore: 83, tags: ['Hybrid'], status: 'applied', updatedAt: '2026-05-12' },
  { _id: 'demo-7', company: 'Linear', jobTitle: 'Product Engineer', fitScore: 87, tags: ['Remote'], status: 'applied', updatedAt: '2026-05-10' },
  { _id: 'demo-8', company: 'Meta', jobTitle: 'Software Engineer', fitScore: 76, tags: ['On-site'], status: 'interview', updatedAt: '2026-05-22' },
  { _id: 'demo-9', company: 'Apple', jobTitle: 'Web Developer', fitScore: 81, tags: ['On-site'], status: 'interview', updatedAt: '2026-05-23' },
  { _id: 'demo-10', company: 'GitHub', jobTitle: 'Staff Engineer', fitScore: 95, tags: ['Remote'], status: 'offer', updatedAt: '2026-05-19' },
  { _id: 'demo-11', company: 'Amazon', jobTitle: 'SDE II', fitScore: 62, tags: ['On-site'], status: 'rejected', updatedAt: '2026-05-08' },
]

const INITIAL_ACTIVITIES = [
  { text: 'Cover letter generated for Google', time: '2 hours ago', type: 'success' },
  { text: 'New fit score: 92% for Stripe', time: '5 hours ago', type: 'primary' },
  { text: 'Interview scheduled with Meta', time: 'Yesterday', type: 'warning' },
  { text: 'Application submitted to Figma', time: '2 days ago', type: 'primary' },
  { text: 'Offer received from GitHub!', time: '3 days ago', type: 'success' },
]

function getScoreColor(score) {
  if (score >= 85) return 'var(--cl-secondary)'
  if (score >= 70) return 'var(--cl-warning)'
  return 'var(--cl-error)'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── Card Context Menu ─── */
function CardMenu({ card, onMove, onDelete, onClose }) {
  const menuRef = useRef(null)
  const currentIdx = STATUS_COLUMNS.findIndex(c => c.id === card.status)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const moveTargets = STATUS_COLUMNS.filter((_, i) => i !== currentIdx)

  return (
    <div className="dash__card-menu-dropdown" ref={menuRef}>
      <div className="dash__card-menu-label">Move to</div>
      {moveTargets.map(col => (
        <button
          key={col.id}
          className="dash__card-menu-item"
          onClick={() => { onMove(card, col.id); onClose() }}
        >
          <ArrowRight size={14} />
          <span>{col.title}</span>
          <div className="dash__card-menu-dot" style={{ background: col.color }}></div>
        </button>
      ))}
      <div className="dash__card-menu-divider" />
      <button
        className="dash__card-menu-item dash__card-menu-item--danger"
        onClick={() => { onDelete(card); onClose() }}
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  )
}

/* ─── New Application Modal ─── */
function NewApplicationModal({ onClose, onSubmit }) {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [status, setStatus] = useState('saved')
  const [fitScore, setFitScore] = useState('')
  const [tag, setTag] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.trim() || !jobTitle.trim()) {
      setError('Company and Job Title are required.')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await onSubmit({
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        jobUrl: jobUrl.trim(),
        status,
        fitScore: fitScore ? Number(fitScore) : undefined,
        tags: tag.trim() ? tag.split(',').map(t => t.trim()).filter(Boolean) : [],
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card-strong" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Application</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="app-company">Company *</label>
              <input id="app-company" type="text" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} autoComplete="organization" required />
            </div>
            <div className="modal-field">
              <label htmlFor="app-title">Job Title *</label>
              <input id="app-title" type="text" placeholder="e.g. Frontend Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} autoComplete="off" required />
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="app-url">Job URL</label>
              <input id="app-url" type="url" placeholder="https://..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} autoComplete="url" />
            </div>
            <div className="modal-field">
              <label htmlFor="app-status">Status</label>
              <div className="modal-select-wrapper">
                <select id="app-status" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <ChevronDown size={16} className="modal-select-icon" />
              </div>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="app-score">Fit Score (0-100)</label>
              <input id="app-score" type="number" min="0" max="100" placeholder="e.g. 85" value={fitScore} onChange={e => setFitScore(e.target.value)} />
            </div>
            <div className="modal-field">
              <label htmlFor="app-tags">Tags (comma-separated)</label>
              <input id="app-tags" type="text" placeholder="Remote, Full-time" value={tag} onChange={e => setTag(e.target.value)} />
            </div>
          </div>
          <div className="modal-field">
            <label htmlFor="app-notes">Notes</label>
            <textarea id="app-notes" rows="3" placeholder="Any notes about this application..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  const [applications, setApplications] = useState(DEMO_CARDS)
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)
  const [showNewModal, setShowNewModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const { user } = useUser()
  const { getToken } = useAuth()
  const firstName = user?.firstName || 'User'

  const getAuthHeaders = async () => {
    const token = await getToken()
    return token
      ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      : { 'Content-Type': 'application/json' }
  }

  // Try to load real data from backend on mount
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_BASE}/api/v1/applications`, { headers, credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data && data.data.length > 0) {
            setApplications(data.data)
            setIsBackendConnected(true)
          }
          // If empty array from API, keep demo data
        }
      } catch {
        // Backend not available — keep demo data
      }
    }
    loadApplications()
  }, [])

  // ─── Create Application ───
  const handleCreateApplication = async (appData) => {
    if (isBackendConnected) {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/v1/applications`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(appData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create')
      setApplications(prev => [data.data, ...prev])
    } else {
      // Local-only mode
      const newApp = {
        _id: `local-${Date.now()}`,
        ...appData,
        updatedAt: new Date().toISOString(),
      }
      setApplications(prev => [newApp, ...prev])
    }
    setActivities(prev => [
      { text: `New application added: ${appData.jobTitle} at ${appData.company}`, time: 'Just now', type: 'primary' },
      ...prev,
    ])
  }

  // ─── Move Card (change status) ───
  const handleMoveCard = async (card, newStatus) => {
    // Optimistic update
    setApplications(prev => prev.map(a => a._id === card._id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a))

    const statusLabel = STATUS_COLUMNS.find(c => c.id === newStatus)?.title || newStatus
    setActivities(prev => [
      { text: `${card.company} moved to ${statusLabel}`, time: 'Just now', type: newStatus === 'offer' ? 'success' : newStatus === 'rejected' ? 'warning' : 'primary' },
      ...prev,
    ])

    if (isBackendConnected && !card._id.startsWith('demo-') && !card._id.startsWith('local-')) {
      try {
        const headers = await getAuthHeaders()
        await fetch(`${API_BASE}/api/v1/applications/${card._id}`, {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        })
      } catch {
        // Silently fail — optimistic update already applied
      }
    }
  }

  // ─── Delete Card ───
  const handleDeleteCard = async (card) => {
    setApplications(prev => prev.filter(a => a._id !== card._id))

    setActivities(prev => [
      { text: `${card.company} — ${card.jobTitle} removed`, time: 'Just now', type: 'warning' },
      ...prev,
    ])

    if (isBackendConnected && !card._id.startsWith('demo-') && !card._id.startsWith('local-')) {
      try {
        const headers = await getAuthHeaders()
        await fetch(`${API_BASE}/api/v1/applications/${card._id}`, {
          method: 'DELETE',
          headers,
          credentials: 'include',
        })
      } catch {
        // Silently fail
      }
    }
  }

  // ─── Compute metrics ───
  const totalApps = applications.length
  const avgScore = applications.filter(a => a.fitScore).length > 0
    ? Math.round(applications.filter(a => a.fitScore).reduce((sum, a) => sum + a.fitScore, 0) / applications.filter(a => a.fitScore).length)
    : 0
  const interviewCount = applications.filter(a => a.status === 'interview').length
  const offerCount = applications.filter(a => a.status === 'offer').length

  const metrics = [
    { label: 'Total Applications', value: String(totalApps), change: `${applications.filter(a => a.status === 'saved').length} saved`, icon: Briefcase, color: 'var(--cl-primary)' },
    { label: 'Average Fit Score', value: `${avgScore}%`, change: `${applications.filter(a => a.fitScore >= 85).length} excellent`, icon: TrendingUp, color: 'var(--cl-secondary)' },
    { label: 'Offers', value: String(offerCount), change: `${applications.filter(a => a.status === 'applied').length} applied`, icon: FileText, color: 'var(--cl-tertiary)' },
    { label: 'Interviews', value: String(interviewCount), change: interviewCount > 0 ? 'Upcoming' : 'None yet', icon: Calendar, color: 'var(--cl-warning)' },
  ]

  return (
    <DashboardLayout>
      <TopBar title={`Good Morning, ${firstName} 👋`} subtitle={today} />
      <div className="dash__content">
        {/* Metrics */}
        <div className="dash__metrics">
          {metrics.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={i} className="dash__metric glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="dash__metric-icon" style={{ background: `${m.color}18`, color: m.color }}>
                  <Icon size={22} />
                </div>
                <div className="dash__metric-info">
                  <span className="dash__metric-label">{m.label}</span>
                  <span className="dash__metric-value">{m.value}</span>
                  <span className="dash__metric-change">{m.change}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="dash__body">
          {/* Kanban */}
          <div className="dash__kanban-section">
            <div className="dash__section-header">
              <h2>Application Pipeline</h2>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowNewModal(true)}>
                <Plus size={16} /> New Application
              </button>
            </div>
            <div className="dash__kanban">
              {STATUS_COLUMNS.map(col => {
                const colCards = applications.filter(a => a.status === col.id)
                return (
                  <div key={col.id} className="dash__kanban-col">
                    <div className="dash__kanban-col-header">
                      <div className="dash__kanban-col-dot" style={{ background: col.color }}></div>
                      <span className="dash__kanban-col-title">{col.title}</span>
                      <span className="dash__kanban-col-count">{colCards.length}</span>
                    </div>
                    <div className="dash__kanban-cards">
                      {colCards.map((card) => (
                        <div key={card._id} className="dash__kanban-card glass-card">
                          <div className="dash__kanban-card-top">
                            <span className="dash__kanban-card-company">{card.company}</span>
                            <div className="dash__kanban-card-menu-wrapper">
                              <button
                                className="dash__kanban-card-menu"
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === card._id ? null : card._id) }}
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {openMenuId === card._id && (
                                <CardMenu
                                  card={card}
                                  onMove={handleMoveCard}
                                  onDelete={handleDeleteCard}
                                  onClose={() => setOpenMenuId(null)}
                                />
                              )}
                            </div>
                          </div>
                          <span className="dash__kanban-card-role">{card.jobTitle}</span>
                          <div className="dash__kanban-card-bottom">
                            {card.fitScore != null && (
                              <div className="badge" style={{ background: `${getScoreColor(card.fitScore)}20`, color: getScoreColor(card.fitScore) }}>
                                {card.fitScore}% fit
                              </div>
                            )}
                            {(card.tags && card.tags.length > 0) && (
                              <span className="dash__kanban-card-tag">{card.tags[0]}</span>
                            )}
                          </div>
                          <span className="dash__kanban-card-date">{formatDate(card.updatedAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity */}
          <div className="dash__activity glass-card-strong">
            <h3>Recent Activity</h3>
            <div className="dash__activity-list">
              {activities.slice(0, 8).map((a, i) => (
                <div key={i} className="dash__activity-item">
                  <div className={`dash__activity-dot dash__activity-dot--${a.type}`}></div>
                  <div className="dash__activity-info">
                    <span className="dash__activity-text">{a.text}</span>
                    <span className="dash__activity-time">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Application Modal */}
      {showNewModal && (
        <NewApplicationModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleCreateApplication}
        />
      )}
    </DashboardLayout>
  )
}
