import { Link } from 'react-router-dom'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Sparkles, ArrowRight, Play, Upload, FileText, BarChart3, Briefcase, Target, Star, Menu, X, Zap, ShieldCheck, Cpu } from 'lucide-react'
import { useState, useEffect } from 'react'
import './LandingPage.css'

const features = [
  { icon: Target, title: 'AI Fit Score Analysis', desc: 'Get an instant 0-100 score showing how well your resume matches any job description, powered by GPT-4o.', color: 'var(--cl-primary)' },
  { icon: FileText, title: 'Smart Cover Letters', desc: 'Auto-generate tailored, 3-paragraph cover letters that highlight your strengths and beat ATS systems.', color: 'var(--cl-secondary)' },
  { icon: Briefcase, title: 'Application Kanban', desc: 'Track every job application from Saved to Offer with drag-and-drop columns.', color: 'var(--cl-tertiary)' },
  { icon: BarChart3, title: 'Resume Intelligence', desc: 'Deep analysis of keyword density, skill gaps, and actionable suggestions to stand out.', color: 'var(--cl-warning)' }
]

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Drop your PDF, DOCX, or TXT resume. We extract the text instantly.', icon: Upload },
  { num: '02', title: 'Paste Job Description', desc: 'Copy any job posting and paste it in. We analyze every detail.', icon: FileText },
  { num: '03', title: 'Get AI Analysis', desc: 'Receive your fit score, strengths, gaps, and a tailored cover letter.', icon: Sparkles },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer', text: 'I landed 3 interviews in a week after using CareerLens. The AI scoring is incredibly accurate.', score: '92%' },
  { name: 'Marcus Johnson', role: 'Product Manager', text: 'The cover letter generator saved me hours. Each letter was perfectly tailored.', score: '87%' },
  { name: 'Priya Patel', role: 'Data Scientist', text: 'The Kanban board keeps my entire job search organized. Game changer!', score: '95%' },
]

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isScanning, setIsScanning] = useState(false)
  const [scanScore, setScanScore] = useState(48)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 12
    setTilt({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  const triggerLiveScan = () => {
    if (isScanning) return
    setIsScanning(true)
    setScanScore(48)
    let current = 48
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4
      if (current >= 98) {
        current = 98
        clearInterval(interval)
        setTimeout(() => setIsScanning(false), 2000)
      }
      setScanScore(current)
    }, 55)
  }

  return (
    <div className="landing">
      <nav className={`landing__nav ${scrolled ? 'landing__nav--scrolled' : ''}`}>
        <div className="container landing__nav-inner">
          <Link to="/" className="landing__logo"><div className="landing__logo-icon">C</div><span>CareerLens</span></Link>
          <div className={`landing__nav-links ${mobileMenu ? 'landing__nav-links--open' : ''}`}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            <SignedOut>
              <SignInButton mode="redirect" redirectUrl="/dashboard">
                <button className="btn-secondary landing__nav-cta">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="btn-secondary landing__nav-cta" style={{ marginRight: '8px' }}>Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
          <button className="landing__menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </nav>

      <section className="landing__hero">
        {/* Cyberpunk Grid Floor & Nebula Nebulas */}
        <div className="landing__hero-bg">
          <div className="cyber-grid-floor"></div>
          <div className="landing__hero-orb landing__hero-orb--1"></div>
          <div className="landing__hero-orb landing__hero-orb--2"></div>
          <div className="landing__hero-orb landing__hero-orb--3"></div>
        </div>

        <div className="container landing__hero-content">
          <div className="landing__hero-text">
            <div className="landing__hero-badge"><Sparkles size={14} style={{ color: '#00dce6' }} /><span>Stitch AI 4.0 Neural Screener</span></div>
            <h1 className="landing__hero-title">Land Your Dream Job with <span className="cyber-gradient-text">AI-Powered Intelligence</span></h1>
            <p className="landing__hero-subtitle">Maximize your interview chances with AI-driven resume screening, tailored keyword optimization, and real-time career coaching.</p>
            
            <div className="landing__hero-actions">
              <SignedOut>
                <SignUpButton mode="redirect" redirectUrl="/dashboard">
                  <button className="btn-stitch-primary">Get Started Free <ArrowRight size={18} /></button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="btn-stitch-primary">Go to Dashboard <ArrowRight size={18} /></Link>
              </SignedIn>
              <button className="btn-stitch-ghost"><Play size={18} /> Watch Demo</button>
            </div>

            <div className="landing__hero-stats">
              <div className="landing__stat"><span className="landing__stat-num">98.4%</span><span className="landing__stat-label">ATS Accuracy</span></div>
              <div className="landing__stat-divider"></div>
              <div className="landing__stat"><span className="landing__stat-num">3x</span><span className="landing__stat-label">Interview Rate</span></div>
              <div className="landing__stat-divider"></div>
              <div className="landing__stat"><span className="landing__stat-num">&lt; 2s</span><span className="landing__stat-label">Instant Parse</span></div>
            </div>
          </div>

          {/* Stitch 3D Parallax Cyberpunk Window */}
          <div className="landing__hero-visual" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            
            {/* Floating Cyberpunk Keyword Tags */}
            <div className="cyber-tag cyber-tag--1"><span>⚡ Python 3.12</span></div>
            <div className="cyber-tag cyber-tag--2"><span>🔥 AWS Cloud</span></div>
            <div className="cyber-tag cyber-tag--3"><span>💎 React &amp; Next.js</span></div>
            <div className="cyber-tag cyber-tag--4"><span>🚀 System Design</span></div>

            <div 
              className={`stitch-window-card ${isScanning ? 'is-scanning' : ''}`}
              style={{ transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            >
              {/* Holographic Cyber Laser */}
              <div className="stitch-cyber-laser"></div>

              {/* Window Bar */}
              <div className="stitch-window-topbar">
                <div className="stitch-window-dots"><span></span><span></span><span></span></div>
                <div className="stitch-window-tab active">📄 Resume_vFinal.pdf</div>
                <div className="stitch-window-tab">🎯 JD_Match_Analysis</div>
                <button className="btn-stitch-test" onClick={triggerLiveScan} disabled={isScanning}>
                  <Zap size={12} className={isScanning ? 'spin' : ''} /> {isScanning ? 'Boosting Score...' : '⚡ Test Live Scan'}
                </button>
              </div>

              <div className="stitch-window-body">
                <div className="stitch-gauge-container">
                  <div className="stitch-gauge-ring">
                    <svg viewBox="0 0 100 100" className="stitch-gauge-svg">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="42" fill="none" stroke="url(#stitchScoreG)" strokeWidth="8" strokeLinecap="round" 
                        strokeDasharray="264" strokeDashoffset={264 - (264 * scanScore) / 100} 
                        transform="rotate(-90 50 50)" className="stitch-gauge-circle" 
                        style={{ transition: 'stroke-dashoffset 0.08s linear' }}
                      />
                      <defs><linearGradient id="stitchScoreG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00dce6" /><stop offset="50%" stopColor="#2e5bff" /><stop offset="100%" stopColor="#ddb7ff" /></linearGradient></defs>
                    </svg>
                    <div className="stitch-gauge-val">
                      <span className="stitch-gauge-num">{scanScore}</span>
                      <span className="stitch-gauge-sub">{isScanning ? 'AI Optimizing' : 'Fit Match'}</span>
                    </div>
                  </div>
                  
                  <div className="stitch-diagnostics">
                    <div className="stitch-diag-row">
                      <div className="stitch-diag-head"><span>Semantic Keyword Density</span> <strong style={{ color: '#00dce6' }}>{Math.min(100, Math.floor(scanScore * 0.98))}%</strong></div>
                      <div className="stitch-track"><div className="stitch-fill" style={{ width: `${Math.min(100, scanScore * 0.98)}%`, background: '#00dce6', boxShadow: '0 0 12px #00dce6' }}></div></div>
                    </div>
                    <div className="stitch-diag-row">
                      <div className="stitch-diag-head"><span>ATS Grammar &amp; Structure</span> <strong style={{ color: '#ddb7ff' }}>{Math.min(100, Math.floor(scanScore * 1.02))}%</strong></div>
                      <div className="stitch-track"><div className="stitch-fill" style={{ width: `${Math.min(100, scanScore * 1.02)}%`, background: '#ddb7ff', boxShadow: '0 0 12px #ddb7ff' }}></div></div>
                    </div>
                    <div className="stitch-diag-row">
                      <div className="stitch-diag-head"><span>Quantified Impact Metrics</span> <strong style={{ color: '#2e5bff' }}>{Math.min(100, Math.floor(scanScore * 0.91))}%</strong></div>
                      <div className="stitch-track"><div className="stitch-fill" style={{ width: `${Math.min(100, scanScore * 0.91)}%`, background: '#2e5bff', boxShadow: '0 0 12px #2e5bff' }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="stitch-ai-suggestions">
                  <div className="stitch-sug-chip">✨ AI Added: &quot;Scaled Kubernetes cluster handling 10M+ daily API requests&quot;</div>
                  <div className="stitch-sug-chip success">✔️ 100% ATS Clean Formatting Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__features" id="features">
        <div className="container">
          <div className="landing__section-header"><span className="landing__section-tag">Features</span><h2 className="landing__section-title">Everything you need to <span className="gradient-text">land the job</span></h2><p className="landing__section-desc">From resume analysis to application tracking, CareerLens is your AI-powered career companion.</p></div>
          <div className="landing__features-grid">
            {features.map((f, i) => { const Icon = f.icon; return (
              <div key={i} className="landing__feature-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="landing__feature-icon" style={{ background: `${f.color}20`, color: f.color }}><Icon size={24} /></div>
                <h3>{f.title}</h3><p>{f.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      <section className="landing__steps" id="how-it-works">
        <div className="container">
          <div className="landing__section-header"><span className="landing__section-tag">How It Works</span><h2 className="landing__section-title">Three steps to your <span className="gradient-text">perfect application</span></h2></div>
          <div className="landing__steps-grid">
            {steps.map((s, i) => { const Icon = s.icon; return (
              <div key={i} className="landing__step">
                <div className="landing__step-num">{s.num}</div>
                <div className="landing__step-icon"><Icon size={28} /></div>
                <h3>{s.title}</h3><p>{s.desc}</p>
                {i < steps.length - 1 && <div className="landing__step-connector"></div>}
              </div>
            )})}
          </div>
        </div>
      </section>

      <section className="landing__testimonials" id="testimonials">
        <div className="container">
          <div className="landing__section-header"><span className="landing__section-tag">Testimonials</span><h2 className="landing__section-title">Loved by <span className="gradient-text">job seekers</span></h2></div>
          <div className="landing__testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="landing__testimonial glass-card">
                <div className="landing__testimonial-stars">{[...Array(5)].map((_, j) => <Star key={j} size={16} fill="var(--cl-warning)" color="var(--cl-warning)" />)}</div>
                <p className="landing__testimonial-text">"{t.text}"</p>
                <div className="landing__testimonial-footer">
                  <div className="landing__testimonial-author">
                    <div className="landing__testimonial-avatar">{t.name.split(' ').map(n => n[0]).join('')}</div>
                    <div><span className="landing__testimonial-name">{t.name}</span><span className="landing__testimonial-role">{t.role}</span></div>
                  </div>
                  <div className="badge badge-success">Score: {t.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing__cta">
        <div className="container">
          <div className="landing__cta-card glass-card">
            <h2>Ready to supercharge your job search?</h2>
            <p>Join thousands of job seekers who landed their dream roles with CareerLens.</p>
            <SignedOut>
              <SignUpButton mode="redirect" redirectUrl="/dashboard">
                <button className="btn-primary">Get Started Free <ArrowRight size={18} /></button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="btn-primary">Go to Dashboard <ArrowRight size={18} /></Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="container landing__footer-inner">
          <div className="landing__footer-brand"><div className="landing__logo"><div className="landing__logo-icon">C</div><span>CareerLens</span></div><p>AI-powered resume screening and career coaching.</p></div>
          <div className="landing__footer-links">
            <div><h4>Product</h4><a href="#features">Features</a><a href="#how-it-works">How It Works</a></div>
            <div><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
          </div>
          <div className="landing__footer-bottom"><p>© 2026 CareerLens. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  )
}
