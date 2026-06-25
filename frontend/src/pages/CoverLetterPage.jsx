import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { Sparkles, RefreshCw, Copy, Download, Upload, FileText, X, Check, Loader2, ChevronDown, Plus } from 'lucide-react'
import './CoverLetterPage.css'

const API_BASE = 'http://localhost:5000'

const DEMO_LETTER = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Frontend Engineer position at Google. With over five years of experience building high-performance web applications using React, TypeScript, and modern CSS, I am confident in my ability to contribute meaningfully to your team's mission of organizing the world's information.

In my current role at TechCorp, I led a team of four developers in redesigning the company's flagship dashboard, resulting in a 40% improvement in page load times and a 25% increase in user engagement. I spearheaded the migration from a legacy jQuery codebase to a modern React architecture, implementing code splitting and lazy loading strategies that reduced bundle size by 60%. My experience with performance optimization, component architecture, and cross-functional collaboration aligns closely with the requirements outlined in your job posting.

I am particularly drawn to Google's commitment to web platform advancement and its contributions to open-source tools like Angular, Lit, and Chrome DevTools. I would welcome the opportunity to bring my passion for exceptional user experiences and technical excellence to your organization. Thank you for considering my application, and I look forward to discussing how my skills can benefit your team.

Sincerely,
John Doe`

export default function CoverLetterPage() {
  const location = useLocation()
  const { user } = useUser()
  // ─── State ───
  const [letter, setLetter] = useState(DEMO_LETTER)
  const [versions, setVersions] = useState([
    { id: 1, label: 'Demo Sample', date: 'May 22, 2026', content: DEMO_LETTER, jobTitle: 'Senior Frontend Engineer', company: 'Google' },
  ])
  const [activeVersion, setActiveVersion] = useState(1)
  const [copied, setCopied] = useState(false)
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const autoGenRef = useRef(false)

  // Generate form
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const { getToken } = useAuth()

  const getAuthHeaders = async () => {
    const token = await getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // Fetch latest user analysis if arriving directly
  useEffect(() => {
    getAuthHeaders().then(headers => {
      fetch(`${API_BASE}/api/v1/analyses`, { headers, credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.data?.analyses?.length > 0) {
            setLatestAnalysis(data.data.analyses[0])
          }
        }).catch(() => {})
    })
  }, [])

  // Auto generate if arriving from Results page
  useEffect(() => {
    if (location.state?.autoGenerate && !autoGenRef.current) {
      autoGenRef.current = true
      const rText = location.state.resumeText || ''
      const jDesc = location.state.jd || ''
      setResumeText(rText)
      setJobDescription(jDesc)
      
      if (rText && jDesc) {
        setIsGenerating(true)
        setError('')
        getAuthHeaders().then(headers => {
          fetch(`${API_BASE}/api/v1/coverletter/generate-direct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            credentials: 'include',
            body: JSON.stringify({
              resumeText: rText.trim(),
              jobDescription: jDesc.trim(),
              jobTitle: 'Target Role',
              company: 'Target Company'
            })
          }).then(res => res.json()).then(data => {
            if (data.data?.content) {
              const newContent = data.data.content
              const now = new Date()
              const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              const newVersion = {
                id: 1,
                label: 'AI Tailored Letter',
                date: dateStr,
                content: newContent,
                jobTitle: 'Target Role',
                company: 'Target Company'
              }
              setVersions([newVersion])
              setActiveVersion(1)
              setLetter(newContent)
            }
          }).catch(err => setError(err.message)).finally(() => setIsGenerating(false))
        })
      }
    }
  }, [location.state])

  const handleGenerateFromLatest = () => {
    if (!latestAnalysis) return
    const rText = latestAnalysis.resumeText || ''
    const jDesc = latestAnalysis.jobDescription || ''
    setResumeText(rText)
    setJobDescription(jDesc)
    setIsGenerating(true)
    setError('')
    getAuthHeaders().then(headers => {
      fetch(`${API_BASE}/api/v1/coverletter/generate-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        credentials: 'include',
        body: JSON.stringify({
          resumeText: rText.trim(),
          jobDescription: jDesc.trim(),
          jobTitle: latestAnalysis.jobTitle || 'Target Position',
          company: latestAnalysis.companyName || 'Target Company'
        })
      }).then(res => res.json()).then(data => {
        if (data.data?.content) {
          const newContent = data.data.content
          const now = new Date()
          const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          const newVersion = {
            id: 1,
            label: 'AI Tailored Letter',
            date: dateStr,
            content: newContent,
            jobTitle: latestAnalysis.jobTitle || 'Target Position',
            company: latestAnalysis.companyName || 'Target Company'
          }
          setVersions([newVersion])
          setActiveVersion(1)
          setLetter(newContent)
        }
      }).catch(err => setError(err.message)).finally(() => setIsGenerating(false))
    })
  }

  // ─── Upload & Extract Resume Text ───
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeFile(file)
    setError('')
    setIsExtracting(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      const authHeaders = await getAuthHeaders()

      const res = await fetch(`${API_BASE}/api/v1/resumes/extract-text`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Failed to extract text')
      setResumeText(data.data.text)
    } catch (err) {
      setError(`File extraction failed: ${err.message}`)
      setResumeFile(null)
    } finally {
      setIsExtracting(false)
    }
  }

  // ─── Generate Cover Letter ───
  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      setError('Please upload a resume first.')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.')
      return
    }
    setError('')
    setIsGenerating(true)

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/v1/coverletter/generate-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim(),
          company: company.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Generation failed')

      const newContent = data.data.content
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const newVersion = {
        id: versions.length + 1,
        label: `Version ${versions.length + 1}`,
        date: dateStr,
        content: newContent,
        jobTitle: jobTitle.trim() || 'Untitled',
        company: company.trim() || 'Unknown',
      }

      setVersions(prev => [newVersion, ...prev])
      setActiveVersion(newVersion.id)
      setLetter(newContent)
      setShowGenerateForm(false)
      // Reset form
      setResumeFile(null)
      setResumeText('')
      setJobDescription('')
      setJobTitle('')
      setCompany('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // ─── Regenerate (same inputs) ───
  const handleRegenerate = async () => {
    const current = versions.find(v => v.id === activeVersion)
    if (!resumeText && !current) {
      setShowGenerateForm(true)
      return
    }
    // If we have stored resumeText, regenerate
    if (!resumeText) {
      setShowGenerateForm(true)
      return
    }
    setIsGenerating(true)
    setError('')

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/v1/coverletter/generate-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || 'General position',
          jobTitle: jobTitle.trim(),
          company: company.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Regeneration failed')

      const newContent = data.data.content
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const newVersion = {
        id: versions.length + 1,
        label: `Version ${versions.length + 1}`,
        date: dateStr,
        content: newContent,
        jobTitle: jobTitle.trim() || 'Untitled',
        company: company.trim() || 'Unknown',
      }

      setVersions(prev => [newVersion, ...prev])
      setActiveVersion(newVersion.id)
      setLetter(newContent)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // ─── Copy ───
  const handleCopy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Download PDF ───
  const handleDownloadPDF = () => {
    const current = versions.find(v => v.id === activeVersion)
    const title = current ? `Cover_Letter_${current.company}_${current.jobTitle}` : 'Cover_Letter'
    const cleanTitle = title.replace(/[^a-zA-Z0-9_]/g, '_')

    // Create a printable HTML document and trigger browser print-to-PDF
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      // Fallback: download as TXT
      const blob = new Blob([letter], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cleanTitle}.txt`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    const paragraphs = letter.split('\n\n').map(p => `<p style="margin-bottom:12px;line-height:1.7;text-align:justify;">${p.replace(/\n/g, '<br/>')}</p>`).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cleanTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Georgia&display=swap');
          body { font-family: Georgia, 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 40px; color: #222; font-size: 13pt; line-height: 1.7; }
          h1 { font-size: 18pt; margin-bottom: 4px; }
          .contact { font-size: 10pt; color: #666; margin-bottom: 20px; }
          .date { font-size: 11pt; color: #666; margin-bottom: 24px; }
          hr { border: none; border-top: 2px solid #333; margin-bottom: 16px; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${user?.fullName || location.state?.fileName?.split('.')[0] || 'Candidate Name'}</h1>
        <div class="contact">${user?.primaryEmailAddress?.emailAddress || 'candidate@careerlens.ai'} · Screened Candidate</div>
        <hr />
        <div class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        ${paragraphs}
      </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 500)
  }

  // ─── Switch versions ───
  const handleVersionSwitch = (versionId) => {
    setActiveVersion(versionId)
    const v = versions.find(ver => ver.id === versionId)
    if (v) setLetter(v.content)
  }

  const currentVersion = versions.find(v => v.id === activeVersion)

  return (
    <DashboardLayout>
      <TopBar title="Cover Letter Editor" subtitle="AI-generated and fully editable" />
      <div className="cl__content">
        {/* Prominent Demo Sample Alert Banner */}
        {versions.length === 1 && versions[0].company === 'Google' && (
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(108,92,231,0.25), rgba(0,184,148,0.15))', border: '1px solid var(--cl-secondary)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Sparkles style={{ color: 'var(--cl-warning)' }} /> You are currently viewing the default demo sample letter!
              </h3>
              <p style={{ color: 'var(--cl-on-surface-variant)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
                Click below to instantly generate a personalized cover letter using your latest analyzed resume and job posting.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {latestAnalysis ? (
                <button className="btn-primary" style={{ background: 'var(--cl-secondary)', color: '#0f172a', fontWeight: 800, padding: '10px 20px' }} onClick={handleGenerateFromLatest} disabled={isGenerating}>
                  {isGenerating ? <><Loader2 className="spin" size={18} /> Generating AI Letter...</> : <><Sparkles size={18} /> Auto-Generate From Screened Resume</>}
                </button>
              ) : (
                <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => setShowGenerateForm(true)}>
                  <Upload size={18} /> Upload Resume & Generate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Version Tabs + New Button */}
        <div className="cl__versions">
          {versions.map(v => (
            <button
              key={v.id}
              className={`cl__version-tab ${activeVersion === v.id ? 'cl__version-tab--active' : ''}`}
              onClick={() => handleVersionSwitch(v.id)}
            >
              {v.label} <span className="cl__version-date">{v.date}</span>
            </button>
          ))}
          <button
            className="cl__new-btn"
            onClick={() => setShowGenerateForm(true)}
            title="Generate new cover letter"
          >
            <Plus size={16} /> New
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="cl__error">
            {error}
            <button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

        {/* Generate Form Modal */}
        {showGenerateForm && (
          <div className="modal-overlay" onClick={() => !isGenerating && setShowGenerateForm(false)}>
            <div className="cl__generate-modal glass-card-strong" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2><Sparkles size={20} style={{ color: 'var(--cl-primary-light)' }} /> Generate Cover Letter</h2>
                <button className="modal-close" onClick={() => !isGenerating && setShowGenerateForm(false)}><X size={20} /></button>
              </div>

              <div className="cl__gen-form">
                {/* Resume Upload */}
                <div className="cl__gen-field">
                  <label>Resume (PDF, DOCX, or TXT) *</label>
                  <div
                    className={`cl__dropzone ${resumeFile ? 'cl__dropzone--filled' : ''} ${isExtracting ? 'cl__dropzone--loading' : ''}`}
                    onClick={() => !isExtracting && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    {isExtracting ? (
                      <>
                        <Loader2 size={24} className="cl__spinner" />
                        <span>Extracting text...</span>
                      </>
                    ) : resumeFile ? (
                      <>
                        <FileText size={24} style={{ color: 'var(--cl-secondary)' }} />
                        <span>{resumeFile.name}</span>
                        <span className="cl__dropzone-hint">{resumeText.length} characters extracted</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span>Click to upload your resume</span>
                        <span className="cl__dropzone-hint">PDF, DOCX, or TXT (max 5MB)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Job Info */}
                <div className="modal-row">
                  <div className="cl__gen-field">
                    <label htmlFor="gen-title">Job Title</label>
                    <input id="gen-title" type="text" placeholder="e.g. Frontend Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                  </div>
                  <div className="cl__gen-field">
                    <label htmlFor="gen-company">Company</label>
                    <input id="gen-company" type="text" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} />
                  </div>
                </div>

                {/* Job Description */}
                <div className="cl__gen-field">
                  <label htmlFor="gen-jd">Job Description *</label>
                  <textarea
                    id="gen-jd"
                    rows="6"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowGenerateForm(false)} disabled={isGenerating}>Cancel</button>
                  <button className="btn-primary cl__gen-submit" onClick={handleGenerate} disabled={isGenerating || isExtracting || !resumeText || !jobDescription.trim()}>
                    {isGenerating ? (
                      <><Loader2 size={16} className="cl__spinner" /> Generating...</>
                    ) : (
                      <><Sparkles size={16} /> Generate Cover Letter</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cl__body">
          {/* Editor */}
          <div className="cl__editor-panel">
            {currentVersion && (
              <div className="cl__context glass-card">
                <div className="cl__context-info">
                  <Sparkles size={16} style={{ color: 'var(--cl-primary-light)' }} />
                  <span>For: <strong>{currentVersion.jobTitle}</strong> at <strong>{currentVersion.company}</strong></span>
                </div>
              </div>
            )}

            <div className="cl__editor glass-card-strong">
              <textarea
                className="cl__textarea"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                id="cover-letter-editor"
                placeholder="Your cover letter will appear here..."
              />
            </div>

            <div className="cl__actions">
              <button className="btn-secondary" onClick={handleRegenerate} disabled={isGenerating}>
                {isGenerating ? <><Loader2 size={16} className="cl__spinner" /> Regenerating...</> : <><RefreshCw size={16} /> Regenerate</>}
              </button>
              <button className="btn-secondary" onClick={handleCopy}>
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
              </button>
              <button className="btn-primary" onClick={handleDownloadPDF}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="cl__preview-panel">
            <h3 className="cl__preview-title">Document Preview</h3>
            <div className="cl__preview-doc">
              <div className="cl__preview-header-bar">
                <div className="cl__preview-name">{user?.fullName || location.state?.fileName?.split('.')[0] || 'Candidate Name'}</div>
                <div className="cl__preview-contact">{user?.primaryEmailAddress?.emailAddress || 'candidate@careerlens.ai'} · Verified Applicant</div>
              </div>
              <div className="cl__preview-date">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="cl__preview-body">
                {letter.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
