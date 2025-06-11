import express from 'express'
import { google } from 'googleapis'
import { oauth2Client } from '../config/passport'

const router = express.Router()

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}

// Get calendar events
router.get('/events', isAuthenticated, async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    res.json(response.data.items)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    res.status(500).json({ error: 'Failed to fetch calendar events' })
  }
})

// Create calendar event
router.post('/events', async (req, res) => {
  try {
    const { summary, description, start, end } = req.body

    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: (req.user as any)?.accessToken,
    })

    const calendar = google.calendar({ version: 'v3', auth })
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: {
          dateTime: start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: end,
          timeZone: 'UTC',
        },
      },
    })

    res.json(event.data)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    res.status(500).json({ error: 'Failed to create calendar event' })
  }
})

export default router 