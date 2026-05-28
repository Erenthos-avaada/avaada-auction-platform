"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width,   setWidth]   = useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70),  100);
    const t2 = setTimeout(() => setWidth(90),  400);
    const t3 = setTimeout(() => { setWidth(100); }, 700);
    const t4 = setTimeout(() => setVisible(false), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "2px",
      zIndex: 9999, pointerEvents: "none",
    }}>
      <div style={{
        height: "100%", background: "var(--accent)",
        width: `${width}%`,
        transition: width === 100 ? "width 0.2s ease" : "width 0.4s ease",
        boxShadow: "0 0 8px var(--accent)",
      }} />
    </div>
  );
}
