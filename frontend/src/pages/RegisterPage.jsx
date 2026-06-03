import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Target, FileText, BarChart3, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import './LoginPage.css'

/**
 * Compute password strength (0-4) and a label.
 */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

const BAR_CLASSES = ['', 'auth__pw-bar--active-weak', 'auth__pw-bar--active-fair', 'auth__pw-bar--active-good', 'auth__pw-bar--active-strong']

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side password checks
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Backend may return detailed password errors
        const msg = data.error?.details?.password
          ? data.error.details.password.join('. ')
          : data.error?.message || 'Registration failed'
        throw new Error(msg)
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
          <h2 className="auth__title">Create Account</h2>
          <p className="auth__subtitle">Join CareerLens to supercharge your job search</p>

          {error && (
            <div className="auth__message auth__message--error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>
            <div className="auth__field">
              <label htmlFor="register-name">Full Name</label>
              <div className="auth__input-wrapper">
                <User size={16} className="auth__input-icon" />
                <input 
                  type="text" 
                  id="register-name" 
                  placeholder="John Doe" 
                  className="auth__input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="auth__field">
              <label htmlFor="register-email">Email</label>
              <div className="auth__input-wrapper">
                <Mail size={16} className="auth__input-icon" />
                <input 
                  type="email" 
                  id="register-email" 
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
              <label htmlFor="register-password">Password</label>
              <div className="auth__input-wrapper">
                <Lock size={16} className="auth__input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="register-password" 
                  placeholder="Min 8 chars, 1 uppercase, 1 number" 
                  className="auth__input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              {/* Password Strength Indicator */}
              {password && (
                <>
                  <div className="auth__pw-strength">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`auth__pw-bar ${i <= strength.score ? BAR_CLASSES[strength.score] : ''}`}
                      />
                    ))}
                  </div>
                  <div className="auth__pw-label">{strength.label}</div>
                </>
              )}
            </div>

            <button type="submit" className="btn-primary auth__submit" disabled={isLoading}>
              {isLoading && <span className="auth__spinner" />}
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth__terms">By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
          <p className="auth__switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
