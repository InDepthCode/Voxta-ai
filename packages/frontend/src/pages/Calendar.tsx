import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core'
import axios from '../config/axios'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event?: {
    id?: string
    title: string
    start: string
    end: string
    description?: string
  }
  onSave: (event: Omit<EventInput, 'id'>) => void
  onDelete?: () => void
}

function EventModal({ isOpen, onClose, event, onSave, onDelete }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [start, setStart] = useState(event?.start || '')
  const [end, setEnd] = useState(event?.end || '')
  const [description, setDescription] = useState(event?.description || '')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStart(event.start)
      setEnd(event.end)
      setDescription(event.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      start,
      end,
      extendedProps: { description }
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {event?.id ? 'Edit Event' : 'Create Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            {event?.id && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Sample events for development
const sampleEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 3600000).toISOString(),
    description: 'Weekly team sync-up'
  },
  {
    id: '2',
    title: 'Project Review',
    start: new Date(Date.now() + 86400000).toISOString(),
    end: new Date(Date.now() + 90000000).toISOString(),
    description: 'Review Q1 project progress'
  }
]

export default function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/calendar/events')
      const formattedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description
      }))
      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
      // Use sample events in development
      setEvents(sampleEvents)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      description: ''
    })
    setIsModalOpen(true)
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      description: clickInfo.event.extendedProps.description
    })
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (eventData: Omit<EventInput, 'id'>) => {
    try {
      if (selectedEvent?.id) {
        // Update existing event
        await axios.patch(`/api/calendar/events/${selectedEvent.id}`, eventData)
      } else {
        // Create new event
        await axios.post('/api/calendar/events', eventData)
      }
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      // In development, update the local state directly
      if (selectedEvent?.id) {
        setEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { ...eventData, id: event.id }
            : event
        ))
      } else {
        setEvents(prev => [...prev, { ...eventData, id: String(Date.now()) }])
      }
    }
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return

    try {
      await axios.delete(`/api/calendar/events/${selectedEvent.id}`)
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      // In development, update the local state directly
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id))
    }
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="p-6 relative">
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
            />
          </div>
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent as any}
        onSave={handleSaveEvent}
        onDelete={selectedEvent?.id ? handleDeleteEvent : undefined}
      />
    </div>
  )
} 