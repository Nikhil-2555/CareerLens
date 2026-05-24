import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, X, Loader2, Lightbulb, Download } from 'lucide-react'
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
  const [optimizing, setOptimizing] = useState(false)
  const [optimizedData, setOptimizedData] = useState(null)
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
        atsScore: data.data.atsScore,
        badFormatting: data.data.badFormatting || [],
        atsRecommendations: data.data.atsRecommendations || [],
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

  // ─── Optimize Resume (One-Click Rewrite) ───
  const handleOptimize = async () => {
    if (!resumeText.trim() || !jd.trim()) return
    setOptimizing(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/v1/analyses/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jd.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Optimization failed')
      setOptimizedData(data.data)
    } catch (err) {
      setError(`Optimization failed: ${err.message}`)
    } finally {
      setOptimizing(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!optimizedData) return
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Optimized Resume</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.5; padding: 40px; color: #222; max-width: 850px; margin: 0 auto; }
            * { box-sizing: border-box; }
            h1, h2, h3, h4 { margin-top: 24px; margin-bottom: 8px; color: #111; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 4px; }
            h2 { font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
            h3 { font-size: 16px; font-weight: bold; }
            p { margin-bottom: 8px; font-size: 14px; }
            ul { margin-bottom: 16px; padding-left: 20px; }
            li { margin-bottom: 6px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${optimizedData.optimizedResumeHTML || optimizedData.optimizedResume}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const scoreColor = results ? (results.score >= 85 ? 'var(--cl-secondary)' : results.score >= 70 ? 'var(--cl-warning)' : 'var(--cl-error)') : 'var(--cl-primary)'
  const scoreLabel = results ? (results.score >= 85 ? 'Excellent Match!' : results.score >= 70 ? 'Good Match' : results.score >= 50 ? 'Needs Improvement' : 'Poor Match') : ''
  const dashOffset = results ? 283 - (283 * results.score) / 100 : 283

  return (
    <DashboardLayout>
      <TopBar title="Resume Analysis" subtitle="Upload your resume and paste a job description for AI analysis" />
      <div className={`analysis__content ${results ? 'analysis__content--has-results' : ''}`}>
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
              <div className="analysis__scores-container section-scores">
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

                {/* ATS Score */}
                {results.atsScore !== undefined && (
                  <div className="analysis__score-card glass-card">
                    <div className="analysis__score-ring">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--cl-outline-variant)" strokeWidth="5" opacity="0.2" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={results.atsScore >= 80 ? 'var(--cl-secondary)' : results.atsScore >= 60 ? 'var(--cl-warning)' : 'var(--cl-error)'} strokeWidth="5" strokeLinecap="round"
                          strokeDasharray="283" strokeDashoffset={283 - (283 * results.atsScore) / 100} transform="rotate(-90 50 50)"
                          style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
                      </svg>
                      <div className="analysis__score-text">
                        <span className="analysis__score-num">{results.atsScore}</span>
                        <span className="analysis__score-of">/100</span>
                      </div>
                    </div>
                    <span className="analysis__score-label" style={{ color: results.atsScore >= 80 ? 'var(--cl-secondary)' : results.atsScore >= 60 ? 'var(--cl-warning)' : 'var(--cl-error)' }}>ATS Compatibility</span>
                  </div>
                )}
              </div>

              {/* Strengths */}
              {results.strengths.length > 0 && (
                <div className="analysis__section glass-card section-strengths">
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
                <div className="analysis__section glass-card section-gaps">
                  <h3 className="analysis__section-title"><AlertTriangle size={18} style={{ color: 'var(--cl-warning)' }} /> Gaps to Address</h3>
                  <ul className="analysis__list">
                    {results.gaps.map((g, i) => (
                      <li key={i} className="analysis__list-item analysis__list-item--warning"><AlertTriangle size={14} /> {g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ATS Formatting Scanner */}
              {(results.badFormatting.length > 0 || results.atsRecommendations.length > 0) && (
                <div className="analysis__section glass-card section-ats" style={{ borderLeft: '4px solid var(--cl-primary)' }}>
                  <h3 className="analysis__section-title"><FileText size={18} style={{ color: 'var(--cl-primary-light)' }} /> ATS Formatting Analysis</h3>
                  
                  {results.badFormatting.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <span className="analysis__keyword-label" style={{ color: 'var(--cl-error)' }}>❌ Bad Formatting Detected</span>
                      <ul className="analysis__list">
                        {results.badFormatting.map((g, i) => (
                          <li key={i} className="analysis__list-item analysis__list-item--error"><X size={14} /> {g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.atsRecommendations.length > 0 && (
                    <div>
                      <span className="analysis__keyword-label" style={{ color: 'var(--cl-secondary)' }}>✅ Recommendations</span>
                      <ul className="analysis__list">
                        {results.atsRecommendations.map((g, i) => (
                          <li key={i} className="analysis__list-item analysis__list-item--success"><CheckCircle2 size={14} /> {g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Keywords */}
              <div className="analysis__section glass-card section-keywords">
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
                <div className="analysis__section glass-card section-suggestions">
                  <h3 className="analysis__section-title"><Lightbulb size={18} style={{ color: 'var(--cl-primary-light)' }} /> Suggestions</h3>
                  <ul className="analysis__list">
                    {results.suggestions.map((s, i) => (
                      <li key={i} className="analysis__list-item analysis__list-item--info"><Lightbulb size={14} /> {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="section-actions" style={{ display: 'flex', gap: '12px', marginTop: 'var(--space-sm)' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={handleOptimize} disabled={optimizing || analyzing}>
                  {optimizing ? <><Loader2 size={18} className="analysis__spinner" /> Optimizing...</> : <><Sparkles size={18} /> Optimize Resume</>}
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleGenerateCoverLetter}>
                  <FileText size={18} /> Cover Letter
                </button>
              </div>

              {optimizedData && (
                <div className="analysis__section glass-card section-optimized" style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {optimizedData.newScore && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(108, 92, 231, 0.05))', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cl-primary-light)' }}>
                      <div>
                        <h3 style={{ margin: 0, color: 'var(--cl-primary-light)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} /> Optimization Successful!</h3>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--cl-on-surface-variant)', fontSize: '0.9rem' }}>Your resume has been rewritten to perfectly match the job description.</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--cl-secondary)', lineHeight: '1' }}>{optimizedData.newScore}<span style={{ fontSize: '1rem', color: 'var(--cl-on-surface-variant)' }}>/100</span></div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cl-secondary-light)', fontWeight: '700', marginTop: '4px' }}>New Projected Score</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="analysis__section-title"><Sparkles size={18} style={{ color: 'var(--cl-warning)' }} /> Optimized Bullets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {optimizedData.bulletDiffs?.map((diff, i) => (
                        <div key={i} className="bullet-diff-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--cl-border-tint)' }}>
                          <div style={{ color: 'var(--cl-error)', fontSize: '0.85rem', marginBottom: '4px', textDecoration: 'line-through' }}>Before: {diff.before}</div>
                          <div style={{ color: 'var(--cl-secondary-light)', fontSize: '0.9rem', fontWeight: 600 }}>After: {diff.after}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="analysis__section-title"><FileText size={18} style={{ color: 'var(--cl-primary-light)' }} /> Full Optimized Resume</h3>
                    <div 
                      style={{ background: 'var(--cl-surface-container)', padding: '24px', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto', marginBottom: '16px', color: 'var(--cl-on-surface-variant)' }}
                      dangerouslySetInnerHTML={{ __html: optimizedData.optimizedResumeHTML || optimizedData.optimizedResume }}
                    />
                  </div>

                  <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleDownloadPDF}>
                    <Download size={18} /> Download PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
