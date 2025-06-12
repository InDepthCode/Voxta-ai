import express from 'express'
import OpenAI from 'openai'
import { isAuthenticated } from '../middleware/auth'

const aiRouter = express.Router()

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    console.log('OpenAI API initialized successfully')
  } else {
    console.warn('OpenAI API key not found. AI features will be disabled.')
  }
} catch (error) {
  console.error('Error initializing OpenAI:', error)
}

// Process user message
aiRouter.post('/chat', process.env.NODE_ENV === 'production' ? isAuthenticated : (req, res, next) => next(), async (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' })
    }

    if (!openai) {
      // Return a mock response if OpenAI is not configured
      return res.status(503).json({
        error: 'AI service is currently unavailable. Please check your OpenAI API key configuration.'
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Voxta, an AI assistant that helps users manage their calendar, email, and tasks. You can help schedule meetings, send emails, and set reminders.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const aiResponse = completion.choices[0].message.content

    // TODO: Parse AI response and extract actions (e.g., create calendar event, send email)
    
    res.json({
      message: aiResponse,
      actions: [], // Add extracted actions here
    })
  } catch (error: any) {
    console.error('Error processing message:', error)
    res.status(500).json({ 
      error: error.response?.data?.error || error.message || 'Failed to process message'
    })
  }
})

export { aiRouter } 