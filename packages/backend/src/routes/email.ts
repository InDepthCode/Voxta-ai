import express from 'express'
import { google } from 'googleapis'

const router = express.Router()

// Get emails
router.get('/messages', async (req, res) => {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: (req.user as any)?.accessToken,
    })

    const gmail = google.gmail({ version: 'v1', auth })
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    })

    const messages = await Promise.all(
      (response.data.messages || []).map(async (message) => {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        })
        return details.data
      })
    )

    res.json(messages)
  } catch (error) {
    console.error('Error fetching emails:', error)
    res.status(500).json({ error: 'Failed to fetch emails' })
  }
})

// Send email
router.post('/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body

    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: (req.user as any)?.accessToken,
    })

    const gmail = google.gmail({ version: 'v1', auth })
    
    const message = [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      'Content-Transfer-Encoding: 7bit\n',
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      body,
    ].join('')

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    res.json(response.data)
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

export default router 