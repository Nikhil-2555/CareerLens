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
