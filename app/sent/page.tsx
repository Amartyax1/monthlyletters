import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import LetterActions from '../components/LetterActions'

export default async function SentPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/')
  
  const { data: letters, error } = await supabase
    .from('letters')
    .select('id, subject, body, status, deliver_on, recipient_email, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-hand)' }}>
        Sent & Pending
      </h2>
      {letters?.length ? (
        letters.map(l => (
          <div key={l.id} className="card">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>To <strong>{l.recipient_email}</strong></span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                l.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {l.status || 'pending'}
              </span>
              <span>•</span>
              <span>Delivers {l.deliver_on || '—'}</span>
            </div>
            
            {l.subject && (
              <h3 className="text-lg font-medium mb-2">{l.subject}</h3>
            )}
            <pre className="whitespace-pre-wrap text-sm mb-2">{l.body}</pre>
            
            <div className="text-xs text-gray-500">
              Created {new Date(l.created_at).toLocaleDateString()}
            </div>

            <LetterActions 
              letterId={l.id} 
              status={l.status || 'pending'} 
              subject={l.subject || ''} 
              body={l.body} 
            />
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">No letters yet.</div>
      )}
    </div>
  )
}
