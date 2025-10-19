'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

interface ProfileSettingsProps {
  initialDisplayName: string
  userEmail: string
}

export default function ProfileSettings({ initialDisplayName, userEmail }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [saving, setSaving] = useState(false)
  const supabase = supabaseBrowser()
  const router = useRouter()

  // Generate avatar initial
  const initial = displayName ? displayName[0].toUpperCase() : userEmail[0].toUpperCase()

  async function handleSave() {
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }
    
    const { error } = await supabase
      .from('users_profile')
      .upsert({ id: user.id, display_name: displayName })
    
    if (error) {
      console.error('Error saving display name:', error)
      alert('Failed to save display name')
    } else {
      router.refresh() // Refresh to update Nav
    }
    
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#D97706] text-white flex items-center justify-center text-2xl font-bold">
          {initial}
        </div>
        <div className="text-sm text-gray-600">
          Your avatar is generated from your name
        </div>
      </div>

      {/* Display Name Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="input w-full"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="text"
          value={userEmail}
          disabled
          className="input w-full bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn bg-[#D97706] text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-[#B45309]"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
