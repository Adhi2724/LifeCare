'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Reminder {
  id: string
  medicineName: string
  time: string
  whatsappNumber?: string
  status: 'upcoming' | 'due' | 'taken' | 'snoozed' | 'missed'
  lastTriggeredAt?: string
  snoozeMinutes?: number
  createdAt: string
}

export default function MediRemindPage() {
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [medicineName, setMedicineName] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [dueReminders, setDueReminders] = useState<Reminder[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
      })
    }
  }, [])

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders()
  }, [])

  // Check for due reminders every minute
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)

      const due = reminders.filter(r =>
        r.status === 'upcoming' && r.time === currentTime
      )

      if (due.length > 0) {
        setDueReminders(due)

        // Show browser notification
        if (notificationPermission === 'granted') {
          due.forEach(reminder => {
            new Notification(`Time to take ${reminder.medicineName}`, {
              body: `Reminder at ${reminder.time}`,
              icon: '/favicon.ico'
            })
          })
        }

        // Update status to due
        due.forEach(reminder => {
          updateReminder(reminder.id, { status: 'due' })
        })
      }
    }

    const interval = setInterval(checkDueReminders, 60000) // Check every minute
    checkDueReminders() // Check immediately

    return () => clearInterval(interval)
  }, [reminders, notificationPermission])

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const createReminder = async () => {
    if (!medicineName.trim() || !reminderTime.trim()) {
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: medicineName.trim(),
          time: reminderTime,
          whatsappNumber: whatsappNumber.trim() || undefined
        })
      })

      if (response.ok) {
        const newReminder = await response.json()
        setReminders([...reminders, newReminder])
        setMedicineName('')
        setReminderTime('')
        setWhatsappNumber('')
      }
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
  }

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updated = await response.json()
        setReminders(reminders.map(r => r.id === id ? updated : r))
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReminders(reminders.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const markAsTaken = (id: string) => {
    updateReminder(id, { status: 'taken' })
    setDueReminders(dueReminders.filter(r => r.id !== id))
  }

  const snoozeReminder = (id: string) => {
    updateReminder(id, { status: 'snoozed', snoozeMinutes: 5 })
    setDueReminders(dueReminders.filter(r => r.id !== id))
  }

  const dismissAlert = (id: string) => {
    setDueReminders(dueReminders.filter(r => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
            Medi Remind
          </h1>
          <p className="text-gray-600 text-center">
            Track medicines, set reminder times, and detect missed doses.
          </p>
        </div>

        {/* Due Reminders Alert */}
        {dueReminders.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">
              ⏰ Active Reminders
            </h2>
            <div className="space-y-3">
              {dueReminders.map(reminder => (
                <div key={reminder.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Time to take {reminder.medicineName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Scheduled for {reminder.time}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => markAsTaken(reminder.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Mark as Taken
                    </button>
                    <button
                      onClick={() => snoozeReminder(reminder.id)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                      Snooze 5min
                    </button>
                    <button
                      onClick={() => dismissAlert(reminder.id)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Reminder Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Add New Reminder
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="Enter medicine name (e.g., Aspirin, Ibuprofen)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number (Optional - for future notifications)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="button"
              onClick={createReminder}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Add Reminder
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Your Reminders
          </h2>

          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reminders added yet. Add one above to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    reminder.status === 'taken' ? 'bg-green-50 border-green-200' :
                    reminder.status === 'missed' ? 'bg-red-50 border-red-200' :
                    reminder.status === 'snoozed' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {reminder.medicineName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ⏰ {reminder.time}
                      {reminder.whatsappNumber && (
                        <span className="ml-2 text-blue-600">
                          📱 WhatsApp: {reminder.whatsappNumber}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {reminder.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteReminder(reminder.id)}
                    className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
