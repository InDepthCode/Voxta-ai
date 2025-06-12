import { parseISO, addHours, addDays, addWeeks } from 'date-fns'
import axios from '../config/axios'

interface TaskResult {
  success: boolean
  message: string
  data?: any
}

class TaskExecutor {
  private parseDateTime(text: string): Date | null {
    const now = new Date()
    
    // Handle relative time expressions
    if (text.includes('tomorrow')) {
      return addDays(now, 1)
    }
    if (text.includes('next week')) {
      return addWeeks(now, 1)
    }
    if (text.match(/in \d+ hours?/)) {
      const hours = parseInt(text.match(/in (\d+) hours?/)?.[1] || '0')
      return addHours(now, hours)
    }

    // Try to parse specific time
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
    if (timeMatch) {
      const [_, hours, minutes = '0', meridiem] = timeMatch
      const date = new Date()
      let hour = parseInt(hours)
      
      if (meridiem.toLowerCase() === 'pm' && hour < 12) {
        hour += 12
      } else if (meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0
      }
      
      date.setHours(hour, parseInt(minutes))
      return date
    }

    return null
  }

  private extractEmail(text: string): string | null {
    const emailMatch = text.match(/\b[\w\.-]+@[\w\.-]+\.\w+\b/)
    return emailMatch ? emailMatch[0] : null
  }

  async executeCommand(command: string): Promise<TaskResult> {
    const lowerCommand = command.toLowerCase()
    
    try {
      // Calendar commands
      if (lowerCommand.includes('schedule') || lowerCommand.includes('meeting')) {
        const dateTime = this.parseDateTime(command)
        if (!dateTime) {
          return {
            success: false,
            message: 'Could not determine the date/time for the event. Please specify when you want to schedule it.'
          }
        }

        const event = {
          title: command.replace(/schedule|meeting|at|on|for/gi, '').trim(),
          start: dateTime.toISOString(),
          end: addHours(dateTime, 1).toISOString()
        }

        await axios.post('/api/calendar/events', event)
        return {
          success: true,
          message: 'Event scheduled successfully',
          data: event
        }
      }

      // Email commands
      if (lowerCommand.includes('email') || lowerCommand.includes('send')) {
        const to = this.extractEmail(command)
        if (!to) {
          return {
            success: false,
            message: 'Could not determine the email recipient. Please specify an email address.'
          }
        }

        const subject = command
          .replace(/email|send|to|about/gi, '')
          .replace(to, '')
          .trim()

        const draft = {
          to,
          subject,
          body: '' // Will be filled in by the user
        }

        await axios.post('/api/email/drafts', draft)
        return {
          success: true,
          message: 'Email draft created',
          data: draft
        }
      }

      // Reminder/Task commands
      if (lowerCommand.includes('reminder') || lowerCommand.includes('task')) {
        const dateTime = this.parseDateTime(command) || addHours(new Date(), 1)
        
        const task = {
          title: command.replace(/reminder|task|in|at|on|for/gi, '').trim(),
          dueDate: dateTime.toISOString(),
          completed: false
        }

        await axios.post('/api/tasks', task)
        return {
          success: true,
          message: 'Reminder/task created successfully',
          data: task
        }
      }

      return {
        success: false,
        message: 'Command not recognized. Please try a different command.'
      }
    } catch (error: any) {
      console.error('Task execution error:', error)
      return {
        success: false,
        message: error.message || 'Failed to execute command'
      }
    }
  }
}

export const taskExecutor = new TaskExecutor() 