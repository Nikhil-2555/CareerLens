import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import TopBar from '../components/TopBar'
import { Sparkles, RefreshCw, Copy, Download, Bold, Italic, Underline, AlignLeft, AlignCenter, List, Check } from 'lucide-react'
import './CoverLetterPage.css'

const mockLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Frontend Engineer position at Google. With over five years of experience building high-performance web applications using React, TypeScript, and modern CSS, I am confident in my ability to contribute meaningfully to your team's mission of organizing the world's information.

In my current role at TechCorp, I led a team of four developers in redesigning the company's flagship dashboard, resulting in a 40% improvement in page load times and a 25% increase in user engagement. I spearheaded the migration from a legacy jQuery codebase to a modern React architecture, implementing code splitting and lazy loading strategies that reduced bundle size by 60%. My experience with performance optimization, component architecture, and cross-functional collaboration aligns closely with the requirements outlined in your job posting.

I am particularly drawn to Google's commitment to web platform advancement and its contributions to open-source tools like Angular, Lit, and Chrome DevTools. I would welcome the opportunity to bring my passion for exceptional user experiences and technical excellence to your organization. Thank you for considering my application, and I look forward to discussing how my skills can benefit your team.

Sincerely,
John Doe`

const versions = [
  { id: 1, label: 'Version 1', date: 'May 22, 2026', active: true },
  { id: 2, label: 'Version 2', date: 'May 20, 2026', active: false },
]

export default function CoverLetterPage() {
  const [letter, setLetter] = useState(mockLetter)
  const [copied, setCopied] = useState(false)
  const [activeVersion, setActiveVersion] = useState(1)

  const handleCopy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <TopBar title="Cover Letter Editor" subtitle="AI-generated and fully editable" />
      <div className="cl__content">
        {/* Version Tabs */}
        <div className="cl__versions">
          {versions.map(v => (
            <button key={v.id} className={`cl__version-tab ${activeVersion === v.id ? 'cl__version-tab--active' : ''}`} onClick={() => setActiveVersion(v.id)}>
              {v.label} <span className="cl__version-date">{v.date}</span>
            </button>
          ))}
        </div>

        <div className="cl__body">
          {/* Editor */}
          <div className="cl__editor-panel">
            <div className="cl__context glass-card">
              <div className="cl__context-info">
                <Sparkles size={16} style={{ color: 'var(--cl-primary-light)' }} />
                <span>For: <strong>Senior Frontend Engineer</strong> at <strong>Google</strong></span>
              </div>
              <div className="badge badge-success">85% Match</div>
            </div>

            <div className="cl__editor glass-card-strong">
              <div className="cl__toolbar">
                <button className="cl__tool-btn" title="Bold"><Bold size={16} /></button>
                <button className="cl__tool-btn" title="Italic"><Italic size={16} /></button>
                <button className="cl__tool-btn" title="Underline"><Underline size={16} /></button>
                <div className="cl__tool-sep"></div>
                <button className="cl__tool-btn" title="Align Left"><AlignLeft size={16} /></button>
                <button className="cl__tool-btn" title="Center"><AlignCenter size={16} /></button>
                <div className="cl__tool-sep"></div>
                <button className="cl__tool-btn" title="List"><List size={16} /></button>
              </div>
              <textarea className="cl__textarea" value={letter} onChange={(e) => setLetter(e.target.value)} id="cover-letter-editor" />
            </div>

            <div className="cl__actions">
              <button className="btn-secondary" onClick={() => {}}><RefreshCw size={16} /> Regenerate</button>
              <button className="btn-secondary" onClick={handleCopy}>{copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}</button>
              <button className="btn-primary"><Download size={16} /> Download PDF</button>
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
              <div className="cl__preview-body">{letter.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
