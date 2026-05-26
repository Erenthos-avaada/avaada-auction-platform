"use client";
import { NotificationBell } from "./NotificationBell";
// TODO: Show logged-in user name, sign out button
export function Header() {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div />
      <NotificationBell />
    </header>
  );
}
