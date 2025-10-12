import { supabaseServer } from '@/lib/supabaseServer'

export default async function SentPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Please sign in.</div>

  const { data: letters, error } = await supabase
    .from('letters')
    .select('id, subject, body, status, deliver_on, recipient_email, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-3 p-6">
      <h2 className="text-xl font-semibold">Sent & Pending</h2>
      {letters?.length ? letters.map(l => (
        <div key={l.id} className="rounded-lg border p-3 bg-white/90 shadow-sm">
          <div className="text-sm opacity-70">
            To {l.recipient_email} • {l.status} • delivers {l.deliver_on}
          </div>
          {l.subject && <h3 className="text-lg font-medium mt-1">{l.subject}</h3>}
          <pre className="whitespace-pre-wrap mt-1">{l.body}</pre>
        </div>
      )) : (
        <div>No letters yet.</div>
      )}
    </div>
  )
}
