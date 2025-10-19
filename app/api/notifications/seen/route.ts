import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST() {
  const supabase = supabaseServer()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const { error } = await supabase
    .from('notifications')
    .update({ seen: true })
    .eq('user_id', user.id)
    .eq('seen', false)

  if (error) {
    console.error('Error marking notifications as seen:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
