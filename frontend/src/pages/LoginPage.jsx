import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Target, FileText, BarChart3, Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed')
      }

      // Store token and user
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth">
      {/* Left Showcase Panel */}
      <div className="auth__left">
        <div className="auth__left-bg">
          <div className="auth__orb auth__orb--1"></div>
          <div className="auth__orb auth__orb--2"></div>
          <div className="auth__orb auth__orb--3"></div>
        </div>
        <div className="auth__left-content">
          <h1 className="auth__tagline">Your AI <span className="gradient-text">Career Coach</span></h1>
          <p className="auth__tagline-sub">Get instant AI feedback on your resume, generate tailored cover letters, and track every application.</p>
          <div className="auth__bullets">
            <div className="auth__bullet">
              <div className="auth__bullet-icon"><Target size={20} /></div>
              <div><strong>AI-powered fit scoring</strong><span>Match your resume to any job description instantly</span></div>
            </div>
            <div className="auth__bullet">
              <div className="auth__bullet-icon"><FileText size={20} /></div>
              <div><strong>Smart cover letters</strong><span>Generate tailored letters that beat ATS systems</span></div>
            </div>
            <div className="auth__bullet">
              <div className="auth__bullet-icon"><BarChart3 size={20} /></div>
              <div><strong>Application tracking</strong><span>Kanban board to track your entire job search</span></div>
            </div>
          </div>
          <div className="auth__float-cards">
            <div className="auth__float-card glass-card">
              <div className="auth__float-score">92</div>
              <span>Fit Score</span>
            </div>
            <div className="auth__float-card glass-card auth__float-card--2">
              <Sparkles size={16} />
              <span>Cover Letter Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth__right">
        <div className="auth__form-container">
          <Link to="/" className="auth__logo">
            <div className="auth__logo-icon">C</div>
            <span>CareerLens</span>
          </Link>
          <h2 className="auth__title">Welcome Back</h2>
          <p className="auth__subtitle">Sign in to continue your job search journey</p>

          {error && (
            <div className="auth__message auth__message--error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="auth__field">
              <label htmlFor="login-email">Email</label>
              <div className="auth__input-wrapper">
                <Mail size={16} className="auth__input-icon" />
                <input 
                  type="email" 
                  id="login-email" 
                  placeholder="john@example.com" 
                  className="auth__input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="auth__field">
              <label htmlFor="login-password">Password</label>
              <div className="auth__input-wrapper">
                <Lock size={16} className="auth__input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="login-password" 
                  placeholder="••••••••" 
                  className="auth__input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="auth__toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Link to="/forgot-password" className="auth__forgot-link">
              Forgot password?
            </Link>

            <button type="submit" className="btn-primary auth__submit" disabled={isLoading}>
              {isLoading && <span className="auth__spinner" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth__info-line">
            <Shield size={14} /> Secured with encrypted authentication
          </p>

          <p className="auth__terms">By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
          <p className="auth__switch">Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
