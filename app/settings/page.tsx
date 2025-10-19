import { supabaseServer } from '@/lib/supabaseServer'
import ThemePicker from '@/app/components/ThemePicker'
import ProfileSettings from '@/app/components/ProfileSettings'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/')
  
  const { data: profile } = await supabase
    .from('users_profile')
    .select('theme, display_name')
    .eq('id', user.id)
    .maybeSingle()
  
  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-hand)' }}>
        Settings
      </h1>
      
      <div className="space-y-8">
        {/* Profile Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Profile</h2>
          <ProfileSettings 
            initialDisplayName={profile?.display_name || ''} 
            userEmail={user.email || ''}
          />
        </div>

        {/* Theme Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">Theme</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose how MonthLetters looks and feels
          </p>
          <ThemePicker initialTheme={profile?.theme ?? 'cozy'} />
        </div>
      </div>
    </div>
  )
}

