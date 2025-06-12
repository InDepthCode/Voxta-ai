import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { OAuth2Client } from 'google-auth-library'

// Initialize OAuth2Client for reuse across routes
export const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
  redirectUri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
})

// Passport session setup
passport.serializeUser((user: any, done) => {
  done(null, user)
})

passport.deserializeUser((user: any, done) => {
  done(null, user)
})

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // TODO: Save user to database
      return done(null, { ...profile, accessToken, refreshToken })
    } catch (error) {
      return done(error as Error)
    }
  }))
} else {
  console.warn('Google OAuth credentials not found. Authentication will be disabled.')
}

export default passport 