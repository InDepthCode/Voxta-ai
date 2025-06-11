import express from 'express'
import passport from 'passport'

const router = express.Router()

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.modify'
    ]
  })
)

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/')
  }
)

// Get current user
router.get('/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  res.json(req.user)
})

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' })
  })
})

export default router 