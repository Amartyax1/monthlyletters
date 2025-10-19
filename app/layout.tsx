import './globals.css'
import { Handlee, Inter } from 'next/font/google'
import Nav from './components/Nav'
import { supabaseServer } from '@/lib/supabaseServer'

const handwriting = Handlee({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-hand',
})
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user theme server-side
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  let theme = 'cozy'
  let displayName = null
  
  if (user) {
    const { data: profile } = await supabase
      .from('users_profile')
      .select('theme, display_name')
      .eq('id', user.id)
      .maybeSingle()
    
    theme = profile?.theme || 'cozy'
    displayName = profile?.display_name
  }

  // Build class string for html element
  const htmlClass = `${handwriting.variable} ${body.variable} ${theme === 'dark' ? 'dark' : ''} ${theme === 'handwritten' ? 'handwritten' : ''}`

  return (
    <html lang="en" className={htmlClass}>
      <body className="max-w-2xl mx-auto p-4 font-[var(--font-body)] bg-[#FBF3E4] text-[#2B2B2B] min-h-screen">
        <header className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            MonthLetters
          </h1>
          <Nav userEmail={user?.email || null} displayName={displayName} />
        </header>
        
        <main className="space-y-4">{children}</main>
      </body>
    </html>
  )
}
