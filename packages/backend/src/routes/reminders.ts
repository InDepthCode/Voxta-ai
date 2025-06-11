import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// In-memory storage for reminders (replace with database in production)
let reminders = []

// Get all reminders
router.get('/', (req, res) => {
  res.json(reminders)
})

// Create a new reminder
router.post('/', (req, res) => {
  const { title, description, dueDate, priority } = req.body
  
  if (!title || !dueDate) {
    return res.status(400).json({ error: 'Title and due date are required' })
  }

  const newReminder = {
    id: uuidv4(),
    title,
    description,
    dueDate,
    priority: priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString()
  }

  reminders.push(newReminder)
  res.status(201).json(newReminder)
})

// Update a reminder
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const reminderIndex = reminders.findIndex(r => r.id === id)

  if (reminderIndex === -1) {
    return res.status(404).json({ error: 'Reminder not found' })
  }

  const updatedReminder = {
    ...reminders[reminderIndex],
    ...req.body,
    id // Ensure ID cannot be changed
  }

  reminders[reminderIndex] = updatedReminder
  res.json(updatedReminder)
})

// Delete a reminder
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const reminderIndex = reminders.findIndex(r => r.id === id)

  if (reminderIndex === -1) {
    return res.status(404).json({ error: 'Reminder not found' })
  }

  reminders = reminders.filter(r => r.id !== id)
  res.status(204).send()
})

export default router 