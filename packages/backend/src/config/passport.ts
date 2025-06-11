import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { OAuth2Client } from 'google-auth-library'

// Initialize OAuth2Client for reuse across routes
export const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/api/auth/google/callback'
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Store tokens in oauth2Client
        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        // Create user object
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          picture: profile.photos?.[0]?.value,
          accessToken,
          refreshToken,
        }

        return done(null, user)
      } catch (error) {
        return done(error as Error)
      }
    }
  )
)

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user)
})

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user)
})

export default passport 