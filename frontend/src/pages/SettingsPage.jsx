import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { User, Bell, Shield, Link2, Moon, Sun, Download, Trash2, CheckCircle2, Mail, FileText, BarChart3 } from 'lucide-react'
import './SettingsPage.css'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifs, setNotifs] = useState({ email: true, analysis: true, digest: false })

  return (
    <DashboardLayout>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <div className="settings__content">
        {/* Profile */}
        <section className="settings__section glass-card">
          <div className="settings__section-header"><User size={20} /><h2>Profile</h2></div>
          <div className="settings__profile">
            <div className="settings__avatar">JD</div>
            <div className="settings__profile-info">
              <h3>John Doe</h3>
              <p className="settings__email">john.doe@gmail.com</p>
              <div className="badge badge-success"><CheckCircle2 size={12} /> Connected via Google</div>
            </div>
            <button className="btn-secondary" style={{ marginLeft: 'auto', padding: '8px 20px', fontSize: '0.85rem' }}>Edit Profile</button>
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
              <button className="btn-secondary"><Download size={16} /> Export My Data</button>
              <button className="btn-danger"><Trash2 size={16} /> Delete Account</button>
            </div>
            <p className="settings__danger-text">Account deletion is permanent and cannot be undone. All your resumes, analyses, and cover letters will be erased.</p>
          </div>
        </section>

        {/* Connected Services */}
        <section className="settings__section glass-card">
          <div className="settings__section-header"><Link2 size={20} /><h2>Connected Services</h2></div>
          <div className="settings__service">
            <div className="settings__service-info">
              <svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <div><strong>Google Account</strong><span>john.doe@gmail.com</span></div>
            </div>
            <div className="badge badge-success"><CheckCircle2 size={12} /> Connected</div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
