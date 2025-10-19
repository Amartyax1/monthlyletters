'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LetterActionsProps {
  letterId: string
  status: string
  subject: string
  body: string
}

export default function LetterActions({ letterId, status, subject, body }: LetterActionsProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [formSubject, setFormSubject] = useState(subject)
  const [formBody, setFormBody] = useState(body)
  const [busy, setBusy] = useState(false)

  if (status !== 'pending') return null

  async function handleDelete() {
    if (!confirm('Delete this letter? This cannot be undone.')) return
    
    setBusy(true)
    try {
      const res = await fetch(`/api/letters/${letterId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (error) {
      alert('Failed to delete letter')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave() {
    setBusy(true)
    try {
      const res = await fetch(`/api/letters/${letterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: formSubject, body: formBody })
      })
      if (!res.ok) throw new Error('Failed to update')
      setEditing(false)
      router.refresh()
    } catch (error) {
      alert('Failed to update letter')
    } finally {
      setBusy(false)
    }
  }

  if (editing) {
    return (
      <div className="mt-4 space-y-3 border-t pt-4">
        <input
          type="text"
          value={formSubject}
          onChange={(e) => setFormSubject(e.target.value)}
          placeholder="Subject"
          className="input w-full"
        />
        <textarea
          value={formBody}
          onChange={(e) => setFormBody(e.target.value)}
          placeholder="Body"
          rows={6}
          className="input w-full"
        />
        <div className="flex gap-2">
          <button 
            onClick={handleSave} 
            disabled={busy}
            className="btn bg-[#D97706] text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={() => setEditing(false)} 
            disabled={busy}
            className="btn bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 flex gap-3 border-t pt-3">
      <button 
        onClick={() => setEditing(true)}
        className="text-sm text-[#8B6F47] hover:text-[#6B4E2C] underline"
      >
        Edit
      </button>
      <button 
        onClick={handleDelete}
        disabled={busy}
        className="text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
      >
        {busy ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
