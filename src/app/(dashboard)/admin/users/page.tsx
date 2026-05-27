import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PROCUREMENT"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>
          User <span className="text-gold-gradient">Management</span>
        </h1>
        <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Manage admin and procurement officer accounts</p>
      </div>

      <div style={{ background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "16px", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: "var(--white)" }}>{u.name || "—"}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === "ADMIN" ? "badge-approved" : "badge-draft"}`}>{u.role}</span></td>
                <td style={{ fontSize: "0.8rem" }}>{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
