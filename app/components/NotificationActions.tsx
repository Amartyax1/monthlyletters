'use client'
import { useState } from 'react'

export function NotificationActions() {
  const [busy, setBusy] = useState(false)

  async function clearAll() {
    setBusy(true)
    try {
      const res = await fetch('/api/notifications/seen', { method: 'POST' })
      if (!res.ok) {
        throw new Error('Failed to mark notifications as read')
      }
      window.location.reload()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      alert('Failed to mark notifications as read')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button 
      onClick={clearAll} 
      disabled={busy}
      className="text-sm text-[#8B6F47] hover:text-[#6B4E2C] underline disabled:opacity-50"
    >
      {busy ? 'Marking...' : 'Mark all read'}
    </button>
  )
}
