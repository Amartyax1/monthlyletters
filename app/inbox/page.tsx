import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function InboxPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/')
  
  const { data, error } = await supabase
    .from('deliveries')
    .select('id, delivered_at, read_at, letter:letters(subject, body)')
    .eq('recipient_id', user.id)
    .order('delivered_at', { ascending: false })
  
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-hand)' }}>
        Inbox
      </h2>
      {data?.length ? (
        data.map((d: any) => (
          <Link key={d.id} href={`/inbox/${d.id}`}>
            <div className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                {d.letter?.subject && (
                  <h3 className="text-lg font-medium">{d.letter.subject}</h3>
                )}
                {!d.read_at && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {d.letter?.body?.substring(0, 100)}...
              </p>
              <div className="text-xs text-gray-500">
                Delivered {new Date(d.delivered_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="text-sm text-gray-500">No letters yet.</div>
      )}
    </div>
  )
}
