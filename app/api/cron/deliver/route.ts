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
  const startTime = Date.now()
  console.log('[CRON] Delivery job started at', new Date().toISOString())

  // Verify authorization
  if (!ensureSecret(req)) {
    console.error('[CRON] Unauthorized access attempt')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().slice(0, 10)
  console.log('[CRON] Checking for letters to deliver on or before:', today)

  // Fetch pending letters ready for delivery
  const { data: letters, error } = await supabase
    .from('letters')
    .select('id, recipient_email')
    .eq('status', 'pending')
    .lte('deliver_on', today)

  if (error) {
    console.error('[CRON] Error fetching letters:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[CRON] Found ${letters?.length || 0} pending letters`)

  if (!letters?.length) {
    console.log('[CRON] No letters to deliver')
    return NextResponse.json({ delivered: 0 })
  }

  // Map emails to user IDs
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  
  if (listErr) {
    console.error('[CRON] Error listing users:', listErr.message)
    return NextResponse.json({ error: listErr.message }, { status: 500 })
  }

  const emailToId = new Map<string, string>()
  users.forEach(u => {
    if (u.email) emailToId.set(u.email.toLowerCase(), u.id)
  })

  const deliverables = letters.filter(l =>
    emailToId.has(l.recipient_email.toLowerCase())
  )

  console.log(`[CRON] ${deliverables.length} letters have valid recipients`)

  const deliveriesRows = deliverables.map(l => ({
    letter_id: l.id,
    recipient_id: emailToId.get(l.recipient_email.toLowerCase())!
  }))

  if (deliveriesRows.length) {
    // Insert deliveries
    const { error: insDelErr } = await supabase
      .from('deliveries')
      .insert(deliveriesRows)
    
    if (insDelErr) {
      console.error('[CRON] Error inserting deliveries:', insDelErr.message)
      return NextResponse.json({ error: insDelErr.message }, { status: 500 })
    }

    // Update letters' status
    const ids = deliverables.map(d => d.id)
    const { error: updErr } = await supabase
      .from('letters')
      .update({ status: 'delivered' })
      .in('id', ids)
    
    if (updErr) {
      console.error('[CRON] Error updating letter status:', updErr.message)
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    // Create notifications
    const notifs = deliveriesRows.map(d => ({
      user_id: d.recipient_id,
      type: 'letter_received',
      payload: { letter_id: d.letter_id },
    }))
    
    const { error: notifErr } = await supabase
      .from('notifications')
      .insert(notifs)
    
    if (notifErr) {
      console.error('[CRON] Error creating notifications:', notifErr.message)
      return NextResponse.json({ error: notifErr.message }, { status: 500 })
    }

    console.log(`[CRON] Successfully delivered ${deliveriesRows.length} letters`)
  }

  const duration = Date.now() - startTime
  console.log(`[CRON] Job completed in ${duration}ms`)

  return NextResponse.json({ 
    delivered: deliveriesRows.length,
    duration_ms: duration 
  })
}
