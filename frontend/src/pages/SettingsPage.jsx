import { useState, useEffect } from 'react'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import {
  User, Bell, Shield, Moon, Sun, Download, Trash2, Mail,
  FileText, BarChart3, Bot, Sliders, CheckCircle2, Lock,
  ExternalLink, HardDrive, Cpu, Sparkles, Check
} from 'lucide-react'
import './SettingsPage.css'

export default function SettingsPage() {
  const [activeNav, setActiveNav] = useState('profile')
  const [darkMode, setDarkMode] = useState(() => !document.documentElement.classList.contains('light-mode'))
  const [notifs, setNotifs] = useState({ email: true, analysis: true, digest: false })
  const [aiConfig, setAiConfig] = useState({ model: 'llama3-70b', atsStrictness: 'strict', boostRewrite: true })
  
  const { user } = useUser()
  const { getToken } = useAuth()
  const { openUserProfile } = useClerk()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.add('light-mode')
    }
  }, [darkMode])

  const getAuthHeaders = async () => {
    const token = await getToken()
    return token
      ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      : { 'Content-Type': 'application/json' }
  }

  const handleExportData = async () => {
    try {
      const headers = await getAuthHeaders()
      const [profileRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/users/profile', { headers }),
        fetch('http://localhost:5000/api/v1/users/stats', { headers })
      ])
      const profile = await profileRes.json()
      const stats = await statsRes.json()
      
      const exportData = { profile: profile.data, stats: stats.data, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `careerlens-data-${user?.username || 'export'}.json`
      a.click()
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  const userInitial = user?.firstName?.[0] || user?.fullName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <TopBar title="Account & Preferences" subtitle="Manage your workspace profile, AI models, and security" />
      
      <div className="settings__layout">
        
        {/* ── Left Navigation Sticky Column ── */}
        <div className="settings__nav-card">
          <div className="settings__nav-title">Workspace Settings</div>
          
          <button className={`settings__nav-btn ${activeNav === 'profile' ? 'settings__nav-btn--active' : ''}`} onClick={() => setActiveNav('profile')}>
            <User size={18} /> My Profile & Account
          </button>
          
          <button className={`settings__nav-btn ${activeNav === 'notifs' ? 'settings__nav-btn--active' : ''}`} onClick={() => setActiveNav('notifs')}>
            <Bell size={18} /> Notifications & Alerts
          </button>
          
          <button className={`settings__nav-btn ${activeNav === 'ai' ? 'settings__nav-btn--active' : ''}`} onClick={() => setActiveNav('ai')}>
            <Bot size={18} /> AI Screening Engine
          </button>
          
          <button className={`settings__nav-btn ${activeNav === 'appearance' ? 'settings__nav-btn--active' : ''}`} onClick={() => setActiveNav('appearance')}>
            <Moon size={18} /> Theme & Appearance
          </button>
          
          <button className={`settings__nav-btn ${activeNav === 'privacy' ? 'settings__nav-btn--active' : ''}`} onClick={() => setActiveNav('privacy')}>
            <Shield size={18} /> Security & Data Privacy
          </button>
        </div>

        {/* ── Right Content Panels ── */}
        <div className="settings__content-area">
          
          {/* Panel 1: Profile & Account */}
          {activeNav === 'profile' && (
            <div className="settings__panel">
              <div className="settings__panel-header">
                <h2>Profile & Authentication</h2>
                <p>Your personal identity and login security are protected by enterprise Clerk encryption.</p>
              </div>

              {/* Hero Banner */}
              <div className="settings__profile-hero">
                <div className="settings__profile-main">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="settings__profile-img" />
                  ) : (
                    <div className="settings__profile-img">{userInitial}</div>
                  )}
                  <div className="settings__profile-text">
                    <h3>
                      {user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'CareerLens Member'}
                      <span className="badge" style={{ background: 'rgba(0,184,148,0.2)', color: 'var(--cl-secondary)', border: '1px solid rgba(0,184,148,0.4)', fontSize: '0.75rem', padding: '4px 10px' }}>
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} /> Verified Member
                      </span>
                    </h3>
                    <p>{user?.primaryEmailAddress?.emailAddress || 'No primary email linked'}</p>
                  </div>
                </div>

                <button className="settings__clerk-btn" onClick={() => openUserProfile()}>
                  <Lock size={16} /> Manage Login & Security <ExternalLink size={14} />
                </button>
              </div>

              {/* Overview Details Card */}
              <div className="settings__card">
                <div className="settings__card-title"><HardDrive size={18} style={{ color: 'var(--cl-primary-light)' }} /> Workspace Account Metadata</div>
                
                <div className="settings__info-row">
                  <span>Clerk Unique Identity ID</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--cl-primary-light)' }}>{user?.id || 'usr_dev_mode_active'}</strong>
                </div>
                
                <div className="settings__info-row">
                  <span>Account Authentication Provider</span>
                  <strong>{user?.externalAccounts?.[0]?.provider || 'Email & Password Auth'}</strong>
                </div>

                <div className="settings__info-row">
                  <span>Workspace Membership Tier</span>
                  <strong style={{ color: 'var(--cl-secondary)' }}>✨ CareerLens Pro AI (Unlimited Screening)</strong>
                </div>

                <div className="settings__info-row">
                  <span>Member Since</span>
                  <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'June 2026'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Panel 2: Notifications */}
          {activeNav === 'notifs' && (
            <div className="settings__panel">
              <div className="settings__panel-header">
                <h2>Notification Preferences</h2>
                <p>Control where and when you receive updates regarding your AI screening reports.</p>
              </div>

              <div className="settings__card">
                <div className="settings__toggles-list">
                  
                  <div className="settings__toggle-item">
                    <div className="settings__toggle-meta">
                      <div className="settings__toggle-icon"><Mail size={22} /></div>
                      <div className="settings__toggle-desc">
                        <strong>Account & Security Alerts</strong>
                        <span>Receive critical notifications regarding login verification and account updates.</span>
                      </div>
                    </div>
                    <label className="settings__switch">
                      <input type="checkbox" checked={notifs.email} onChange={() => setNotifs({...notifs, email: !notifs.email})} />
                      <span className="settings__slider"></span>
                    </label>
                  </div>

                  <div className="settings__toggle-item">
                    <div className="settings__toggle-meta">
                      <div className="settings__toggle-icon" style={{ color: 'var(--cl-secondary)' }}><FileText size={22} /></div>
                      <div className="settings__toggle-desc">
                        <strong>Instant AI Screening Alerts</strong>
                        <span>Get browser push alerts immediately when complex PDF text parsing finishes.</span>
                      </div>
                    </div>
                    <label className="settings__switch">
                      <input type="checkbox" checked={notifs.analysis} onChange={() => setNotifs({...notifs, analysis: !notifs.analysis})} />
                      <span className="settings__slider"></span>
                    </label>
                  </div>

                  <div className="settings__toggle-item">
                    <div className="settings__toggle-meta">
                      <div className="settings__toggle-icon" style={{ color: 'var(--cl-warning)' }}><BarChart3 size={22} /></div>
                      <div className="settings__toggle-desc">
                        <strong>Weekly ATS Keyword Market Trends</strong>
                        <span>Curated Monday digest highlighting emerging skills demanded by recruiters.</span>
                      </div>
                    </div>
                    <label className="settings__switch">
                      <input type="checkbox" checked={notifs.digest} onChange={() => setNotifs({...notifs, digest: !notifs.digest})} />
                      <span className="settings__slider"></span>
                    </label>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Panel 3: AI Screening Configuration (New WOW Feature!) */}
          {activeNav === 'ai' && (
            <div className="settings__panel">
              <div className="settings__panel-header">
                <h2>AI Screening Engine Configuration</h2>
                <p>Fine-tune how Groq Llama 3 evaluates your qualifications and rewrites bullet points.</p>
              </div>

              <div className="settings__card">
                <div className="settings__card-title"><Cpu size={18} style={{ color: 'var(--cl-primary-light)' }} /> Active Large Language Model</div>
                <div className="settings__radio-group">
                  <div className={`settings__radio-card ${aiConfig.model === 'llama3-70b' ? 'settings__radio-card--selected' : ''}`} onClick={() => setAiConfig({...aiConfig, model: 'llama3-70b'})}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 4 }}>Groq Llama 3 70B (Recommended)</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)' }}>Highest semantic reasoning capabilities. Unmatched JD alignment accuracy.</span>
                    </div>
                    {aiConfig.model === 'llama3-70b' && <Check size={20} style={{ color: 'var(--cl-secondary)' }} />}
                  </div>

                  <div className={`settings__radio-card ${aiConfig.model === 'llama3-8b' ? 'settings__radio-card--selected' : ''}`} onClick={() => setAiConfig({...aiConfig, model: 'llama3-8b'})}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 4 }}>Groq Llama 3 8B Instant</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)' }}>Ultra-low latency screening (~400ms). Perfect for rapid bulk draft scanning.</span>
                    </div>
                    {aiConfig.model === 'llama3-8b' && <Check size={20} style={{ color: 'var(--cl-secondary)' }} />}
                  </div>
                </div>
              </div>

              <div className="settings__card">
                <div className="settings__card-title"><Sliders size={18} style={{ color: 'var(--cl-warning)' }} /> ATS Diagnostic Sensitivity</div>
                <div className="settings__radio-group">
                  <div className={`settings__radio-card ${aiConfig.atsStrictness === 'strict' ? 'settings__radio-card--selected' : ''}`} onClick={() => setAiConfig({...aiConfig, atsStrictness: 'strict'})}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 4 }}>Enterprise Strict (Workday / Taleo / Greenhouse)</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)' }}>Flags any tables, icons, or custom fonts that risk automated bot rejection.</span>
                    </div>
                    {aiConfig.atsStrictness === 'strict' && <Check size={20} style={{ color: 'var(--cl-secondary)' }} />}
                  </div>

                  <div className={`settings__radio-card ${aiConfig.atsStrictness === 'lenient' ? 'settings__radio-card--selected' : ''}`} onClick={() => setAiConfig({...aiConfig, atsStrictness: 'lenient'})}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 4 }}>Startup Lenient (Human First Review)</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)' }}>Allows modern creative layouts and PDF graphic elements.</span>
                    </div>
                    {aiConfig.atsStrictness === 'lenient' && <Check size={20} style={{ color: 'var(--cl-secondary)' }} />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel 4: Appearance */}
          {activeNav === 'appearance' && (
            <div className="settings__panel">
              <div className="settings__panel-header">
                <h2>Workspace Theme & Interface</h2>
                <p>Customize interface color schemes and contrast levels for optimal viewing experience.</p>
              </div>

              <div className="settings__theme-grid">
                <div className={`settings__theme-card ${darkMode ? 'settings__theme-card--active' : ''}`} onClick={() => setDarkMode(true)}>
                  <div className="settings__theme-preview settings__theme-preview--dark">
                    🌙 Midnight Glass (Dark)
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>Dark Glassmorphism</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cl-on-surface-variant)' }}>Reduces eye strain with high-contrast glowing charts.</span>
                  </div>
                </div>

                <div className={`settings__theme-card ${!darkMode ? 'settings__theme-card--active' : ''}`} onClick={() => setDarkMode(false)}>
                  <div className="settings__theme-preview settings__theme-preview--light">
                    ☀️ Clean Studio (Light)
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>Clean Studio Light</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cl-on-surface-variant)' }}>Crisp white surfaces designed for daytime office environments.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel 5: Privacy & Security */}
          {activeNav === 'privacy' && (
            <div className="settings__panel">
              <div className="settings__panel-header">
                <h2>Privacy, Data Ownership & Security</h2>
                <p>CareerLens enforces zero-retention policies. You retain 100% intellectual property rights.</p>
              </div>

              <div className="settings__card">
                <div className="settings__card-title"><Shield size={18} style={{ color: 'var(--cl-secondary)' }} /> GDPR & Data Extraction Guarantee</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--cl-on-surface-variant)', lineHeight: 1.6 }}>
                  Uploaded PDF/DOCX files are processed in volatile RAM during text extraction and immediately discarded from servers. No Personally Identifiable Information (PII) is retained or sold to third-party AI trainers.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={handleExportData}>
                    <Download size={16} /> Export Account Data & History (.JSON)
                  </button>
                </div>
              </div>

              <div className="settings__danger-card">
                <div className="settings__danger-header"><Trash2 size={22} /> Danger Zone: Permanent Account Erasure</div>
                <p style={{ color: 'rgba(239, 68, 68, 0.85)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Erasing your account permanently removes your identity mapping and wipes all saved resume analysis logs. This action cannot be reversed.
                </p>
                <div>
                  <button className="btn-danger" style={{ padding: '12px 24px', fontWeight: 700 }}>
                    <Trash2 size={16} /> Permanently Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  )
}
