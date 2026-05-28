export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
      {/* Page title skeleton */}
      <div style={{ height: "28px", width: "220px", borderRadius: "var(--radius-sm)", background: "var(--bg3)", animation: "skeleton 1.5s ease infinite" }} />
      <div style={{ height: "14px", width: "160px", borderRadius: "var(--radius-sm)", background: "var(--bg3)", animation: "skeleton 1.5s ease infinite" }} />
      {/* Stats row skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginTop: "8px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="stat-card" style={{ height: "90px", animation: "skeleton 1.5s ease infinite" }} />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="surface" style={{ padding: "0", overflow: "hidden", marginTop: "4px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", height: "48px", background: "var(--bg3)", animation: "skeleton 1.5s ease infinite" }} />
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: "16px" }}>
            <div style={{ height: "14px", flex: 2, borderRadius: "var(--radius-sm)", background: "var(--bg3)", animation: "skeleton 1.5s ease infinite" }} />
            <div style={{ height: "14px", flex: 1, borderRadius: "var(--radius-sm)", background: "var(--bg3)", animation: "skeleton 1.5s ease infinite" }} />
            <div style={{ height: "14px", flex: 1, borderRadius: "var(--radius-sm)", background: "var(--bg3)", animation: "skeleton 1.5s ease infinite" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
