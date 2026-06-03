import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import './LoginPage.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Something went wrong')
      }

      setSuccess(data.message || 'If an account with that email exists, a reset link has been sent.')
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth auth--centered">
      {/* Background orbs */}
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

          <h2 className="auth__title">Forgot Password?</h2>
          <p className="auth__subtitle">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="auth__message auth__message--error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="auth__message auth__message--success">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth__field">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="auth__input-wrapper">
                  <Mail size={16} className="auth__input-icon" />
                  <input
                    type="email"
                    id="forgot-email"
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

              <button type="submit" className="btn-primary auth__submit" disabled={isLoading}>
                {isLoading && <span className="auth__spinner" />}
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="auth__switch" style={{ marginTop: '24px' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
