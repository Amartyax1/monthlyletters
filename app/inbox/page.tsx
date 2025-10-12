import { supabaseServer } from '@/lib/supabaseServer'

export default async function InboxPage(){
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if(!user) return <div>Please sign in to view your inbox.</div>
  
  // No deliveries yet (that’s for later). Show a friendly message.
  return <div>Your inbox is empty (deliveries will appear after the 1st).</div>
}
