import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import ComposeForm from '../components/ComposeForm'

export default async function ComposePage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/')
  
  return <ComposeForm />
}

