'use client'

import { useUnseenNotificationsCount } from '@/app/hooks/useNotifications'

export default function NotificationBell() {
  const { count } = useUnseenNotificationsCount()

  return (
    <div
      title="Notifications"
      className="relative flex items-center justify-center text-lg cursor-pointer"
    >
      <span>🔔</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  )
}
