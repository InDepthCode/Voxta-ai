import { Routes, Route, useNavigate } from 'react-router-dom'
import { ClerkProvider, SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Email from './pages/Email'
import Reminders from './pages/Reminders'
import Pricing from './pages/Pricing'

// Get environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const isDevelopment = !clerkPubKey

// Clerk appearance configuration
const appearance = {
  variables: {
    colorPrimary: '#6366f1',
    colorTextOnPrimaryBackground: '#ffffff',
  },
  elements: {
    formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
    footerActionLink: 'text-primary-600 hover:text-primary-700',
  },
}

// Custom sign-in component with redirect handling
function SignInPage() {
  const navigate = useNavigate()
  
  const redirectAfterSignIn = () => {
    // Check if there's a redirect path stored
    const redirectPath = sessionStorage.getItem('redirectPath')
    const selectedPlan = sessionStorage.getItem('selectedPlan')
    
    // Clear stored paths
    sessionStorage.removeItem('redirectPath')
    sessionStorage.removeItem('selectedPlan')
    
    // If user was trying to select a plan, go back to pricing
    if (selectedPlan) {
      return '/pricing'
    }
    // If there's a stored path, redirect there
    else if (redirectPath) {
      return redirectPath
    }
    // Otherwise, go to dashboard
    return '/'
  }

  return (
    <SignIn
      appearance={appearance}
      routing="path"
      path="/sign-in"
      redirectUrl={redirectAfterSignIn()}
      signUpUrl="/sign-up"
    />
  )
}

// Custom sign-up component with redirect handling
function SignUpPage() {
  const navigate = useNavigate()
  
  const redirectAfterSignUp = () => {
    // Similar logic to sign-in
    const redirectPath = sessionStorage.getItem('redirectPath')
    const selectedPlan = sessionStorage.getItem('selectedPlan')
    
    sessionStorage.removeItem('redirectPath')
    sessionStorage.removeItem('selectedPlan')
    
    if (selectedPlan) {
      return '/pricing'
    } else if (redirectPath) {
      return redirectPath
    }
    return '/'
  }

  return (
    <SignUp
      appearance={appearance}
      routing="path"
      path="/sign-up"
      redirectUrl={redirectAfterSignUp()}
      signInUrl="/sign-in"
    />
  )
}

function App() {
  // In development mode, render without Clerk
  if (isDevelopment) {
    return (
      <>
        <Layout isDevelopment={true}>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute isDevelopment={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute isDevelopment={true}>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/email" element={
              <ProtectedRoute isDevelopment={true}>
                <Email />
              </ProtectedRoute>
            } />
            <Route path="/reminders" element={
              <ProtectedRoute isDevelopment={true}>
                <Reminders />
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </>
    )
  }

  // In production mode, use Clerk authentication
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={appearance}
    >
      <>
        <Routes>
          {/* Public routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/pricing" element={
            <Layout isDevelopment={false}>
              <Pricing />
            </Layout>
          } />

          {/* Protected routes */}
          <Route path="/" element={
            <Layout isDevelopment={false}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/calendar" element={
            <Layout isDevelopment={false}>
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/email" element={
            <Layout isDevelopment={false}>
              <ProtectedRoute>
                <Email />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/reminders" element={
            <Layout isDevelopment={false}>
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            </Layout>
          } />
        </Routes>
        <Toaster position="top-right" />
      </>
    </ClerkProvider>
  )
}

export default App 