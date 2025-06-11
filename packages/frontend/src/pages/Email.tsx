import { useState, useEffect } from 'react'
import { EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

interface EmailMessage {
  id: string
  snippet: string
  payload: {
    headers: {
      name: string
      value: string
    }[]
  }
}

export default function Email() {
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [isComposing, setIsComposing] = useState(false)
  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    body: '',
  })

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/email/messages')
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching emails:', error)
    }
  }

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/api/email/send', newEmail)
      setIsComposing(false)
      setNewEmail({ to: '', subject: '', body: '' })
      fetchEmails()
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  const getHeader = (message: EmailMessage, name: string) => {
    return message.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email</h1>
        <button
          onClick={() => setIsComposing(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          Compose
        </button>
      </div>

      {/* Email Composition Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Compose Email</h2>
            <form onSubmit={sendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="email"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={6}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <EnvelopeIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg truncate">
                    {getHeader(message, 'subject')}
                  </h3>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {new Date(getHeader(message, 'date')).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  From: {getHeader(message, 'from')}
                </p>
                <p className="mt-2 text-gray-600 line-clamp-2">
                  {message.snippet}
                </p>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Your inbox is empty
          </div>
        )}
      </div>
    </div>
  )
} 