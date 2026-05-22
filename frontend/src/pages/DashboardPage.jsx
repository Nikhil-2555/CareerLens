import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { TrendingUp, FileText, Briefcase, Calendar, GripVertical, ExternalLink, MoreHorizontal, Plus } from 'lucide-react'
import './DashboardPage.css'

const metrics = [
  { label: 'Total Applications', value: '24', change: '+3 this week', icon: Briefcase, color: 'var(--cl-primary)' },
  { label: 'Average Fit Score', value: '78%', change: '+5% improvement', icon: TrendingUp, color: 'var(--cl-secondary)' },
  { label: 'Cover Letters', value: '12', change: '2 pending', icon: FileText, color: 'var(--cl-tertiary)' },
  { label: 'Interviews', value: '5', change: 'Next: Tomorrow', icon: Calendar, color: 'var(--cl-warning)' },
]

const kanbanCols = [
  { id: 'saved', title: 'Saved', color: 'var(--cl-on-surface-variant)', cards: [
    { company: 'Google', role: 'Senior Frontend Engineer', score: 92, date: 'May 20', tag: 'Remote' },
    { company: 'Stripe', role: 'Full Stack Developer', score: 85, date: 'May 18', tag: 'Hybrid' },
    { company: 'Vercel', role: 'React Developer', score: 88, date: 'May 17', tag: 'Remote' },
  ]},
  { id: 'applied', title: 'Applied', color: 'var(--cl-tertiary)', cards: [
    { company: 'Netflix', role: 'UI Engineer', score: 79, date: 'May 15', tag: 'On-site' },
    { company: 'Shopify', role: 'Frontend Lead', score: 91, date: 'May 14', tag: 'Remote' },
    { company: 'Figma', role: 'Design Engineer', score: 83, date: 'May 12', tag: 'Hybrid' },
    { company: 'Linear', role: 'Product Engineer', score: 87, date: 'May 10', tag: 'Remote' },
  ]},
  { id: 'interview', title: 'Interview', color: 'var(--cl-warning)', cards: [
    { company: 'Meta', role: 'Software Engineer', score: 76, date: 'May 22', tag: 'On-site' },
    { company: 'Apple', role: 'Web Developer', score: 81, date: 'May 23', tag: 'On-site' },
  ]},
  { id: 'offer', title: 'Offer', color: 'var(--cl-secondary)', cards: [
    { company: 'GitHub', role: 'Staff Engineer', score: 95, date: 'May 19', tag: 'Remote' },
  ]},
  { id: 'rejected', title: 'Rejected', color: 'var(--cl-error)', cards: [
    { company: 'Amazon', role: 'SDE II', score: 62, date: 'May 8', tag: 'On-site' },
  ]},
]

const activities = [
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

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <DashboardLayout>
      <TopBar title="Good Morning, John 👋" subtitle={today} />
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
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Plus size={16} /> New Application</button>
            </div>
            <div className="dash__kanban">
              {kanbanCols.map(col => (
                <div key={col.id} className="dash__kanban-col">
                  <div className="dash__kanban-col-header">
                    <div className="dash__kanban-col-dot" style={{ background: col.color }}></div>
                    <span className="dash__kanban-col-title">{col.title}</span>
                    <span className="dash__kanban-col-count">{col.cards.length}</span>
                  </div>
                  <div className="dash__kanban-cards">
                    {col.cards.map((card, j) => (
                      <div key={j} className="dash__kanban-card glass-card">
                        <div className="dash__kanban-card-top">
                          <span className="dash__kanban-card-company">{card.company}</span>
                          <button className="dash__kanban-card-menu"><MoreHorizontal size={14} /></button>
                        </div>
                        <span className="dash__kanban-card-role">{card.role}</span>
                        <div className="dash__kanban-card-bottom">
                          <div className="badge" style={{ background: `${getScoreColor(card.score)}20`, color: getScoreColor(card.score) }}>
                            {card.score}% fit
                          </div>
                          <span className="dash__kanban-card-tag">{card.tag}</span>
                        </div>
                        <span className="dash__kanban-card-date">{card.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="dash__activity glass-card-strong">
            <h3>Recent Activity</h3>
            <div className="dash__activity-list">
              {activities.map((a, i) => (
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
    </DashboardLayout>
  )
}
