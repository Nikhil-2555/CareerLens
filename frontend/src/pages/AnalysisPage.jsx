import { useState, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import {
  Upload, FileText, Sparkles, CheckCircle2, X, Loader2,
  ShieldCheck, BarChart3, Target, Zap, ArrowRight
} from 'lucide-react'
import './AnalysisPage.css'

const API_BASE = 'http://localhost:5000'

export default function AnalysisPage() {
  const [jd, setJd] = useState('')
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const getAuthHeaders = async () => {
    const token = await getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // ─── Upload & Extract Resume Text ───
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setError('')
    setIsExtracting(true)

    try {
      const formData = new FormData()
      formData.append('resume', selectedFile)
      const authHeaders = await getAuthHeaders()

      const res = await fetch(`${API_BASE}/api/v1/resumes/extract-text`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Failed to extract text from resume')
      setResumeText(data.data.text)
    } catch (err) {
      setError(`Resume extraction failed: ${err.message}`)
      setFile(null)
      setResumeText('')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  const handleBrowse = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFileSelect(f)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setResumeText('')
  }

  // ─── Analyze with real Groq AI & Navigate to Results Page ───
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jd.trim()) return
    setAnalyzing(true)
    setError('')

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/v1/analyses/analyze-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jd.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Analysis failed')

      const calculatedResults = {
        score: data.data.score,
        strengths: data.data.strengths || [],
        gaps: data.data.gaps || [],
        matched: data.data.matchedKeywords || [],
        missing: data.data.missingKeywords || [],
        suggestions: data.data.suggestions || [],
        atsScore: data.data.atsScore ?? 75,
        badFormatting: data.data.badFormatting || [],
        atsRecommendations: data.data.atsRecommendations || [],
      }

      // Navigate to dedicated visualization results page
      navigate('/analysis-results', {
        state: {
          results: calculatedResults,
          resumeText: resumeText.trim(),
          jd: jd.trim(),
          fileName: file?.name || 'Uploaded CV',
        }
      })
    } catch (err) {
      setError(`Analysis failed: ${err.message}`)
      setAnalyzing(false)
    }
  }

  return (
    <DashboardLayout>
      <TopBar title="Resume Analysis" subtitle="Upload your resume and paste a job description for AI analysis" />
      
      <div className="analysis__content">
        {analyzing ? (
          <div className="analysis__loading glass-card-strong" style={{ gridColumn: '1 / -1', minHeight: '480px' }}>
            <div className="analysis__loading-spinner"><Loader2 size={56} /></div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '16px' }}>Screening Resume & ATS Compatibility...</h2>
            <p style={{ maxWidth: '480px', color: 'var(--cl-on-surface-variant)', lineHeight: 1.6, textAlign: 'center' }}>
              Our Llama 3 semantic engine is evaluating your experience against the role requirements and diagnosing enterprise ATS formatting compliance.
            </p>
            <div className="analysis__loading-bar" style={{ width: '280px', marginTop: '16px' }}>
              <div className="analysis__loading-fill"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Left: Inputs */}
            <div className="analysis__left">
              {error && (
                <div className="analysis__error">
                  <span>{error}</span>
                  <button onClick={() => setError('')}><X size={14} /></button>
                </div>
              )}

              <div className={`analysis__dropzone glass-card ${dragOver ? 'analysis__dropzone--active' : ''} ${file ? 'analysis__dropzone--has-file' : ''} ${isExtracting ? 'analysis__dropzone--loading' : ''}`}
                onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
              >
                {isExtracting ? (
                  <div className="analysis__file-info">
                    <Loader2 size={28} className="analysis__spinner" />
                    <div><span className="analysis__file-name">Extracting text from {file?.name}...</span></div>
                  </div>
                ) : file ? (
                  <div className="analysis__file-info">
                    <FileText size={28} style={{ color: 'var(--cl-secondary)' }} />
                    <div>
                      <span className="analysis__file-name">{file.name}</span>
                      <span className="analysis__file-size">{(file.size / 1024).toFixed(1)} KB · {resumeText.length} chars extracted</span>
                    </div>
                    <button className="analysis__file-remove" onClick={handleRemoveFile}><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <div className="analysis__dropzone-icon"><Upload size={32} /></div>
                    <p className="analysis__dropzone-text">Drag & drop your resume here</p>
                    <label className="btn-secondary analysis__browse-btn">
                      Browse Files
                      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={handleBrowse} />
                    </label>
                    <span className="analysis__dropzone-hint">PDF, DOCX, TXT — Max 5MB</span>
                  </>
                )}
              </div>

              <div className="analysis__jd-section">
                <label className="analysis__label">Job Description</label>
                <textarea
                  className="analysis__textarea"
                  rows={10}
                  placeholder="Paste the full job description or requirements here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  id="jd-input"
                />
              </div>

              <button
                className="btn-primary analysis__analyze-btn"
                onClick={handleAnalyze}
                disabled={!resumeText.trim() || !jd.trim() || analyzing || isExtracting}
                id="analyze-btn"
              >
                <Sparkles size={18} /> Analyze with AI <ArrowRight size={18} />
              </button>
            </div>

            {/* Right: How AI Screening Works Info Card */}
            <div className="analysis__right">
              <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'rgba(108, 92, 231, 0.2)', borderRadius: '12px', color: 'var(--cl-primary-light)' }}>
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Smart Match Visualization</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)' }}>What happens when you click analyze</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Target size={24} style={{ color: 'var(--cl-secondary)', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>1. Semantic Match Scoring</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)', lineHeight: 1.5 }}>
                        Calculates an accurate 0-100 fit percentage comparing your past projects and qualifications against job expectations.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <ShieldCheck size={24} style={{ color: 'var(--cl-primary-light)', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>2. Enterprise ATS Diagnostics</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)', lineHeight: 1.5 }}>
                        Scans for tables, multi-column headers, or unparseable fonts that cause automated rejection in Taleo, Greenhouse, or Workday.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Zap size={24} style={{ color: 'var(--cl-warning)', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>3. Instant One-Click Rewrite</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface-variant)', lineHeight: 1.5 }}>
                        Get AI-tailored suggestions and instantly rewrite weak bullet points to boost your match score above 90%.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '16px', background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(0, 184, 148, 0.1))', borderRadius: '12px', border: '1px solid rgba(108, 92, 231, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles style={{ color: 'var(--cl-warning)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--cl-on-surface)' }}>
                    Ready? Upload your CV on the left to generate your interactive visualization report.
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
