'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function ComposePage(){
  const supabase = supabaseBrowser()
  const [to,setTo] = useState('')
  const [subject,setSubject] = useState('')
  const [body,setBody] = useState('')
  const [msg,setMsg] = useState<string|undefined>()

  async function save(e:React.FormEvent){
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setMsg('Please sign in.'); return }
    const { error } = await supabase.from('letters').insert({
      author_id: user.id,
      recipient_email: to.trim().toLowerCase(),
      subject,
      body
    })
    setMsg(error ? `Error: ${error.message}` : 'Saved! Will deliver on the 1st.')
    if(!error){ setTo(''); setSubject(''); setBody('') }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl">Compose</h2>
      <form onSubmit={save} className="space-y-2">
        <input className="w-full border p-2 rounded" placeholder="Friend's email" value={to} onChange={e=>setTo(e.target.value)} required/>
        <input className="w-full border p-2 rounded" placeholder="Subject (optional)" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea className="w-full border p-2 rounded min-h-[140px]" placeholder="Write your letter..." value={body} onChange={e=>setBody(e.target.value)} required/>
        <button className="px-4 py-2 bg-black text-white rounded">Save Letter</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}
