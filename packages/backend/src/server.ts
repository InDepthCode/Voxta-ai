import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { emailRouter } from './routes/email'
import { calendarRouter } from './routes/calendar'
import { aiRouter } from './routes/ai'
import { paymentRouter } from './routes/payment'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}))
app.use(express.json())

// Development mode check
const isDevelopment = !process.env.MONGODB_URI || process.env.NODE_ENV === 'development'

// Routes
app.use('/api/email', emailRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/ai', aiRouter)
app.use('/api', paymentRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: isDevelopment ? 'development' : 'production' })
})

// Start server
const startServer = async () => {
  try {
    // Only try to connect to MongoDB if not in development mode
    if (!isDevelopment) {
      await mongoose.connect(process.env.MONGODB_URI!)
      console.log('Connected to MongoDB')
    } else {
      console.log('Running in development mode without MongoDB')
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
      if (isDevelopment) {
        console.log('Development mode enabled - using mock data')
      }
      if (!process.env.GOOGLE_CLIENT_ID) {
        console.log('Google OAuth credentials not found. Authentication will be disabled.')
      }
      if (!process.env.OPENAI_API_KEY) {
        console.log('OpenAI API key not found. AI features will be disabled.')
      }
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.log('Razorpay credentials not found. Payment features will be disabled.')
      }
    })
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

startServer() 