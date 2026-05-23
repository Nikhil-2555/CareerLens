import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, X, Loader2, Lightbulb } from 'lucide-react'
import './AnalysisPage.css'

const API_BASE = 'http://localhost:5000'

export default function AnalysisPage() {
  const [jd, setJd] = useState('')
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // ─── Upload & Extract Resume Text ───
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setError('')
    setIsExtracting(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('resume', selectedFile)

      const res = await fetch(`${API_BASE}/api/v1/resumes/extract-text`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
    setResults(null)
  }

  // ─── Analyze with real Groq AI ───
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jd.trim()) return
    setAnalyzing(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch(`${API_BASE}/api/v1/analyses/analyze-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jd.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Analysis failed')

      setResults({
        score: data.data.score,
        strengths: data.data.strengths || [],
        gaps: data.data.gaps || [],
        matched: data.data.matchedKeywords || [],
        missing: data.data.missingKeywords || [],
        suggestions: data.data.suggestions || [],
      })
    } catch (err) {
      setError(`Analysis failed: ${err.message}`)
    } finally {
      setAnalyzing(false)
    }
  }

  // ─── Generate cover letter from these results ───
  const handleGenerateCoverLetter = () => {
    // Navigate to cover letter page (user can generate there with the same resume)
    navigate('/coverletter')
  }

  const scoreColor = results ? (results.score >= 85 ? 'var(--cl-secondary)' : results.score >= 70 ? 'var(--cl-warning)' : 'var(--cl-error)') : 'var(--cl-primary)'
  const scoreLabel = results ? (results.score >= 85 ? 'Excellent Match!' : results.score >= 70 ? 'Good Match' : results.score >= 50 ? 'Needs Improvement' : 'Poor Match') : ''
  const dashOffset = results ? 283 - (283 * results.score) / 100 : 283

  return (
    <DashboardLayout>
      <TopBar title="Resume Analysis" subtitle="Upload your resume and paste a job description for AI analysis" />
      <div className="analysis__content">
        {/* Left: Inputs */}
        <div className="analysis__left">
          {/* Error */}
          {error && (
            <div className="analysis__error">
              {error}
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
            <textarea className="analysis__textarea" rows={10} placeholder="Paste the full job description here..." value={jd} onChange={(e) => setJd(e.target.value)} id="jd-input" />
          </div>

          <button
            className="btn-primary analysis__analyze-btn"
            onClick={handleAnalyze}
            disabled={!resumeText.trim() || !jd.trim() || analyzing || isExtracting}
            id="analyze-btn"
          >
            {analyzing ? <><Loader2 size={18} className="analysis__spinner" /> Analyzing with AI...</> : <><Sparkles size={18} /> Analyze with AI</>}
          </button>
        </div>

        {/* Right: Results */}
        <div className="analysis__right">
          {!results && !analyzing && (
            <div className="analysis__placeholder glass-card-strong">
              <Sparkles size={40} />
              <h3>AI Analysis Results</h3>
              <p>Upload a resume and paste a job description, then click "Analyze with AI" to see your fit score.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--cl-outline)', marginTop: '8px' }}>Powered by Groq Llama 3 · Real AI analysis</p>
            </div>
          )}

          {analyzing && (
            <div className="analysis__loading glass-card-strong">
              <div className="analysis__loading-spinner"><Loader2 size={48} /></div>
              <h3>Analyzing your resume...</h3>
              <p>Our AI is comparing your resume against the job description</p>
              <div className="analysis__loading-bar"><div className="analysis__loading-fill"></div></div>
            </div>
          )}

          {results && !analyzing && (
            <div className="analysis__results animate-fade-in">
              {/* Score */}
              <div className="analysis__score-card glass-card">
                <div className="analysis__score-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--cl-outline-variant)" strokeWidth="5" opacity="0.2" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray="283" strokeDashoffset={dashOffset} transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
                  </svg>
                  <div className="analysis__score-text">
                    <span className="analysis__score-num">{results.score}</span>
                    <span className="analysis__score-of">/100</span>
                  </div>
                </div>
                <span className="analysis__score-label" style={{ color: scoreColor }}>{scoreLabel}</span>
              </div>

              {/* Strengths */}
              {results.strengths.length > 0 && (
                <div className="analysis__section glass-card">
                  <h3 className="analysis__section-title"><CheckCircle2 size={18} style={{ color: 'var(--cl-secondary)' }} /> Strengths</h3>
                  <ul className="analysis__list">
                    {results.strengths.map((s, i) => (
                      <li key={i} className="analysis__list-item analysis__list-item--success"><CheckCircle2 size={14} /> {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {results.gaps.length > 0 && (
                <div className="analysis__section glass-card">
                  <h3 className="analysis__section-title"><AlertTriangle size={18} style={{ color: 'var(--cl-warning)' }} /> Gaps to Address</h3>
                  <ul className="analysis__list">
                    {results.gaps.map((g, i) => (
                      <li key={i} className="analysis__list-item analysis__list-item--warning"><AlertTriangle size={14} /> {g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              <div className="analysis__section glass-card">
                <h3 className="analysis__section-title">Keyword Match</h3>
                <div className="analysis__keywords">
                  {results.matched.length > 0 && (
                    <div className="analysis__keyword-group">
                      <span className="analysis__keyword-label">Matched ({results.matched.length})</span>
                      <div className="analysis__tags">{results.matched.map((k, i) => <span key={i} className="analysis__tag analysis__tag--matched">{k}</span>)}</div>
                    </div>
                  )}
                  {results.missing.length > 0 && (
                    <div className="analysis__keyword-group">
                      <span className="analysis__keyword-label">Missing ({results.missing.length})</span>
                      <div className="analysis__tags">{results.missing.map((k, i) => <span key={i} className="analysis__tag analysis__tag--missing">{k}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {results.suggestions && results.suggestions.length > 0 && (
                <div className="analysis__section glass-card">
                  <h3 className="analysis__section-title"><Lightbulb size={18} style={{ color: 'var(--cl-primary-light)' }} /> Suggestions</h3>
                  <ul className="analysis__list">
                    {results.suggestions.map((s, i) => (
                      <li key={i} className="analysis__list-item analysis__list-item--info"><Lightbulb size={14} /> {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="btn-primary analysis__gen-btn" style={{ width: '100%' }} onClick={handleGenerateCoverLetter}>
                <FileText size={18} /> Generate Cover Letter
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
