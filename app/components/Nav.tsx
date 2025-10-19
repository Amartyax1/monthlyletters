import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import NotificationBell from './NotificationBell'
import { NotificationActions } from './NotificationActions'
import SignOutButton from './SignOutButton'

interface NavProps {
  userEmail: string | null
  displayName: string | null
}

export default function Nav({ userEmail, displayName }: NavProps) {
  return (
    <nav className="flex items-center gap-6">
      {/* Navigation Links */}
      <div className="flex gap-3">
        <Link href="/inbox" className="hover:text-[#8B6F47]">Inbox</Link>
        <Link href="/compose" className="hover:text-[#8B6F47]">Compose</Link>
        <Link href="/sent" className="hover:text-[#8B6F47]">Sent</Link>
        <Link href="/settings" className="hover:text-[#8B6F47]">Settings</Link>
      </div>
      
      {/* Notification section - only show when logged in */}
      {userEmail && (
        <div className="flex items-center gap-3">
          <NotificationBell />
          <NotificationActions />
        </div>
      )}
      
      {/* User info and auth */}
      <div className="flex items-center gap-3 ml-auto">
        {userEmail ? (
          <>
            {displayName && (
              <span className="text-sm font-medium">{displayName}</span>
            )}
            <SignOutButton />
          </>
        ) : (
          <div className="flex gap-2">
            <Link href="/auth/login" className="text-sm underline hover:text-[#8B6F47]">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
