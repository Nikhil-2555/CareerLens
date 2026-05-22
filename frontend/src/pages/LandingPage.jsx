import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Play, Upload, FileText, BarChart3, Briefcase, Target, Star, Menu, X } from 'lucide-react'
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

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="landing">
      <nav className={`landing__nav ${scrolled ? 'landing__nav--scrolled' : ''}`}>
        <div className="container landing__nav-inner">
          <Link to="/" className="landing__logo"><div className="landing__logo-icon">C</div><span>CareerLens</span></Link>
          <div className={`landing__nav-links ${mobileMenu ? 'landing__nav-links--open' : ''}`}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            <Link to="/login" className="btn-secondary landing__nav-cta">Sign In</Link>
          </div>
          <button className="landing__menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </nav>

      <section className="landing__hero">
        <div className="landing__hero-bg"><div className="landing__hero-orb landing__hero-orb--1"></div><div className="landing__hero-orb landing__hero-orb--2"></div><div className="landing__hero-orb landing__hero-orb--3"></div></div>
        <div className="container landing__hero-content">
          <div className="landing__hero-text">
            <div className="landing__hero-badge"><Sparkles size={14} /><span>Powered by GPT-4o</span></div>
            <h1 className="landing__hero-title">Land Your Dream Job with <span className="gradient-text">AI-Powered Resume Intelligence</span></h1>
            <p className="landing__hero-subtitle">Maximize your interview chances with instant AI-driven resume screening, tailored cover letter coaching, and smart application tracking.</p>
            <div className="landing__hero-actions">
              <Link to="/login" className="btn-primary landing__hero-btn">Get Started Free <ArrowRight size={18} /></Link>
              <button className="btn-secondary landing__hero-btn"><Play size={18} /> Watch Demo</button>
            </div>
            <div className="landing__hero-stats">
              <div className="landing__stat"><span className="landing__stat-num">10K+</span><span className="landing__stat-label">Resumes Analyzed</span></div>
              <div className="landing__stat-divider"></div>
              <div className="landing__stat"><span className="landing__stat-num">85%</span><span className="landing__stat-label">Interview Rate</span></div>
              <div className="landing__stat-divider"></div>
              <div className="landing__stat"><span className="landing__stat-num">4.9★</span><span className="landing__stat-label">User Rating</span></div>
            </div>
          </div>
          <div className="landing__hero-visual">
            <div className="landing__preview glass-card">
              <div className="landing__preview-header"><div className="landing__preview-dots"><span></span><span></span><span></span></div><span className="landing__preview-title">Resume Analysis</span></div>
              <div className="landing__preview-body">
                <div className="landing__score-ring">
                  <svg viewBox="0 0 100 100" className="landing__score-svg">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--cl-outline-variant)" strokeWidth="6" opacity="0.3" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreG)" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="26" transform="rotate(-90 50 50)" className="landing__score-circle" />
                    <defs><linearGradient id="scoreG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--cl-primary)" /><stop offset="100%" stopColor="var(--cl-secondary)" /></linearGradient></defs>
                  </svg>
                  <div className="landing__score-value"><span className="landing__score-num">92</span><span className="landing__score-label">Match</span></div>
                </div>
                <div className="landing__preview-metrics">
                  {[['Keywords', 88, 'var(--cl-primary)'], ['Experience', 95, 'var(--cl-secondary)'], ['Structure', 76, 'var(--cl-tertiary)']].map(([l, v, c]) => (
                    <div key={l} className="landing__metric"><span className="landing__metric-label">{l}</span><div className="landing__metric-bar"><div className="landing__metric-fill" style={{ width: `${v}%`, background: c }}></div></div><span className="landing__metric-val">{v}%</span></div>
                  ))}
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
            <Link to="/login" className="btn-primary">Get Started Free <ArrowRight size={18} /></Link>
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
