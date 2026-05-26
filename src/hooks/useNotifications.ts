import { useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    };
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  return { notifications, count: notifications.length };
}
