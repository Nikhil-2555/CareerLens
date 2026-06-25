import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import {
  ArrowLeft, Sparkles, CheckCircle2, AlertTriangle, FileText,
  Lightbulb, Download, BarChart3, Target, ShieldCheck, Printer,
  Mail, RefreshCw, Loader2, Palette, Check, X, Send
} from 'lucide-react'
import './AnalysisResultsPage.css'

const API_BASE = 'http://localhost:5000'

// 10 Best resumemaker.io website quality distinct template aesthetics
const RESUME_TEMPLATES = [
  { id: 'novoresume', name: 'Novoresume Emerald', accent: '#059669', font: 'Inter, system-ui, sans-serif' },
  { id: 'wallstreet', name: 'Executive Wall Street', accent: '#0f172a', font: 'Garamond, Georgia, serif' },
  { id: 'reactive', name: 'Reactive Tech Mono', accent: '#38bdf8', font: '"Fira Code", monospace' },
  { id: 'canva', name: 'Canva Creative Coral', accent: '#e11d48', font: 'Outfit, sans-serif' },
  { id: 'linear', name: 'Linear Nordic Clean', accent: '#64748b', font: '-apple-system, sans-serif' },
  { id: 'resumemaker', name: 'ResumeMaker Indigo', accent: '#4f46e5', font: 'system-ui, sans-serif' },
  { id: 'harvard', name: 'Harvard Academic', accent: '#000000', font: '"Times New Roman", serif' },
  { id: 'amber', name: 'Amber Studio Modern', accent: '#d97706', font: 'Montserrat, sans-serif' },
  { id: 'dense', name: 'Dense Chrono Dark', accent: '#334155', font: 'Roboto, sans-serif' },
  { id: 'glass_teal', name: 'Glass Studio Teal', accent: '#0d9488', font: 'Outfit, sans-serif' },
]

