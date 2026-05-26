"use client";
import { useNotifications } from "@/hooks/useNotifications";
export function NotificationBell() {
  const { count } = useNotifications();
  return (
    <button className="relative p-2">
      🔔
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
