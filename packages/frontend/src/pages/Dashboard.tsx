import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MicrophoneIcon, PaperAirplaneIcon, CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import axios from '../config/axios'

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
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>([
    {
      text: "👋 Hi! I'm Voxta, your AI assistant. I'm here to help you manage your calendar, emails, and tasks. Since I'm in development mode, some features might be limited, but feel free to chat with me!",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [recentEmails, setRecentEmails] = useState<EmailMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUpcomingEvents()
    fetchRecentEmails()
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('/api/calendar/events')
      setUpcomingEvents(response.data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching events:', error)
      // Set placeholder data for development
      setUpcomingEvents([
        {
          id: '1',
          summary: 'Team Meeting',
          start: { dateTime: new Date().toISOString() }
        },
        {
          id: '2',
          summary: 'Project Review',
          start: { dateTime: new Date(Date.now() + 86400000).toISOString() }
        }
      ])
    }
  }

  const fetchRecentEmails = async () => {
    try {
      const response = await axios.get('/api/email/messages')
      setRecentEmails(response.data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching emails:', error)
      // Set placeholder data for development
      setRecentEmails([
        {
          id: '1',
          snippet: 'Here are the project updates you requested...',
          payload: {
            headers: [
              { name: 'subject', value: 'Project Updates' },
              { name: 'from', value: 'john.doe@example.com' }
            ]
          }
        },
        {
          id: '2',
          snippet: 'The meeting has been rescheduled to...',
          payload: {
            headers: [
              { name: 'subject', value: 'Meeting Rescheduled' },
              { name: 'from', value: 'calendar@company.com' }
            ]
          }
        }
      ])
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

    const timestamp = new Date()
    setMessages(prev => [...prev, { text: message, isUser: true, timestamp }])
    setMessage('')
    setIsLoading(true)
    setIsTyping(true)
    
    try {
      const response = await axios.post('/api/ai/chat', { message })
      setIsTyping(false)
      setMessages(prev => [...prev, { text: response.data.message, isUser: false, timestamp: new Date() }])
      
      if (response.data.actions?.length > 0) {
        fetchUpcomingEvents()
        fetchRecentEmails()
      }
    } catch (error: any) {
      console.error('Error processing message:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, { 
        text: "I understand you're trying to interact with me. Since I'm in development mode, I can't perform all actions yet. But I'm here to chat and help you understand how I can assist you once fully implemented!", 
        isUser: false,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const getEmailHeader = (message: EmailMessage, name: string) => {
    return message.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 h-full">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-white rounded-xl shadow-sm mb-6 scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-end gap-2">
                {!msg.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <img src="/voxta-logo.svg" alt="Voxta" className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.isUser
                      ? 'bg-primary-600 text-white shadow-sm ml-4'
                      : 'bg-gray-50 text-gray-900 shadow-sm mr-4'
                  } transform transition-all duration-200 ease-out animate-fade-in`}
                >
                  {msg.text}
                </div>
                {msg.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-primary-600" />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <img src="/voxta-logo.svg" alt="Voxta" className="w-5 h-5" />
              </div>
              <div className="bg-gray-50 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <button
            type="button"
            onClick={startListening}
            disabled={isListening}
            className={`flex-shrink-0 p-3 rounded-xl border ${
              isListening
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            } transition-colors`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-4 px-4 py-2 bg-white border border-gray-200 rounded-xl focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-gray-900 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="flex-shrink-0 p-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Calendar Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link
              to="/calendar"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex flex-col items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{event.summary}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.start.dateTime).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Emails</h2>
            <Link
              to="/email"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex flex-col items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getEmailHeader(email, 'subject')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    From: {getEmailHeader(email, 'from')}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">{email.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 