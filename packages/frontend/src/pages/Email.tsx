import { useState, useEffect } from 'react'
import { EnvelopeIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import axios from '../config/axios'

interface EmailMessage {
  id: string
  snippet: string
  payload: {
    headers: {
      name: string
      value: string
    }[]
  }
  labelIds?: string[]
}

// Sample emails for development
const sampleEmails: EmailMessage[] = [
  {
    id: '1',
    snippet: 'Here are the project updates you requested. I\'ve attached the latest sprint report and the updated timeline...',
    payload: {
      headers: [
        { name: 'subject', value: 'Project Updates - Sprint Review' },
        { name: 'from', value: 'john.doe@example.com' },
        { name: 'date', value: new Date().toISOString() }
      ]
    },
    labelIds: ['INBOX', 'IMPORTANT']
  },
  {
    id: '2',
    snippet: 'The team meeting scheduled for tomorrow has been moved to 2 PM. Please update your calendar accordingly...',
    payload: {
      headers: [
        { name: 'subject', value: 'Meeting Rescheduled: Team Sync-up' },
        { name: 'from', value: 'calendar@company.com' },
        { name: 'date', value: new Date(Date.now() - 86400000).toISOString() }
      ]
    },
    labelIds: ['INBOX']
  },
  {
    id: '3',
    snippet: 'Thank you for your interest in our services. I would love to schedule a call to discuss how we can help...',
    payload: {
      headers: [
        { name: 'subject', value: 'Re: Service Inquiry' },
        { name: 'from', value: 'sales@vendor.com' },
        { name: 'date', value: new Date(Date.now() - 172800000).toISOString() }
      ]
    },
    labelIds: ['INBOX', 'STARRED']
  }
]

export default function Email() {
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await axios.get('/api/email/messages')
      setEmails(response.data)
    } catch (error) {
      console.error('Error fetching emails:', error)
      // Use sample emails in development
      setEmails(sampleEmails)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarEmail = async (emailId: string) => {
    try {
      await axios.post(`/api/email/star/${emailId}`)
      fetchEmails()
    } catch (error) {
      console.error('Error starring email:', error)
      // Update local state in development
      setEmails(prev => prev.map(email => {
        if (email.id === emailId) {
          const labelIds = email.labelIds || []
          return {
            ...email,
            labelIds: labelIds.includes('STARRED')
              ? labelIds.filter(id => id !== 'STARRED')
              : [...labelIds, 'STARRED']
          }
        }
        return email
      }))
    }
  }

  const handleDeleteEmail = async (emailId: string) => {
    try {
      await axios.delete(`/api/email/messages/${emailId}`)
      fetchEmails()
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
      }
    } catch (error) {
      console.error('Error deleting email:', error)
      // Update local state in development
      setEmails(prev => prev.filter(email => email.id !== emailId))
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
      }
    }
  }

  const getEmailHeader = (email: EmailMessage, name: string) => {
    return email.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Email List */}
      <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`flex items-start gap-4 p-4 w-full text-left transition-colors hover:bg-gray-50 ${
                selectedEmail?.id === email.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center p-2">
                <img src="/voxta-logo.svg" alt="Sender" className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {getEmailHeader(email, 'from')}
                  </h3>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(getEmailHeader(email, 'date'))}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getEmailHeader(email, 'subject')}
                </p>
                <p className="text-sm text-gray-500 truncate">{email.snippet}</p>
              </div>
            </button>
          ))}
          {emails.length === 0 && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <EnvelopeIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No emails found</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Content */}
      <div className="hidden lg:block flex-1 bg-gray-50 overflow-y-auto h-[calc(100vh-4rem)]">
        {selectedEmail ? (
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getEmailHeader(selectedEmail, 'subject')}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStarEmail(selectedEmail.id)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    {selectedEmail.labelIds?.includes('STARRED') ? (
                      <StarIconSolid className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteEmail(selectedEmail.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-8 pb-8 border-b">
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">From:</span>
                    <span className="text-gray-900 font-medium">{getEmailHeader(selectedEmail, 'from')}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-gray-900">{new Date(getEmailHeader(selectedEmail, 'date')).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-900 leading-relaxed">{selectedEmail.snippet}</p>
                <p className="text-gray-500 mt-8 pt-8 border-t">
                  [Email content truncated in development mode]
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <EnvelopeIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Select an email to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 