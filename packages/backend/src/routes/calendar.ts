import express from 'express'
import { google } from 'googleapis'
import { oauth2Client } from '../config/passport'

const router = express.Router()
const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}

// Get all events
router.get('/events', async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    })

    res.json(response.data.items)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// Create new event
router.post('/events', async (req, res) => {
  try {
    const { title, start, end, extendedProps } = req.body

    const event = {
      summary: title,
      description: extendedProps?.description,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    })

    res.status(201).json(response.data)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// Update event
router.patch('/events/:eventId', async (req, res) => {
  try {
    const { title, start, end, extendedProps } = req.body
    const { eventId } = req.params

    const event = {
      summary: title,
      description: extendedProps?.description,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: event
    })

    res.json(response.data)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Delete event
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params

    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router 