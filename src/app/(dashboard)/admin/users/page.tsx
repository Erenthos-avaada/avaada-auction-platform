import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ where: { role: { in: ["ADMIN","PROCUREMENT"] } }, orderBy: { createdAt: "desc" } });

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">User <span>Management</span></h1>
        <p className="page-sub">Admin and procurement officer accounts</p>
      </div>
      <div className="anim-up d1 surface" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: "var(--text)" }}>{u.name || "—"}</td>
                <td style={{ fontSize: "0.82rem" }}>{u.email}</td>
                <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
