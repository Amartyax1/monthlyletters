'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

const options = [
  { value: 'cozy', label: 'Cozy', emoji: '☕' },
  { value: 'handwritten', label: 'Handwritten', emoji: '✍️' },
  { value: 'dark', label: 'Dark', emoji: '🌙' }
]

export default function ThemePicker({ initialTheme }: { initialTheme: string }) {
  const supabase = supabaseBrowser()
  const [theme, setTheme] = useState(initialTheme)
  const [saving, setSaving] = useState(false)

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'handwritten')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'handwritten') {
      document.documentElement.classList.add('handwritten')
    }
  }, [theme])

  async function save(t: string) {
    setSaving(true)
    setTheme(t)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }
    
    const { error } = await supabase
      .from('users_profile')
      .upsert({ id: user.id, theme: t })
    
    if (error) {
      console.error('Error saving theme:', error)
      alert('Failed to save theme')
    }
    
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => save(option.value)}
            disabled={saving}
            className={`
              flex-1 px-4 py-3 rounded-lg border-2 transition-all
              ${theme === option.value 
                ? 'bg-[#D97706] text-white border-[#D97706] shadow-md' 
                : 'bg-white border-gray-300 hover:border-[#D97706] hover:shadow-sm'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="text-2xl mb-1">{option.emoji}</div>
            <div className="font-semibold">{option.label}</div>
          </button>
        ))}
      </div>
      
      {saving && (
        <p className="text-sm text-gray-500 text-center">Saving...</p>
      )}
    </div>
  )
}
