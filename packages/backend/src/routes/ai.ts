import express from 'express'
import OpenAI from 'openai'

const router = express.Router()

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Process user message
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body

    if (!openai) {
      // Return a mock response if OpenAI is not configured
      return res.json({
        message: "I'm sorry, but I'm currently in development mode and can't process your request. Please configure OpenAI API key to enable AI features.",
        actions: [],
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
  } catch (error) {
    console.error('Error processing message:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

export default router 