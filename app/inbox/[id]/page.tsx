import { supabaseServer } from '@/lib/supabaseServer'
import { notFound, redirect } from 'next/navigation'

export default async function DeliveryPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/')
  
  const { data, error } = await supabase
    .from('deliveries')
    .select('id, read_at, delivered_at, letter:letters(subject, body)')
    .eq('id', params.id)
    .eq('recipient_id', user.id)
    .maybeSingle()
  
  if (error || !data) notFound()
  
  // Mark as read if not already read
  if (!data.read_at) {
    await supabase
      .from('deliveries')
      .update({ read_at: new Date().toISOString() })
      .eq('id', params.id)
  }
  
  return (
    <div className="card max-w-2xl mx-auto">
      {data.letter?.subject && (
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-hand)' }}>
          {data.letter.subject}
        </h2>
      )}
      <pre className="whitespace-pre-wrap font-[var(--font-body)] mb-6">
        {data.letter?.body}
      </pre>
      <div className="text-xs text-gray-500 border-t pt-3">
        Delivered: {new Date(data.delivered_at!).toLocaleDateString()}
        {data.read_at && ` • Read: ${new Date(data.read_at).toLocaleDateString()}`}
      </div>
    </div>
  )
}
