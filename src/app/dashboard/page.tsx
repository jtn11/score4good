"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

interface Score {
  id: string;
  date: string;
  number: number;
  createdAt: number;
}

const CHARITIES = [
  { name: "Red Cross", icon: "emergency", color: "#dc2626", bg: "#fef2f2", category: "Global Relief" },
  { name: "UNICEF", icon: "child_care", color: "#2563eb", bg: "#eff6ff", category: "Children's Rights" },
  { name: "WWF", icon: "nature", color: "#059669", bg: "#ecfdf5", category: "Wildlife Conservation" },
  { name: "Doctors Without Borders", icon: "medication_liquid", color: "#e11d48", bg: "#fff1f2", category: "Medical Aid" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);
  const [inputNumber, setInputNumber] = useState<string>("");
  const [inputDate, setInputDate] = useState<string>("");
  const [drawResult, setDrawResult] = useState<{ drawn: number[]; matchedCount: number } | null>(null);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setScores(data.scores || []);
          setSelectedCharity(data.selectedCharity || "");
        } else {
          await setDoc(docRef, { email: user.email, scores: [], selectedCharity: "" });
        }
      } catch {
        toast.error("Failed to load user data");
      } finally {
        setLoadingData(false);
      }
    };
    fetchUserData();
  }, [user]);

  const saveScoresToDB = async (newScores: Score[]) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, { scores: newScores });
    setScores(newScores);
  };

  const handleAddOrEditScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputNumber);
    if (isNaN(num) || num < 1 || num > 45) { toast.error("Score must be between 1 and 45"); return; }
    
    if (editingScoreId) {
      if (scores.some((s) => s.date === inputDate && s.id !== editingScoreId)) { toast.error("A score for this date already exists"); return; }
      const updated = scores.map(s => s.id === editingScoreId ? { ...s, date: inputDate, number: num } : s);
      try {
        await saveScoresToDB(updated.sort((a, b) => b.createdAt - a.createdAt));
        toast.success("Score updated!");
        setInputNumber(""); setInputDate("");
        setEditingScoreId(null);
      } catch { toast.error("Error updating score"); }
    } else {
      if (scores.some((s) => s.date === inputDate)) { toast.error("A score for this date already exists"); return; }
      
      let updated = [...scores];
      let removedOldest = false;
      if (updated.length >= 5) {
        updated.sort((a, b) => a.createdAt - b.createdAt);
        updated.shift();
        removedOldest = true;
      }
      
      const newScore: Score = { id: Math.random().toString(36).substr(2, 9), date: inputDate, number: num, createdAt: Date.now() };
      updated = [newScore, ...updated].sort((a, b) => b.createdAt - a.createdAt);
      
      try {
        await saveScoresToDB(updated);
        if (removedOldest) {
          toast.success("Oldest score removed. New score added.");
        } else {
          toast.success("Score added!");
        }
        setInputNumber(""); setInputDate("");
      } catch { toast.error("Error adding score"); }
    }
  };

  const handleEditClick = (score: Score) => {
    setEditingScoreId(score.id);
    setInputDate(score.date);
    setInputNumber(score.number.toString());
  };
  
  const cancelEdit = () => {
    setEditingScoreId(null);
    setInputDate("");
    setInputNumber("");
  };

  const handleDeleteScore = async (id: string) => {
    try {
      await saveScoresToDB(scores.filter((s) => s.id !== id));
      toast.success("Score removed");
    } catch { toast.error("Error removing score"); }
  };

  const simulateDraw = () => {
    const drawn = new Set<number>();
    while (drawn.size < 5) drawn.add(Math.floor(Math.random() * 45) + 1);
    const drawnArray = Array.from(drawn);
    const userNums = scores.map((s) => s.number);
    const matched = userNums.filter((n) => drawnArray.includes(n)).length;
    setDrawResult({ drawn: drawnArray, matchedCount: matched });
  };

  const handleSelectCharity = async (charity: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { selectedCharity: charity });
      setSelectedCharity(charity);
      toast.success("Charity updated");
    } catch { toast.error("Error updating charity"); }
  };

  const displayName = user?.email?.split("@")[0] ?? "User";

  if (loadingData) {
    return (
      <ProtectedRoute>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--color-background)" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid var(--color-surface-container)", borderTop:"3px solid var(--color-primary)", animation:"spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ background:"var(--color-background)", minHeight:"100vh" }}>

        {/* ── Top Bar ── */}
        <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 48px", height:80, background:"#fcfcfc", borderBottom:"1px solid #f1f5f9", boxShadow:"0 20px 40px rgba(46,59,91,0.03)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:32 }}>
            <span style={{ fontSize:22, fontWeight:600, color:"#2E3B5B", fontStyle:"italic", fontFamily:"var(--font-serif)", letterSpacing:"-0.02em" }}>Score4Good</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            <span className="material-symbols-outlined" style={{ color:"var(--color-on-surface-variant)", fontSize:20, cursor: "pointer" }}>notifications</span>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--color-surface-container-highest)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--color-outline-variant)", fontWeight:700, color:"var(--color-primary)", fontSize:13 }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, letterSpacing:"0.05em", fontWeight:600, color:"var(--color-on-surface-variant)", textTransform:"uppercase", fontFamily:"var(--font-sans)" }}>
              Logout
            </button>
          </div>
        </header>

        {/* ── Main ── */}
        <main style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>

          {/* Welcome */}
          <section style={{ marginBottom:48 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:24 }}>
              <div>
                <h1 style={{ fontFamily:"var(--font-serif)", fontSize:48, fontWeight:700, color:"var(--color-on-surface)", margin:"0 0 12px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
                  Welcome, {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                </h1>
                <p style={{ fontFamily:"var(--font-sans)", fontSize:18, color:"var(--color-on-surface-variant)", margin:0, maxWidth:560, lineHeight:1.6 }}>
                  Manage your draw entries and select your preferred philanthropic impact for this month&apos;s pool.
                </p>
              </div>
              <div style={{ display:"flex", gap:16 }}>
                <div style={{ background:"var(--color-surface-container-low)", padding:"12px 24px", borderRadius:12, boxShadow:"0 4px 16px rgba(46,59,91,0.04)", minWidth: 160 }}>
                  <p style={{ fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-surface-variant)", margin:"0 0 6px" }}>Subscription Status</p>
                  <p style={{ fontFamily:"var(--font-serif)", fontSize:22, fontWeight:600, color:"var(--color-primary)", margin:0, display:"flex", alignItems:"center", gap:8 }}>
                    Active <span style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
                  </p>
                </div>
                <div style={{ background:"var(--color-surface-container-low)", padding:"12px 24px", borderRadius:12, boxShadow:"0 4px 16px rgba(46,59,91,0.04)", minWidth: 160 }}>
                  <p style={{ fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-surface-variant)", margin:"0 0 6px" }}>Next Draw</p>
                  <p style={{ fontFamily:"var(--font-serif)", fontSize:22, fontWeight:600, color:"var(--color-primary)", margin:0 }}>This Month</p>
                </div>
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <div className="bento-grid">

            {/* Manage Scores */}
            <div style={{ gridColumn:"span 5", background:"var(--color-surface-container-lowest)", padding:40, borderRadius:16, boxShadow:"0 20px 40px rgba(46,59,91,0.03)", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
                <h2 style={{ fontFamily:"var(--font-serif)", fontSize:24, fontWeight:600, color:"var(--color-primary)", margin:0 }}>Manage Scores</h2>
                <span className="material-symbols-outlined" style={{ color:"var(--color-on-primary-container)", fontSize:22 }}>rebase_edit</span>
              </div>

              <form onSubmit={handleAddOrEditScore}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
                  <div>
                    <label style={{ display:"block", fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-surface-variant)", marginBottom:8, paddingLeft:4 }}>Draw Date</label>
                    <input type="date" required value={inputDate} onChange={(e) => setInputDate(e.target.value)}
                      style={{ width:"100%", padding:"12px 16px", background:"var(--color-surface-container)", border:"1px solid var(--color-outline-variant)", borderRadius:8, outline:"none", fontFamily:"var(--font-sans)", fontSize:15, color:"var(--color-on-surface)", boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-surface-variant)", marginBottom:8, paddingLeft:4 }}>Entry Score</label>
                    <input type="number" required min="1" max="45" value={inputNumber} onChange={(e) => setInputNumber(e.target.value)} placeholder="1–45"
                      style={{ width:"100%", padding:"12px 16px", background:"var(--color-surface-container)", border:"1px solid var(--color-outline-variant)", borderRadius:8, outline:"none", fontFamily:"var(--font-sans)", fontSize:15, color:"var(--color-on-surface)", boxSizing:"border-box" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="submit" style={{ flex: 1, padding:"14px", background:"var(--color-on-background)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"var(--font-sans)", fontWeight:500, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:18 }}>{editingScoreId ? "save" : "add"}</span>
                    {editingScoreId ? "Update Entry" : "Add Entry"}
                  </button>
                  {editingScoreId && (
                    <button type="button" onClick={cancelEdit} style={{ flex: 1, padding:"14px", background:"var(--color-surface-container-high)", color:"var(--color-on-surface)", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"var(--font-sans)", fontWeight:500, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:18 }}>close</span>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div style={{ marginTop:32, flex:1 }}>
                {scores.length === 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", border:"1px dashed var(--color-outline-variant)", borderRadius:16, background:"rgba(240,243,255,0.3)", textAlign:"center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize:40, color:"var(--color-on-surface-variant)", marginBottom:16 }}>history</span>
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:14, color:"var(--color-on-surface-variant)", margin:"0 0 8px" }}>No entry history found for the current period.</p>
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-primary-container)", margin:0 }}>Start by adding your first score above.</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {scores.map((score) => (
                      <div key={score.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", background:"var(--color-surface-container-low)", borderRadius:12, border:"1px solid var(--color-outline-variant)" }}>
                        <div>
                          <p style={{ fontFamily:"var(--font-sans)", fontWeight:600, color:"var(--color-on-surface)", margin:0, fontSize:14 }}>{score.date}</p>
                          <p style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--color-on-surface-variant)", margin:"4px 0 0" }}>Score: {score.number}</p>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleEditClick(score)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, color:"var(--color-primary)", borderRadius:8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:20 }}>edit</span>
                          </button>
                          <button onClick={() => handleDeleteScore(score.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, color:"var(--color-outline)", borderRadius:8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:20 }}>delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {scores.length === 5 && !editingScoreId && (
                      <p style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"#f59e0b", textAlign:"center", margin:0 }}>Max 5 scores. Next entry removes the oldest.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ gridColumn:"span 7", display:"flex", flexDirection:"column", gap:24 }}>

              {/* Simulate Draw */}
              <div style={{ position:"relative", overflow:"hidden", background:"var(--color-primary-container)", padding:40, borderRadius:16, boxShadow:"0 8px 32px rgba(24,37,68,0.18)", color:"white" }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at top right, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
                <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <h2 style={{ fontFamily:"var(--font-serif)", fontSize:32, fontWeight:600, color:"white", margin:"0 0 12px", letterSpacing:"-0.01em" }}>Simulate Potential Draw</h2>
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:15, color:"var(--color-on-primary-container)", margin:0, maxWidth:400, lineHeight:1.6 }}>
                      Run a high-fidelity Monte Carlo simulation to forecast your probability based on current entry distributions.
                    </p>
                  </div>
                  <button onClick={simulateDraw} style={{ width:80, height:80, borderRadius:"50%", background:"white", color:"var(--color-primary)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.2)", flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:32 }}>play_arrow</span>
                  </button>
                </div>
                {drawResult && (
                  <div style={{ marginTop:24, paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.15)" }}>
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:12, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-primary-container)", marginBottom:12 }}>Drawn Numbers</p>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
                      {drawResult.drawn.map((n, i) => (
                        <span key={i} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"white" }}>{n}</span>
                      ))}
                    </div>
                    <p style={{ fontFamily:"var(--font-serif)", fontSize:18, fontWeight:600, color:"white", margin:0 }}>
                      {drawResult.matchedCount > 0 ? `🎉 You matched ${drawResult.matchedCount} number${drawResult.matchedCount > 1 ? "s" : ""}!` : "No match this time — keep adding scores!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Support a Charity */}
              <div style={{ background:"var(--color-surface-container-lowest)", padding:40, borderRadius:16, boxShadow:"0 20px 40px rgba(46,59,91,0.03)", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
                  <h2 style={{ fontFamily:"var(--font-serif)", fontSize:24, fontWeight:600, color:"var(--color-primary)", margin:0 }}>Support a Charity</h2>
                  <span style={{ fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-surface-variant)" }}>Impact Factor: 2.5x</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  {CHARITIES.map((charity) => {
                    const isSelected = selectedCharity === charity.name;
                    return (
                      <button key={charity.name} onClick={() => handleSelectCharity(charity.name)}
                        style={{ display:"flex", alignItems:"center", gap:16, padding:"16px", borderRadius:12, border:`1px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`, background: isSelected ? "var(--color-surface-container-lowest)" : "transparent", cursor:"pointer", textAlign:"left", width:"100%" }}>
                        <div style={{ width:48, height:48, borderRadius:10, background:charity.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span className="material-symbols-outlined" style={{ color:charity.color, fontSize:24 }}>{charity.icon}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontFamily:"var(--font-sans)", fontWeight:600, color:"var(--color-on-surface)", margin:"0 0 4px", fontSize:14 }}>{charity.name}</p>
                          <p style={{ fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", color:"var(--color-on-surface-variant)", margin:0 }}>{charity.category}</p>
                        </div>
                        <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {isSelected && <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--color-primary)" }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </main>

        <style>{`
          @media (max-width: 768px) {
            .bento-grid { display: flex !important; flex-direction: column !important; }
          }
          input[type="date"]:focus, input[type="number"]:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
