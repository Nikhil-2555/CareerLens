import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Target, FileText, BarChart3, Shield } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed')
      }

      // Store token (in a real app, use AuthContext + localStorage/cookies)
      localStorage.setItem('accessToken', data.data.accessToken)
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login">
      {/* Left Panel */}
      <div className="login__left">
        <div className="login__left-bg">
          <div className="login__orb login__orb--1"></div>
          <div className="login__orb login__orb--2"></div>
        </div>
        <div className="login__left-content">
          <h1 className="login__tagline">Your AI <span className="gradient-text">Career Coach</span></h1>
          <p className="login__tagline-sub">Get instant AI feedback on your resume, generate tailored cover letters, and track every application.</p>
          <div className="login__bullets">
            <div className="login__bullet"><div className="login__bullet-icon"><Target size={20} /></div><div><strong>AI-powered fit scoring</strong><span>Match your resume to any job description instantly</span></div></div>
            <div className="login__bullet"><div className="login__bullet-icon"><FileText size={20} /></div><div><strong>Smart cover letters</strong><span>Generate tailored letters that beat ATS systems</span></div></div>
            <div className="login__bullet"><div className="login__bullet-icon"><BarChart3 size={20} /></div><div><strong>Application tracking</strong><span>Kanban board to track your entire job search</span></div></div>
          </div>
          {/* Floating preview cards */}
          <div className="login__float-cards">
            <div className="login__float-card glass-card">
              <div className="login__float-score">92</div>
              <span>Fit Score</span>
            </div>
            <div className="login__float-card glass-card login__float-card--2">
              <Sparkles size={16} />
              <span>Cover Letter Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login__right">
        <div className="login__form-container">
          <Link to="/" className="login__logo">
            <div className="login__logo-icon">C</div>
            <span>CareerLens</span>
          </Link>
          <h2 className="login__title">Welcome Back</h2>
          <p className="login__subtitle">Sign in to continue your job search journey</p>

          <button className="login__google-btn" id="google-signin-btn" type="button" onClick={() => window.location.href = 'http://localhost:5000/auth/google'}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="login__divider"><span>or</span></div>

          {error && <div style={{ color: '#ff4d4f', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '6px' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="login__field">
              <label htmlFor="login-email">Email</label>
              <input 
                type="email" 
                id="login-email" 
                placeholder="john@example.com" 
                className="login__input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="login__field">
              <label htmlFor="login-password">Password</label>
              <input 
                type="password" 
                id="login-password" 
                placeholder="••••••••" 
                className="login__input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn-primary login__submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login__coming-soon">
            <Shield size={14} /> Local email authentication now enabled!
          </p>

          <p className="login__terms">By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
          <p className="login__switch">Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
