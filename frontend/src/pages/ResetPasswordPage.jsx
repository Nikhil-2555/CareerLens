import { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import './LoginPage.css'

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

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
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
      const response = await fetch(`http://localhost:5000/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        const msg = data.error?.details?.password
          ? data.error.details.password.join('. ')
          : data.error?.message || 'Reset failed'
        throw new Error(msg)
      }

      // Store token (user is auto-logged in after reset)
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken)
      }

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth auth--centered">
      <div className="auth__bg-orbs">
        <div className="auth__orb auth__orb--1"></div>
        <div className="auth__orb auth__orb--2"></div>
        <div className="auth__orb auth__orb--3"></div>
      </div>

      <div className="auth__right">
        <div className="auth__form-container">
          <Link to="/" className="auth__logo">
            <div className="auth__logo-icon">C</div>
            <span>CareerLens</span>
          </Link>

          <h2 className="auth__title">Set New Password</h2>
          <p className="auth__subtitle">
            Choose a strong password for your CareerLens account.
          </p>

          {error && (
            <div className="auth__message auth__message--error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success ? (
            <div className="auth__message auth__message--success">
              <CheckCircle size={16} />
              Password reset successful! Redirecting to dashboard…
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth__field">
                <label htmlFor="reset-password">New Password</label>
                <div className="auth__input-wrapper">
                  <Lock size={16} className="auth__input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reset-password"
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

              <div className="auth__field">
                <label htmlFor="reset-confirm">Confirm Password</label>
                <div className="auth__input-wrapper">
                  <Lock size={16} className="auth__input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reset-confirm"
                    placeholder="Re-enter your new password"
                    className="auth__input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary auth__submit" disabled={isLoading}>
                {isLoading && <span className="auth__spinner" />}
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="auth__switch" style={{ marginTop: '24px' }}>
            <Link to="/login">← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
