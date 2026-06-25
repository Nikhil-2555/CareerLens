import { Routes, Route } from 'react-router-dom'
import { SignIn, SignUp } from '@clerk/clerk-react'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import AnalysisPage from './pages/AnalysisPage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import CoverLetterPage from './pages/CoverLetterPage'
import JobMatcherPage from './pages/JobMatcherPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in/*" element={
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: 'var(--cl-bg)',
        }}>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/dashboard" />
        </div>
      } />
      <Route path="/sign-up/*" element={
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: 'var(--cl-bg)',
        }}>
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/dashboard" />
        </div>
      } />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/analyse" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
      <Route path="/analysis-results" element={<ProtectedRoute><AnalysisResultsPage /></ProtectedRoute>} />
      <Route path="/job-matcher" element={<ProtectedRoute><JobMatcherPage /></ProtectedRoute>} />
      <Route path="/coverletter" element={<ProtectedRoute><CoverLetterPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
