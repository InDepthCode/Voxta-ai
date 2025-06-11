import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MicrophoneIcon, PaperAirplaneIcon, CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import axios from 'axios'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime: string }
}

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

export default function Dashboard() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [recentEmails, setRecentEmails] = useState<EmailMessage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUpcomingEvents()
    fetchRecentEmails()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/calendar/events')
      setUpcomingEvents(response.data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchRecentEmails = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/email/messages')
      setRecentEmails(response.data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching emails:', error)
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Speech recognition is not supported in this browser.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to chat
    setMessages(prev => [...prev, { text: message, isUser: true }])
    
    try {
      const response = await axios.post('http://localhost:3000/api/ai/chat', { message })
      setMessages(prev => [...prev, { text: response.data.message, isUser: false }])
      
      // Refresh data if AI made any changes
      if (response.data.actions?.length > 0) {
        fetchUpcomingEvents()
        fetchRecentEmails()
      }
    } catch (error) {
      console.error('Error processing message:', error)
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error processing your request.', 
        isUser: false 
      }])
    }

    setMessage('')
  }

  const getEmailHeader = (message: EmailMessage, name: string) => {
    return message.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.isUser
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              👋 Hi! I'm Voxta. Ask me to help you manage your calendar, emails, or set reminders.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={startListening}
            className={`btn ${
              isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-secondary'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message or use voice input..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button type="submit" className="btn btn-primary">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Sidebar */}
      <div className="lg:w-80 space-y-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Upcoming Events</h2>
            <Link to="/calendar" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded">
                  <CalendarIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{event.summary}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.start.dateTime).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Recent Emails</h2>
            <Link to="/email" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded">
                  <EnvelopeIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">
                    {getEmailHeader(email, 'subject')}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    From: {getEmailHeader(email, 'from')}
                  </p>
                </div>
              </div>
            ))}
            {recentEmails.length === 0 && (
              <p className="text-gray-500 text-sm">No recent emails</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 