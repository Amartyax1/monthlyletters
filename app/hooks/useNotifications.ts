'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export function useUnseenNotificationsCount() {
  const supabase = supabaseBrowser()
  const [count, setCount] = useState(0)

  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch unseen count initially
      const { count: c } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('seen', false)

      setCount(c ?? 0)

      // Subscribe to new notifications
      sub = supabase
        .channel('notif-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => setCount(x => x + 1)
        )
        .subscribe()
    }

    init()
    return () => { sub?.unsubscribe() }
  }, [])

  return { count, setCount }
}
