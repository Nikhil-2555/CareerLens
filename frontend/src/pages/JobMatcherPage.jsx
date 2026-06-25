import { useState, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { Upload, FileText, Search, Loader2, Briefcase, TrendingUp } from 'lucide-react'
import './JobMatcherPage.css'

const API_BASE = 'http://localhost:5000'

export default function JobMatcherPage() {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [matching, setMatching] = useState(false)
  const [matches, setMatches] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const { getToken } = useAuth()

  const getAuthHeaders = async () => {
    const token = await getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setError('')
    setIsExtracting(true)
    setMatches(null)

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

  const handleMatch = async () => {
    if (!resumeText.trim()) return
    setMatching(true)
    setError('')
    setMatches(null)

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/v1/analyses/match-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ resumeText: resumeText.trim() }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Matching failed')
      setMatches(data.data.matches || [])
    } catch (err) {
      setError(`Matching failed: ${err.message}`)
    } finally {
      setMatching(false)
    }
  }

  return (
    <DashboardLayout>
      <TopBar title="Job Auto Matcher" subtitle="Upload your resume to discover the best-fit job roles for your skills" />
      <div className={`matcher__content ${matches ? 'matcher__content--has-results' : ''}`}>
        
        <div className="matcher__left">
          {error && <div className="matcher__error">{error}</div>}
          
          <div className={`matcher__dropzone glass-card ${dragOver ? 'matcher__dropzone--active' : ''}`}
            onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
          >
            {isExtracting ? (
              <div className="matcher__file-info"><Loader2 size={28} className="spin" /> Extracting text...</div>
            ) : file ? (
              <div className="matcher__file-info">
                <FileText size={28} style={{ color: 'var(--cl-secondary)' }} />
                <span>{file.name}</span>
                <button onClick={() => setFile(null)}>Remove</button>
              </div>
            ) : (
              <>
                <Upload size={32} className="matcher__dropzone-icon" />
                <p>Drag & drop your resume here</p>
                <label className="btn-secondary">Browse Files <input ref={fileInputRef} type="file" hidden onChange={(e) => handleFileSelect(e.target.files[0])} /></label>
              </>
            )}
          </div>

          <button className="btn-primary matcher__btn" onClick={handleMatch} disabled={!resumeText || matching || isExtracting}>
            {matching ? <><Loader2 size={18} className="spin" /> Finding Jobs...</> : <><Search size={18} /> Find Matching Jobs</>}
          </button>
        </div>

        <div className="matcher__right">
          {!matches && !matching && (
            <div className="matcher__placeholder glass-card-strong">
              <Briefcase size={48} />
              <h3>Discover Your Ideal Roles</h3>
              <p>Upload a resume to let our AI scan your experience and recommend the perfect job titles.</p>
            </div>
          )}

          {matching && (
            <div className="matcher__loading glass-card-strong">
              <Loader2 size={48} className="spin" style={{ color: 'var(--cl-primary)' }} />
              <h3>Scanning the job market...</h3>
            </div>
          )}

          {matches && !matching && (
            <div className="matcher__results animate-fade-in">
              <h2 className="matcher__results-title">Top Role Matches</h2>
              <div className="matcher__jobs-grid">
                {matches.map((job, idx) => (
                  <div key={idx} className="matcher__job-card glass-card">
                    <div className="matcher__job-header">
                      <h3>{job.title}</h3>
                      <div className="matcher__job-score">
                        <span className="score-num">{job.matchScore}%</span> Match
                      </div>
                    </div>
                    <p className="matcher__job-reason">{job.reason}</p>
                    <div className="matcher__job-keywords">
                      <div className="keyword-label"><TrendingUp size={14} /> Skills to Boost</div>
                      <div className="tags">
                        {job.recommendedKeywords.map(k => <span key={k} className="tag">{k}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
