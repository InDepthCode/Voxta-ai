import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MicrophoneIcon, PaperAirplaneIcon, CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import axios from '../config/axios'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

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

// Sample data for demonstration
const upcomingEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    time: '10:00 AM Today',
    attendees: [
      'https://ui-avatars.com/api/?name=John+Doe&background=random',
      'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
      'https://ui-avatars.com/api/?name=Mike+Johnson&background=random',
    ],
  },
  {
    id: '2',
    title: 'Project Review',
    time: '2:00 PM Tomorrow',
    attendees: [
      'https://ui-avatars.com/api/?name=Sarah+Wilson&background=random',
      'https://ui-avatars.com/api/?name=Alex+Brown&background=random',
    ],
  },
]

const recentEmails = [
  {
    id: '1',
    subject: 'Project Updates',
    from: 'john.doe@example.com',
  },
  {
    id: '2',
    subject: 'Meeting Rescheduled',
    from: 'calendar@company.com',
  },
]

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "👋 Hi! I'm Voxta, your AI assistant. I'm here to help you manage your calendar, emails, and tasks. Since I'm in development mode, some features might be limited, but feel free to chat with me!",
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !isListening) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Add assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm in development mode, but I'll be able to help you with that soon!",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)

    setInput('')
  }

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-900"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {message.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                  <img src={import.meta.env.BASE_URL + 'voxta-logo.svg'} alt="Voxta" className="w-6 h-6" />
                </div>
              )}
              <div
                className={`relative max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span 
                  className={`absolute bottom-0 translate-y-full mt-1 text-xs text-gray-400 dark:text-gray-500 ${
                    message.role === 'user' ? 'right-0' : 'left-0'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-dark-800 border-t dark:border-dark-700">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-600'
              }`}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!input.trim() && !isListening}
              className="p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 p-4 space-y-4 bg-gray-100 dark:bg-dark-800 overflow-y-auto border-l border-gray-200 dark:border-dark-700">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
              <Link
                to="/calendar"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{event.time}</p>
                  <div className="flex -space-x-2 mt-2">
                    {event.attendees.map((avatar, i) => (
                      <img
                        key={i}
                        src={avatar}
                        alt={`Attendee ${i + 1}`}
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-700"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Emails</h2>
              <Link
                to="/email"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{email.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{email.from}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 