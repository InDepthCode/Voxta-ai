import express from 'express'
import cors from 'cors'
import session from 'express-session'
import passport from './config/passport'
import authRoutes from './routes/auth'
import calendarRoutes from './routes/calendar'
import emailRoutes from './routes/email'
import remindersRoutes from './routes/reminders'

const app = express()

// Enable CORS with credentials
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}))

app.use(express.json())

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize Passport and restore authentication state from session
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/reminders', remindersRoutes)

export default app 