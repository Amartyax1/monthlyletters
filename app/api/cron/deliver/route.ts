import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// --- Helper to verify cron secret ---
function ensureSecret(req: Request) {
  const token = req.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  return token === expected
}

// --- Main GET route handler ---
export async function GET(req: Request) {
  if (!ensureSecret(req)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key
  )

  const today = new Date().toISOString().slice(0, 10)

  const { data: letters, error } = await supabase
    .from('letters')
    .select('id, recipient_email')
    .eq('status', 'pending')
    .lte('deliver_on', today)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!letters?.length) return NextResponse.json({ delivered: 0 })

  // Map emails to user IDs
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

  const emailToId = new Map<string, string>()
  users.forEach(u => {
    if (u.email) emailToId.set(u.email.toLowerCase(), u.id)
  })

  const deliverables = letters.filter(l =>
    emailToId.has(l.recipient_email.toLowerCase())
  )

  const deliveriesRows = deliverables.map(l => ({
    letter_id: l.id,
    recipient_id: emailToId.get(l.recipient_email.toLowerCase())!
  }))

  if (deliveriesRows.length) {
    // Insert deliveries
    const { error: insDelErr } = await supabase
      .from('deliveries')
      .insert(deliveriesRows)
    if (insDelErr)
      return NextResponse.json({ error: insDelErr.message }, { status: 500 })

    // Update letters’ status
    const ids = deliverables.map(d => d.id)
    const { error: updErr } = await supabase
      .from('letters')
      .update({ status: 'delivered' })
      .in('id', ids)
    if (updErr)
      return NextResponse.json({ error: updErr.message }, { status: 500 })

    // Create notifications
    const notifs = deliveriesRows.map(d => ({
      user_id: d.recipient_id,
      type: 'letter_received',
      payload: { letter_id: d.letter_id },
    }))

    const { error: notifErr } = await supabase
      .from('notifications')
      .insert(notifs)
    if (notifErr)
      return NextResponse.json({ error: notifErr.message }, { status: 500 })
  }

  return NextResponse.json({ delivered: deliveriesRows.length })
}
