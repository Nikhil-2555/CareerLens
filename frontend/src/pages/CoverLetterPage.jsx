import { useState, useRef } from 'react'
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
  // ─── State ───
  const [letter, setLetter] = useState(DEMO_LETTER)
  const [versions, setVersions] = useState([
    { id: 1, label: 'Version 1', date: 'May 22, 2026', content: DEMO_LETTER, jobTitle: 'Senior Frontend Engineer', company: 'Google' },
  ])
  const [activeVersion, setActiveVersion] = useState(1)
  const [copied, setCopied] = useState(false)

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
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

      const res = await fetch(`${API_BASE}/api/v1/resumes/extract-text`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE}/api/v1/coverletter/generate-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
      const res = await fetch(`${API_BASE}/api/v1/coverletter/generate-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
        <h1>John Doe</h1>
        <div class="contact">john.doe@gmail.com · (555) 123-4567</div>
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
                <div className="cl__preview-name">John Doe</div>
                <div className="cl__preview-contact">john.doe@gmail.com · (555) 123-4567</div>
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
