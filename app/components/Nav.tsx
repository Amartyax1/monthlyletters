'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function Nav() {
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState<string | null>(null)

  // Check current user session on load
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <nav className="flex items-center justify-between py-3">
      <Link href="/" className="text-xl">MonthLetters</Link>
      <div className="flex gap-3">
        <Link href="/inbox">Inbox</Link>
        <Link href="/compose">Compose</Link>
        <Link href="/sent">Sent</Link>

        {/* Conditional rendering based on whether user is logged in */}
        {email ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm underline"
          >
            Sign out
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => supabase.auth.signInWithOtp({ email: prompt('Email for magic link?') || '' })}
              className="text-sm underline"
            >
              Email Login
            </button>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="text-sm underline"
            >
              Google
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
