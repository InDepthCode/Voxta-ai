import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  isDevelopment?: boolean
}

export default function ProtectedRoute({ children, isDevelopment = false }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = isDevelopment ? { isSignedIn: true, isLoaded: true } : useAuth()

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isDevelopment) {
      // Store the current path to redirect back after sign in
      sessionStorage.setItem('redirectPath', window.location.pathname)
      navigate('/sign-in')
    }
  }, [isSignedIn, isLoaded, navigate, isDevelopment])

  // Show nothing while loading
  if (!isLoaded) {
    return null
  }

  // If in development mode or signed in, render the protected content
  if (isDevelopment || isSignedIn) {
    return <>{children}</>
  }

  // This should never be reached due to the redirect in useEffect
  return null
} 