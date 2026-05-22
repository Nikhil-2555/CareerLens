import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react'
import './AnalysisPage.css'

const mockStrengths = [
  '5+ years Python experience matches requirements',
  'Strong leadership and team management skills',
  'Relevant AWS and cloud certifications',
  'Quantified achievements with metrics',
]
const mockGaps = [
  'No mention of Kubernetes or containerization',
  'Missing project management methodology (Agile/Scrum)',
  'Consider adding more specific impact metrics',
]
const mockMatched = ['Python', 'React', 'AWS', 'Leadership', 'CI/CD', 'TypeScript']
const mockMissing = ['Kubernetes', 'Scrum', 'Terraform', 'GraphQL']

export default function AnalysisPage() {
  const [jd, setJd] = useState('')
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleAnalyze = () => {
    if (!file || !jd.trim()) return
    setAnalyzing(true)
    setTimeout(() => {
      setResults({ score: 82, strengths: mockStrengths, gaps: mockGaps, matched: mockMatched, missing: mockMissing })
      setAnalyzing(false)
    }, 2500)
  }

  const scoreColor = results ? (results.score >= 85 ? 'var(--cl-secondary)' : results.score >= 70 ? 'var(--cl-warning)' : 'var(--cl-error)') : 'var(--cl-primary)'
  const scoreLabel = results ? (results.score >= 85 ? 'Excellent Match!' : results.score >= 70 ? 'Great Match!' : 'Needs Improvement') : ''
  const dashOffset = results ? 283 - (283 * results.score) / 100 : 283

  return (
    <DashboardLayout>
      <TopBar title="Resume Analysis" subtitle="Upload your resume and paste a job description for AI analysis" />
      <div className="analysis__content">
        {/* Left: Inputs */}
        <div className="analysis__left">
          <div className={`analysis__dropzone glass-card ${dragOver ? 'analysis__dropzone--active' : ''} ${file ? 'analysis__dropzone--has-file' : ''}`}
            onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
          >
            {file ? (
              <div className="analysis__file-info">
                <FileText size={28} />
                <div><span className="analysis__file-name">{file.name}</span><span className="analysis__file-size">{(file.size / 1024).toFixed(1)} KB</span></div>
                <button className="analysis__file-remove" onClick={() => setFile(null)}><X size={16} /></button>
              </div>
            ) : (
              <>
                <div className="analysis__dropzone-icon"><Upload size={32} /></div>
                <p className="analysis__dropzone-text">Drag & drop your resume here</p>
                <label className="btn-secondary analysis__browse-btn">
                  Browse Files
                  <input type="file" accept=".pdf,.docx,.txt" hidden onChange={(e) => setFile(e.target.files[0])} />
                </label>
                <span className="analysis__dropzone-hint">PDF, DOCX, TXT — Max 5MB</span>
              </>
            )}
          </div>

          <div className="analysis__jd-section">
            <label className="analysis__label">Job Description</label>
            <textarea className="analysis__textarea" rows={10} placeholder="Paste the full job description here..." value={jd} onChange={(e) => setJd(e.target.value)} id="jd-input" />
          </div>

          <button className="btn-primary analysis__analyze-btn" onClick={handleAnalyze} disabled={!file || !jd.trim() || analyzing} id="analyze-btn">
            {analyzing ? <><Loader2 size={18} className="analysis__spinner" /> Analyzing...</> : <><Sparkles size={18} /> Analyze with AI</>}
          </button>
        </div>

        {/* Right: Results */}
        <div className="analysis__right">
          {!results && !analyzing && (
            <div className="analysis__placeholder glass-card-strong">
              <Sparkles size={40} />
              <h3>AI Analysis Results</h3>
              <p>Upload a resume and paste a job description, then click "Analyze with AI" to see your fit score.</p>
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
              <div className="analysis__section glass-card">
                <h3 className="analysis__section-title"><CheckCircle2 size={18} style={{ color: 'var(--cl-secondary)' }} /> Strengths</h3>
                <ul className="analysis__list">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="analysis__list-item analysis__list-item--success"><CheckCircle2 size={14} /> {s}</li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="analysis__section glass-card">
                <h3 className="analysis__section-title"><AlertTriangle size={18} style={{ color: 'var(--cl-warning)' }} /> Gaps to Address</h3>
                <ul className="analysis__list">
                  {results.gaps.map((g, i) => (
                    <li key={i} className="analysis__list-item analysis__list-item--warning"><AlertTriangle size={14} /> {g}</li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              <div className="analysis__section glass-card">
                <h3 className="analysis__section-title">Keyword Match</h3>
                <div className="analysis__keywords">
                  <div className="analysis__keyword-group">
                    <span className="analysis__keyword-label">Matched</span>
                    <div className="analysis__tags">{results.matched.map((k, i) => <span key={i} className="analysis__tag analysis__tag--matched">{k}</span>)}</div>
                  </div>
                  <div className="analysis__keyword-group">
                    <span className="analysis__keyword-label">Missing</span>
                    <div className="analysis__tags">{results.missing.map((k, i) => <span key={i} className="analysis__tag analysis__tag--missing">{k}</span>)}</div>
                  </div>
                </div>
              </div>

              <button className="btn-primary analysis__gen-btn" style={{ width: '100%' }}><FileText size={18} /> Generate Cover Letter</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
