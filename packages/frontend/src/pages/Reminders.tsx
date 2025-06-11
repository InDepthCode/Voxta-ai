import { useState, useEffect } from 'react'
import { BellIcon, PlusIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

interface Reminder {
  id: string
  title: string
  description?: string
  dueDate: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/reminders')
      setReminders(response.data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/api/reminders', newReminder)
      setIsCreating(false)
      setNewReminder({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
      })
      fetchReminders()
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
  }

  const toggleReminder = async (id: string, completed: boolean) => {
    try {
      await axios.patch(`http://localhost:3000/api/reminders/${id}`, { completed })
      fetchReminders()
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/reminders/${id}`)
      fetchReminders()
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Reminder
        </button>
      </div>

      {/* Reminder Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Reminder</h2>
            <form onSubmit={createReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={newReminder.dueDate}
                  onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newReminder.priority}
                  onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow ${
              reminder.completed ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleReminder(reminder.id, !reminder.completed)}
                className={`p-2 rounded-lg ${
                  reminder.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <CheckCircleIcon
                  className={`w-6 h-6 ${
                    reminder.completed ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold text-lg ${
                      reminder.completed ? 'line-through text-gray-500' : ''
                    }`}>
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-gray-600 mt-1">{reminder.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-4 mt-2 items-center">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(reminder.dueDate).toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                    {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No reminders yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  )
} 