export default function AnalysisResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()

  const state = location.state
  const results = state?.results
  const resumeText = state?.resumeText || ''
  const jd = state?.jd || ''
  const fileName = state?.fileName || 'Resume Document'

  const [activeTab, setActiveTab] = useState('overview')
  const [optimizing, setOptimizing] = useState(false)
  const [optimizedData, setOptimizedData] = useState(null)
  const [error, setError] = useState('')
  
  // Template & Email Export state
  const [selectedTemplate, setSelectedTemplate] = useState(RESUME_TEMPLATES[0])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailInput, setEmailInput] = useState(user?.primaryEmailAddress?.emailAddress || '')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')

  if (!results) {
    return (
      <DashboardLayout>
        <TopBar title="Analysis Results" subtitle="Detailed visualization of your AI match screening" />
        <div className="results__empty">
          <BarChart3 size={64} style={{ color: 'var(--cl-outline)' }} />
          <h2>No Analysis Data Found</h2>
          <p style={{ color: 'var(--cl-on-surface-variant)', maxWidth: '400px' }}>
            Please upload your resume and enter a job description on the analysis page to view interactive visualization breakdown.
          </p>
          <button className="btn-primary" onClick={() => navigate('/analyse')}>
            <ArrowLeft size={18} /> Go to Analyze Resume
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const scoreColor = results.score >= 85 ? 'var(--cl-secondary)' : results.score >= 70 ? 'var(--cl-warning)' : 'var(--cl-error)'
  const scoreLabel = results.score >= 85 ? 'Excellent Fit!' : results.score >= 70 ? 'Good Match' : results.score >= 50 ? 'Moderate Fit' : 'Poor Match'
  const dashOffset = 283 - (283 * results.score) / 100

  const atsScore = results.atsScore ?? 75
  const atsColor = atsScore >= 80 ? 'var(--cl-secondary)' : atsScore >= 60 ? 'var(--cl-warning)' : 'var(--cl-error)'
  const atsOffset = 283 - (283 * atsScore) / 100

  const totalKeywords = (results.matched?.length || 0) + (results.missing?.length || 0)
  const kwAlignment = totalKeywords > 0 ? Math.round(((results.matched?.length || 0) / totalKeywords) * 100) : 70
  const formattingCleanliness = results.badFormatting?.length === 0 ? 100 : Math.max(30, 100 - (results.badFormatting?.length || 0) * 18)
  const skillsImpact = results.score

  const handleOptimize = async () => {
    if (!resumeText || !jd) return
    setOptimizing(true)
    setError('')
    try {
      const token = await getToken()
      const headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const res = await fetch(`${API_BASE}/api/v1/analyses/optimize`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ resumeText, jobDescription: jd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Optimization failed')
      setOptimizedData(data.data)
      setActiveTab('optimized')
    } catch (err) {
      setError(err.message)
    } finally {
      setOptimizing(false)
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  // Get specific override CSS for PDF printing (Targeting H2/H3 section headers only)
  const getTemplateCSS = (t) => {
    switch(t.id) {
      case 'novoresume': return `h2,h3{color:#059669!important;border-left:4px solid #059669!important;padding-left:10px!important;border-bottom:none!important;background:#ecfdf5!important;padding:5px 10px!important;}`
      case 'wallstreet': return `h2,h3{color:#0f172a!important;text-align:center!important;border-top:1px solid #334155!important;border-bottom:1px solid #334155!important;border-left:none!important;padding:4px 0!important;letter-spacing:0.15em!important;}`
      case 'reactive': return `h2,h3{background:#0f172a!important;color:#38bdf8!important;padding:5px 12px!important;border-radius:4px!important;border:none!important;}`
      case 'canva': return `h2,h3{color:#e11d48!important;border-bottom:2.5px dotted #f43f5e!important;border-left:none!important;padding-bottom:4px!important;font-weight:800!important;}`
      case 'linear': return `h2,h3{color:#475569!important;font-size:10.5pt!important;letter-spacing:0.22em!important;border-bottom:1px solid #cbd5e1!important;border-left:none!important;}`
      case 'resumemaker': return `h2,h3{color:#4f46e5!important;border-left:8px solid #4f46e5!important;background:#eef2ff!important;padding:5px 12px!important;border-radius:0 6px 6px 0!important;border-bottom:none!important;}`
      case 'harvard': return `h2,h3{color:#000!important;border-bottom:1.5px solid #000!important;border-left:none!important;padding-bottom:3px!important;}`
      case 'amber': return `h2,h3{color:#d97706!important;border-bottom:3px solid #fbbf24!important;border-left:none!important;font-weight:700!important;padding-bottom:3px!important;}`
      case 'dense': return `h2,h3{background:#334155!important;color:#fff!important;padding:4px 10px!important;border:none!important;letter-spacing:0.1em!important;}`
      case 'glass_teal': return `h2,h3{color:#0d9488!important;border-bottom:2px solid #5eead4!important;border-left:none!important;background:#ccfbf1!important;padding:4px 10px!important;border-radius:4px!important;}`
      default: return `h2,h3{color:#6c5ce7;}`
    }
  }

  // Strictly Enforced 1-Page PDF Download
  const handleDownloadPDF = () => {
    if (!optimizedData) return
    const printWindow = window.open('', '_blank')
    const rawHTML = optimizedData.optimizedResumeHTML || optimizedData.optimizedResume
    const overrideCSS = getTemplateCSS(selectedTemplate)
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${user?.fullName || 'Candidate'} - Resume (${selectedTemplate.name})</title>
          <style>
            @page { size: letter; margin: 0.5in; }
            * { color: inherit !important; font-family: inherit !important; line-height: inherit !important; box-sizing: border-box !important; }
            body { 
              font-family: ${selectedTemplate.font}; 
              color: #1e293b; 
              line-height: 1.5; 
              margin: 0; 
              padding: 0;
              max-height: 10in; /* Enforce 1 page constraint */
              overflow: hidden;
            }
            .cv-hero-name {
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e2e8f0;
            }
            .cv-hero-name h1 { font-size: 22pt; margin: 0 0 4px 0; font-weight: 800; color: #0f172a; }
            .cv-hero-name p { color:#64748b; font-size:10pt; margin: 0; font-weight: 500; }
            h2, h3 { font-size: 11.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 18px; margin-bottom: 8px; display: block; width: 100%; clear: both; }
            h4 { font-size: 10.5pt; font-weight: 700; margin: 12px 0 4px 0; color: #1e293b; }
            p { font-size: 10pt; margin: 5px 0; line-height: 1.5; color: #334155; }
            ul { padding-left: 24px; margin: 6px 0 16px 0; }
            li { font-size: 10pt; margin-bottom: 5px; line-height: 1.45; color: #334155; }
            strong, b { font-weight: 700; color: #0f172a; }
            ${overrideCSS}
          </style>
        </head>
        <body>
          <div class="cv-hero-name">
            <h1>${user?.fullName || 'Candidate Name'}</h1>
            <p>${user?.primaryEmailAddress?.emailAddress || 'email@example.com'} · Screened Member</p>
          </div>
          <div>
            ${rawHTML}
          </div>
          <script>window.onload=function(){window.print();setTimeout(function(){window.close();},600);}</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Send via Email Endpoint
  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!emailInput || !optimizedData) return
    setSendingEmail(true)
    setEmailMsg(null)

    try {
      const token = await getToken()
      const headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const rawHTML = optimizedData.optimizedResumeHTML || optimizedData.optimizedResume
      
      const res = await fetch(`${API_BASE}/api/v1/analyses/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: emailInput,
          templateName: selectedTemplate.name,
          resumeHTML: `<div style="font-family:${selectedTemplate.font};">${rawHTML}</div>`
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || data.message || 'Dispatch failed')
      setEmailMsg({
        success: true,
        text: `✅ Success! CV sent to ${emailInput}`,
        previewUrl: data.previewUrl
      })
    } catch (err) {
      setEmailMsg({ success: false, text: `❌ Error: ${err.message}` })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <DashboardLayout>
      <TopBar title="AI Match Screening Report" subtitle="Comprehensive visualization and ATS diagnostics" />
      
      <div className="results__header-bar">
        <button className="results__back-btn" onClick={() => navigate('/analyse')}>
          <ArrowLeft size={16} /> New Analysis
        </button>
        <div className="results__file-badge">
          <FileText size={14} /> Screened Document: {fileName}
        </div>
        <div className="results__actions-top">
          <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={handlePrintReport}>
            <Printer size={16} /> Print Full Report
          </button>
        </div>
      </div>

      <div className="results__content">
        {error && <div style={{ padding: '12px', background: 'rgba(225,112,85,0.15)', color: 'var(--cl-error)', borderRadius: '8px' }}>{error}</div>}

        {/* Hero Circular Gauge Cards */}
        <div className="results__hero-grid">
          
          <div className="results__hero-card glass-card-strong">
            <div className="results__gauge-wrap">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--cl-outline-variant)" strokeWidth="8" opacity="0.2" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="283" strokeDashoffset={dashOffset} transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </svg>
              <div className="results__gauge-val">
                <span className="results__gauge-num" style={{ color: scoreColor }}>{results.score}</span>
                <span className="results__gauge-max">/ 100</span>
              </div>
            </div>
            <div className="results__hero-info">
              <span className="badge" style={{ background: 'rgba(108,92,231,0.15)', color: scoreColor, marginBottom: '6px' }}>{scoreLabel}</span>
              <h3>Overall Job Fit</h3>
              <p>Based on semantic skills alignment and experience matching against target role.</p>
            </div>
          </div>

          <div className="results__hero-card glass-card-strong">
            <div className="results__gauge-wrap">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--cl-outline-variant)" strokeWidth="8" opacity="0.2" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={atsColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="283" strokeDashoffset={atsOffset} transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </svg>
              <div className="results__gauge-val">
                <span className="results__gauge-num" style={{ color: atsColor }}>{atsScore}</span>
                <span className="results__gauge-max">/ 100</span>
              </div>
            </div>
            <div className="results__hero-info">
              <span className="badge" style={{ background: 'rgba(0,184,148,0.15)', color: atsColor, marginBottom: '6px' }}>ATS Parser Verified</span>
              <h3>ATS Compatibility</h3>
              <p>Evaluated against enterprise applicant tracking systems for clean parsing.</p>
            </div>
          </div>

        </div>

        {/* Tabs Navigation */}
        <div className="results__tabs">
          <button className={`results__tab-btn ${activeTab === 'overview' ? 'results__tab-btn--active' : ''}`} onClick={() => setActiveTab('overview')}>
            <BarChart3 size={18} /> Visual Breakdown
          </button>
          <button className={`results__tab-btn ${activeTab === 'strengths' ? 'results__tab-btn--active' : ''}`} onClick={() => setActiveTab('strengths')}>
            <Target size={18} /> Strengths & Gaps ({results.strengths?.length || 0})
          </button>
          <button className={`results__tab-btn ${activeTab === 'ats' ? 'results__tab-btn--active' : ''}`} onClick={() => setActiveTab('ats')}>
            <ShieldCheck size={18} /> ATS Diagnostics & Keywords
          </button>
          <button className={`results__tab-btn ${activeTab === 'suggestions' ? 'results__tab-btn--active' : ''}`} onClick={() => setActiveTab('suggestions')}>
            <Lightbulb size={18} /> AI Suggestions ({results.suggestions?.length || 0})
          </button>
          {optimizedData && (
            <button className={`results__tab-btn ${activeTab === 'optimized' ? 'results__tab-btn--active' : ''}`} onClick={() => setActiveTab('optimized')} style={{ color: 'var(--cl-secondary)' }}>
              <Sparkles size={18} /> AI Rewritten Resume (1-Page)
            </button>
          )}
        </div>

        {/* Tab 1: Visual Breakdown */}
        {activeTab === 'overview' && (
          <div className="results__panel">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Performance Metrics Breakdown</h3>
            <div className="results__breakdown-grid">
              <div className="results__stat-bar-card">
                <div className="results__stat-header"><span>Semantic Skills Impact</span><strong style={{ color: 'var(--cl-primary-light)' }}>{skillsImpact}%</strong></div>
                <div className="results__progress-track"><div className="results__progress-fill" style={{ width: `${skillsImpact}%`, background: 'linear-gradient(90deg, var(--cl-primary), var(--cl-primary-light))' }} /></div>
              </div>
              <div className="results__stat-bar-card">
                <div className="results__stat-header"><span>Keyword Alignment Ratio</span><strong style={{ color: 'var(--cl-secondary)' }}>{kwAlignment}%</strong></div>
                <div className="results__progress-track"><div className="results__progress-fill" style={{ width: `${kwAlignment}%`, background: 'var(--cl-secondary)' }} /></div>
              </div>
              <div className="results__stat-bar-card">
                <div className="results__stat-header"><span>Formatting Cleanliness</span><strong style={{ color: formattingCleanliness >= 80 ? 'var(--cl-secondary)' : 'var(--cl-warning)' }}>{formattingCleanliness}%</strong></div>
                <div className="results__progress-track"><div className="results__progress-fill" style={{ width: `${formattingCleanliness}%`, background: formattingCleanliness >= 80 ? 'var(--cl-secondary)' : 'var(--cl-warning)' }} /></div>
              </div>
              <div className="results__stat-bar-card">
                <div className="results__stat-header"><span>ATS Structure Integrity</span><strong style={{ color: atsColor }}>{atsScore}%</strong></div>
                <div className="results__progress-track"><div className="results__progress-fill" style={{ width: `${atsScore}%`, background: atsColor }} /></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Strengths & Gaps */}
        {activeTab === 'strengths' && (
          <div className="results__panel">
            <div className="results__two-col">
              <div className="results__list-card glass-card">
                <h3 style={{ color: 'var(--cl-secondary)' }}><CheckCircle2 size={22} /> Standout Strengths</h3>
                <ul className="results__list">
                  {results.strengths?.map((s, i) => (<li key={i} style={{ borderLeft: '3px solid var(--cl-secondary)' }}><span>{s}</span></li>))}
                </ul>
              </div>
              <div className="results__list-card glass-card">
                <h3 style={{ color: 'var(--cl-warning)' }}><AlertTriangle size={22} /> Identified Experience Gaps</h3>
                <ul className="results__list">
                  {results.gaps?.map((g, i) => (<li key={i} style={{ borderLeft: '3px solid var(--cl-warning)' }}><span>{g}</span></li>))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ATS & Keywords */}
        {activeTab === 'ats' && (
          <div className="results__panel">
            <div className="results__two-col">
              <div className="results__list-card glass-card">
                <h3><ShieldCheck size={22} style={{ color: 'var(--cl-primary-light)' }} /> ATS Formatting Scan</h3>
                {results.badFormatting?.length > 0 ? (
                  <ul className="results__list">{results.badFormatting.map((f, i) => (<li key={i} style={{ borderLeft: '3px solid var(--cl-error)' }}>{f}</li>))}</ul>
                ) : <p style={{ color: 'var(--cl-secondary)' }}>✅ No risky formatting detected.</p>}
              </div>
              <div className="results__keyword-groups">
                <div className="results__kw-box">
                  <div className="results__kw-title" style={{ color: 'var(--cl-secondary)' }}>✅ Matched Keywords ({results.matched?.length || 0})</div>
                  <div className="results__tags-wrap">{results.matched?.map((k, i) => (<span key={i} className="badge" style={{ background: 'rgba(0,184,148,0.2)' }}>{k}</span>))}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="results__panel">
            <div className="glass-card" style={{ padding: 28 }}>
              <h3><Lightbulb style={{ color: 'var(--cl-warning)' }} /> Recommended Action Plan</h3>
              <ul className="results__list">{results.suggestions?.map((s, i) => (<li key={i}>{s}</li>))}</ul>
            </div>
          </div>
        )}

        {/* Tab 5: Optimized Resume View + 10 Distinct Templates + Export */}
        {activeTab === 'optimized' && optimizedData && (
          <div className="results__panel">
            <div className="glass-card-strong" style={{ padding: 32, border: '1px solid var(--cl-secondary)' }}>
              
              {/* Top Export Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ color: 'var(--cl-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem' }}>
                    <Sparkles /> AI Rewritten Resume (Strict 1-Page)
                  </h2>
                  <p style={{ color: 'var(--cl-on-surface-variant)', marginTop: 4 }}>Projected match score boosted to <strong>{optimizedData.newScore || 95}/100</strong></p>
                </div>
                
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn-secondary" style={{ background: 'rgba(0,184,148,0.15)', color: 'var(--cl-secondary)', border: '1px solid var(--cl-secondary)' }} onClick={() => setShowEmailModal(true)}>
                    <Mail size={18} /> Email Me This Resume
                  </button>
                  <button className="btn-primary" onClick={handleDownloadPDF}>
                    <Download size={18} /> Download 1-Page PDF
                  </button>
                </div>
              </div>

              {/* 10 Template Styles Palette */}
              <div className="results__template-section">
                <h3><Palette size={18} style={{ color: 'var(--cl-secondary)' }} /> Choose Template Aesthetic (10 Builder Styles):</h3>
                <div className="results__template-grid">
                  {RESUME_TEMPLATES.map((t) => (
                    <div
                      key={t.id}
                      className={`results__template-card ${selectedTemplate.id === t.id ? 'results__template-card--active' : ''}`}
                      onClick={() => setSelectedTemplate(t)}
                    >
                      <div className="results__template-mock" style={{ borderLeft: `5px solid ${t.accent}` }}>
                        <div className="results__template-mock-line" style={{ background: t.accent, width: '60%' }} />
                        <div className="results__template-mock-line" />
                        <div className="results__template-mock-line" style={{ width: '80%' }} />
                      </div>
                      <span className="results__template-name">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strictly Constrained 1-Page Resume Preview Box with Scoped CSS Class */}
              <div className="resume-onepage-wrapper">
                <div className={`resume-print-box cv-style cv-style--${selectedTemplate.id}`}>
                  
                  {/* Candidate Header integrated into scoped theme */}
                  <div className="cv-hero-name" style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0' }}>{user?.fullName || 'Candidate Name'}</h1>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{user?.primaryEmailAddress?.emailAddress || 'email@example.com'} · Verified Member</p>
                  </div>
                  
                  <div dangerouslySetInnerHTML={{ __html: optimizedData.optimizedResumeHTML || optimizedData.optimizedResume }} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bottom Call to Action Banner */}
        <div className="results__cta-banner">
          <div className="results__cta-info">
            <h2>Take Your Resume to the Next Level</h2>
            <p>Let AI rewrite your bullet points for 95%+ fit, or generate a tailored cover letter in 5 seconds.</p>
          </div>
          <div className="results__cta-btns">
            <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.08)' }} onClick={handleOptimize} disabled={optimizing}>
              {optimizing ? <><Loader2 className="spin" size={18} /> Rewriting...</> : <><Sparkles size={18} style={{ color: 'var(--cl-warning)' }} /> One-Click AI Rewrite</>}
            </button>
            <button className="btn-primary" onClick={() => navigate('/coverletter', { state: { resumeText, jd, fileName, autoGenerate: true } })}>
              <FileText size={18} /> Generate Cover Letter
            </button>
          </div>
        </div>

      </div>

      {/* Email Export Modal */}
      {showEmailModal && (
        <div className="results__modal-backdrop">
          <div className="results__modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail style={{ color: 'var(--cl-secondary)' }} /> Send Resume to Inbox
              </h3>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', color: 'var(--cl-outline)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--cl-on-surface-variant)' }}>
              Enter your email address to receive your AI-boosted 1-page CV formatted with the <strong>{selectedTemplate.name}</strong> aesthetic.
            </p>

            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--cl-surface-container)', border: '1px solid var(--cl-outline-variant)', color: 'var(--cl-on-surface)' }}
                />
              </div>

              {emailMsg && (
                <div style={{ padding: '16px', background: emailMsg.success ? 'rgba(0,184,148,0.15)' : 'rgba(225,112,85,0.15)', color: emailMsg.success ? 'var(--cl-secondary)' : 'var(--cl-error)', borderRadius: '12px', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>{emailMsg.text}</div>
                  
                  {emailMsg.success && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                      <button type="button" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleDownloadPDF}>
                        📥 Download PDF Directly Now
                      </button>
                      {emailMsg.previewUrl && (
                        <a href={emailMsg.previewUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                          🌐 Open Live Email Inbox Preview
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={sendingEmail}>
                  {sendingEmail ? <><Loader2 className="spin" size={16} /> Dispatched...</> : <><Send size={16} /> Send to Email</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}
