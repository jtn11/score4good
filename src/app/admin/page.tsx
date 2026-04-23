"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface UserDoc {
  id: string;
  email: string;
  scores: { id: string; date: string; number: number }[];
  selectedCharity: string;
}

export default function AdminPage() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawResult, setDrawResult] = useState<{
    drawn: number[];
    winners: { email: string; matches: number }[];
  } | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list: UserDoc[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserDoc));
        setUsers(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const runGlobalDraw = () => {
    const drawn = new Set<number>();
    while (drawn.size < 5) drawn.add(Math.floor(Math.random() * 45) + 1);
    const drawnArray = Array.from(drawn);
    const winners = users
      .map((u) => {
        const nums = u.scores?.map((s) => s.number) || [];
        const matches = nums.filter((n) => drawnArray.includes(n)).length;
        return { email: u.email || "Unknown", matches };
      })
      .filter((w) => w.matches > 0)
      .sort((a, b) => b.matches - a.matches);
    setDrawResult({ drawn: drawnArray, winners });
  };

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalScores = users.reduce((a, u) => a + (u.scores?.length || 0), 0);

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-background)" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--color-surface-container)", borderTop: "3px solid var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ background: "#fcfcfc", minHeight: "100vh" }}>

        {/* ── Top Bar ── */}
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 48px", height: 80, background: "#fcfcfc", borderBottom: "1px solid #f1f5f9", boxShadow: "0 20px 40px rgba(46,59,91,0.03)" }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: "#2E3B5B", fontStyle: "italic", fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Score4Good</span>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-on-surface-variant)", cursor: "pointer", fontSize: 20 }}>notifications</span>
            <span className="material-symbols-outlined" style={{ color: "var(--color-on-surface-variant)", cursor: "pointer", fontSize: 20 }}>settings</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-sans)" }}>A</div>
            <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, letterSpacing: "0.05em", fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
              Logout
            </button>
          </div>
        </header>

        {/* ── Main ── */}
        <main style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 560 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-on-primary-container)", background: "var(--color-surface-container-low)", padding: "4px 12px", borderRadius: 9999, display: "inline-block", marginBottom: 16 }}>
                System Administration
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 48, fontWeight: 700, color: "var(--color-primary)", margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Admin Control Panel</h1>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--color-secondary)", margin: 0, lineHeight: 1.6 }}>
                Manage registered participants and orchestrate high-stakes system draws with automated oversight.
              </p>
            </div>
            <button onClick={runGlobalDraw} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-primary)", padding: "16px 24px", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 14, boxShadow: "0 15px 30px rgba(24,37,68,0.15)", whiteSpace: "nowrap" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>casino</span>
              Run Global Draw
            </button>
          </div>

          {/* Draw Result */}
          {drawResult && (
            <div style={{ background: "white", padding: 32, borderRadius: 16, marginBottom: 40, border: "1px solid var(--color-surface-container)", boxShadow: "0 20px 40px rgba(46,59,91,0.06)" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)", margin: "0 0 20px", textAlign: "center" }}>Global Draw Results</h2>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
                {drawResult.drawn.map((n, i) => (
                  <span key={i} style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "var(--color-primary)", fontFamily: "var(--font-sans)" }}>{n}</span>
                ))}
              </div>
              {drawResult.winners.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--color-on-surface-variant)", fontFamily: "var(--font-sans)", fontSize: 15 }}>No matches from any user.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {drawResult.winners.map((w, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--color-surface-container-low)", borderRadius: 10 }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-primary)" }}>{w.email}</span>
                      <span style={{ background: "var(--color-surface-container)", color: "var(--color-on-primary-container)", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)" }}>{w.matches} Matches</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, marginBottom: 48 }} className="stats-grid">
            {[
              { icon: "group", label: "Total Users", value: users.length.toLocaleString(), badge: "+12%", badgeColor: "#10b981" },
              { icon: "payments", label: "Prize Pool", value: `$${(users.length * 100).toLocaleString()}`, badge: "Stable", badgeColor: "#94a3b8" },
              { icon: "favorite", label: "Total Contributions", value: `$${(users.length * 12).toLocaleString()}`, badge: "8 Charities", badgeColor: "var(--color-on-primary-container)" },
              { icon: "schedule", label: "Total Scores", value: totalScores.toString(), badge: "Active", badgeColor: "#10b981" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 20px 40px rgba(46,59,91,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--color-on-primary-container)", fontSize: 22 }}>{stat.icon}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: stat.badgeColor }}>{stat.badge}</span>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-secondary)", margin: "0 0 4px" }}>{stat.label}</p>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, color: "var(--color-primary)", margin: 0 }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <section style={{ background: "white", borderRadius: 16, boxShadow: "0 20px 40px rgba(46,59,91,0.03)", overflow: "hidden", border: "1px solid #f8fafc", marginBottom: 48 }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)", margin: 0 }}>Registered Users</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 }}>search</span>
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: "var(--color-surface-container-low)", border: "none", borderRadius: 10, fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", color: "var(--color-on-surface)", width: 220 }}
                  />
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "var(--font-sans)", background: "white", cursor: "pointer", color: "var(--color-on-surface)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
                  Filter
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(240,243,255,0.5)" }}>
                    {["User Account", "Assigned Charity", "Draw Score", "Management"].map((h, i) => (
                      <th key={h} style={{ padding: "16px 32px", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-secondary)", textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "var(--color-on-surface-variant)", fontFamily: "var(--font-sans)", fontSize: 15 }}>No users found.</td></tr>
                  ) : (
                    filtered.map((u) => {
                      const initials = (u.email || "?").charAt(0).toUpperCase();
                      const isAdmin = u.email === "admin@score4good.com";
                      const scoreCount = u.scores?.length || 0;
                      const maxScore = 10;
                      const pct = Math.min((scoreCount / maxScore) * 100, 100);
                      return (
                        <tr key={u.id} style={{ borderTop: "1px solid #f8fafc" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "20px 32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <div style={{ width: 40, height: 40, borderRadius: "50%", background: isAdmin ? "var(--color-primary-container)" : "var(--color-surface-container-highest)", display: "flex", alignItems: "center", justifyContent: "center", color: isAdmin ? "white" : "var(--color-primary)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-sans)", flexShrink: 0 }}>{initials}</div>
                              <div>
                                <p style={{ fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-primary)", margin: "0 0 2px", fontSize: 15 }}>{u.email || "No Email"}</p>
                                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: isAdmin ? "var(--color-on-primary-container)" : "#94a3b8", margin: 0, fontStyle: isAdmin ? "normal" : "italic", fontWeight: isAdmin ? 500 : 400 }}>{isAdmin ? "System Admin" : "Active Subscriber"}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "20px 32px" }}>
                            {u.selectedCharity ? (
                              <span style={{ padding: "4px 12px", background: "var(--color-surface-container)", color: "var(--color-on-primary-container)", fontSize: 12, fontWeight: 600, borderRadius: 9999, fontFamily: "var(--font-sans)" }}>{u.selectedCharity}</span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: 14 }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "20px 32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ height: 8, width: 96, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: scoreCount > 0 ? "var(--color-primary)" : "#e2e8f0", borderRadius: 9999 }} />
                              </div>
                              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, color: scoreCount > 0 ? "var(--color-primary)" : "#94a3b8", fontSize: 15 }}>{scoreCount}</span>
                            </div>
                          </td>
                          <td style={{ padding: "20px 32px", textAlign: "right" }}>
                            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#94a3b8", borderRadius: 8 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_horiz</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "16px 32px", background: "rgba(240,243,255,0.3)", borderTop: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#94a3b8", margin: 0 }}>Showing {filtered.length} of {users.length} users</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button disabled style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "white", cursor: "not-allowed", opacity: 0.5, fontFamily: "var(--font-sans)" }}>Previous</button>
                <button style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "white", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Next</button>
              </div>
            </div>
          </section>          
        </main>

        <style>{`
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
