import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { User, Bell, Shield, Moon, Sun, Download, Trash2, Mail, FileText, BarChart3, Check, X } from 'lucide-react'
import './SettingsPage.css'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(() => !document.documentElement.classList.contains('light-mode'))
  const [notifs, setNotifs] = useState({ email: true, analysis: true, digest: false })
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{"name":"User", "email":"user@example.com"}'))
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(user.name)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.add('light-mode')
    }
  }, [darkMode])

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('http://localhost:5000/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName })
      })
      if (res.ok) {
        const data = await res.json()
        const updatedUser = { ...user, name: data.data.name }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setIsEditingProfile(false)
        // Refresh page to update sidebar/topbar
        window.location.reload()
      }
    } catch (e) {
      console.error('Failed to update profile', e)
    }
  }

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const headers = { 'Authorization': `Bearer ${token}` }
      const [profileRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/users/profile', { headers }),
        fetch('http://localhost:5000/api/v1/users/stats', { headers })
      ])
      const profile = await profileRes.json()
      const stats = await statsRes.json()
      
      const exportData = { profile: profile.data, stats: stats.data }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'careerlens-data-export.json'
      a.click()
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  return (
    <DashboardLayout>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <div className="settings__content">
        {/* Profile */}
        <section className="settings__section glass-card">
          <div className="settings__section-header"><User size={20} /><h2>Profile</h2></div>
          <div className="settings__profile">
            <div className="settings__avatar">{initials}</div>
            <div className="settings__profile-info" style={{ flex: 1 }}>
              {isEditingProfile ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--cl-outline)', background: 'var(--cl-surface)', color: 'var(--cl-on-surface)' }}
                  />
                  <button onClick={handleSaveProfile} style={{ color: 'var(--cl-success)', background: 'transparent' }}><Check size={18} /></button>
                  <button onClick={() => { setIsEditingProfile(false); setEditName(user.name); }} style={{ color: 'var(--cl-error)', background: 'transparent' }}><X size={18} /></button>
                </div>
              ) : (
                <>
                  <h3>{user.name}</h3>
                  <p className="settings__email">{user.email}</p>
                </>
              )}
            </div>
            {!isEditingProfile && (
              <button className="btn-secondary" onClick={() => setIsEditingProfile(true)} style={{ marginLeft: 'auto', padding: '8px 20px', fontSize: '0.85rem' }}>Edit Profile</button>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="settings__section glass-card">
          <div className="settings__section-header"><Bell size={20} /><h2>Notifications</h2></div>
          <div className="settings__toggles">
            <div className="settings__toggle-row">
              <div className="settings__toggle-info"><Mail size={18} /><div><strong>Email Notifications</strong><span>Receive updates about your account</span></div></div>
              <label className="settings__switch"><input type="checkbox" checked={notifs.email} onChange={() => setNotifs({...notifs, email: !notifs.email})} /><span className="settings__slider"></span></label>
            </div>
            <div className="settings__toggle-row">
              <div className="settings__toggle-info"><FileText size={18} /><div><strong>Analysis Complete</strong><span>Get notified when AI analysis is ready</span></div></div>
              <label className="settings__switch"><input type="checkbox" checked={notifs.analysis} onChange={() => setNotifs({...notifs, analysis: !notifs.analysis})} /><span className="settings__slider"></span></label>
            </div>
            <div className="settings__toggle-row">
              <div className="settings__toggle-info"><BarChart3 size={18} /><div><strong>Weekly Job Market Digest</strong><span>Curated insights on job market trends</span></div></div>
              <label className="settings__switch"><input type="checkbox" checked={notifs.digest} onChange={() => setNotifs({...notifs, digest: !notifs.digest})} /><span className="settings__slider"></span></label>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="settings__section glass-card">
          <div className="settings__section-header"><Moon size={20} /><h2>Appearance</h2></div>
          <div className="settings__theme">
            <button className={`settings__theme-btn ${darkMode ? 'settings__theme-btn--active' : ''}`} onClick={() => setDarkMode(true)}><Moon size={18} /> Dark Mode</button>
            <button className={`settings__theme-btn ${!darkMode ? 'settings__theme-btn--active' : ''}`} onClick={() => setDarkMode(false)}><Sun size={18} /> Light Mode</button>
          </div>
        </section>

        {/* Privacy */}
        <section className="settings__section glass-card">
          <div className="settings__section-header"><Shield size={20} /><h2>Privacy & Data</h2></div>
          <div className="settings__privacy">
            <div className="settings__privacy-info">
              <p>CareerLens is GDPR compliant. Your uploaded files are deleted from our servers after text extraction. No PII is sent to AI models beyond resume text.</p>
            </div>
            <div className="settings__privacy-actions">
              <button className="btn-secondary" onClick={handleExportData}><Download size={16} /> Export My Data</button>
              <button className="btn-danger"><Trash2 size={16} /> Delete Account</button>
            </div>
            <p className="settings__danger-text">Account deletion is permanent and cannot be undone. All your resumes, analyses, and cover letters will be erased.</p>
          </div>
        </section>

      </div>
    </DashboardLayout>
  )
}
