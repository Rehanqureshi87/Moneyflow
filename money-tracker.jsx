import { useState, useMemo } from "react";

const CATEGORIES = [
  { id: "food", label: "🍔 Food", color: "#FF6B6B" },
  { id: "transport", label: "🚗 Transport", color: "#4ECDC4" },
  { id: "shopping", label: "🛍️ Shopping", color: "#FFE66D" },
  { id: "bills", label: "💡 Bills", color: "#A8E6CF" },
  { id: "entertainment", label: "🎬 Entertainment", color: "#FF8B94" },
  { id: "health", label: "💊 Health", color: "#B4D4FF" },
  { id: "education", label: "📚 Education", color: "#E8C5F5" },
  { id: "other", label: "📦 Other", color: "#D4C5A9" },
];

const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function MoneyTracker() {
  const [salary, setSalary] = useState("");
  const [salarySet, setSalarySet] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "food", note: "" });
  const [showSummary, setShowSummary] = useState(false);
  const [month] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const saved = useMemo(() => Number(salary) - totalSpent, [salary, totalSpent]);

  const categoryTotals = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => (map[c.id] = 0));
    expenses.forEach((e) => (map[e.category] = (map[e.category] || 0) + e.amount));
    return map;
  }, [expenses]);

  const topCategory = useMemo(() => {
    let max = 0, top = null;
    CATEGORIES.forEach((c) => {
      if (categoryTotals[c.id] > max) { max = categoryTotals[c.id]; top = c; }
    });
    return top;
  }, [categoryTotals]);

  const spentPct = salary ? Math.min((totalSpent / Number(salary)) * 100, 100) : 0;
  const savePct = salary ? Math.max(100 - spentPct, 0) : 0;

  function addExpense() {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return;
    setExpenses((prev) => [
      { id: Date.now(), amount: Number(form.amount), category: form.category, note: form.note, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ]);
    setForm({ amount: "", category: "food", note: "" });
  }

  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  if (!salarySet) {
    return (
      <div style={styles.page}>
        <div style={styles.onboard}>
          <div style={styles.logoWrap}>
            <span style={styles.logoIcon}>₹</span>
          </div>
          <h1 style={styles.onboardTitle}>Smart Money<br />Tracker</h1>
          <p style={styles.onboardSub}>{month} ka budget set karo 🎯</p>
          <div style={styles.inputRow}>
            <span style={styles.rupeePrefix}>₹</span>
            <input
              style={styles.bigInput}
              type="number"
              placeholder="Apni salary enter karo"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salary && setSalarySet(true)}
            />
          </div>
          <button
            style={{ ...styles.btn, opacity: salary ? 1 : 0.4 }}
            disabled={!salary}
            onClick={() => setSalarySet(true)}
          >
            Start Tracking →
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div style={styles.page}>
        <div style={styles.summaryWrap}>
          <button style={styles.backBtn} onClick={() => setShowSummary(false)}>← Back</button>
          <h2 style={styles.summaryTitle}>📊 {month} Summary</h2>

          <div style={styles.summaryCards}>
            <div style={{ ...styles.sCard, background: "#1a1a2e" }}>
              <span style={styles.sLabel}>Total Salary</span>
              <span style={{ ...styles.sValue, color: "#A8E6CF" }}>{fmt(salary)}</span>
            </div>
            <div style={{ ...styles.sCard, background: "#1a1a2e" }}>
              <span style={styles.sLabel}>Total Spent</span>
              <span style={{ ...styles.sValue, color: "#FF6B6B" }}>{fmt(totalSpent)}</span>
            </div>
            <div style={{ ...styles.sCard, background: saved >= 0 ? "#0f2d1f" : "#2d0f0f" }}>
              <span style={styles.sLabel}>{saved >= 0 ? "💰 Saved" : "⚠️ Overspent"}</span>
              <span style={{ ...styles.sValue, color: saved >= 0 ? "#6EE7B7" : "#FF6B6B" }}>{fmt(Math.abs(saved))}</span>
            </div>
          </div>

          <div style={styles.pieWrap}>
            <svg viewBox="0 0 100 100" style={{ width: 160, height: 160 }}>
              {(() => {
                let offset = 0;
                return CATEGORIES.filter((c) => categoryTotals[c.id] > 0).map((c) => {
                  const pct = (categoryTotals[c.id] / totalSpent) * 100;
                  const stroke = (pct / 100) * 251.2;
                  const el = (
                    <circle key={c.id} cx="50" cy="50" r="40" fill="none"
                      stroke={c.color} strokeWidth="20"
                      strokeDasharray={`${stroke} ${251.2 - stroke}`}
                      strokeDashoffset={-offset}
                      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                    />
                  );
                  offset += stroke;
                  return el;
                });
              })()}
              <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                {fmt(totalSpent)}
              </text>
            </svg>
          </div>

          <div style={styles.catBreakdown}>
            {CATEGORIES.filter((c) => categoryTotals[c.id] > 0)
              .sort((a, b) => categoryTotals[b.id] - categoryTotals[a.id])
              .map((c) => (
                <div key={c.id} style={styles.catRow}>
                  <span style={{ ...styles.catDot, background: c.color }} />
                  <span style={styles.catRowLabel}>{c.label}</span>
                  <div style={styles.catBar}>
                    <div style={{ ...styles.catBarFill, width: `${(categoryTotals[c.id] / totalSpent) * 100}%`, background: c.color }} />
                  </div>
                  <span style={styles.catAmt}>{fmt(categoryTotals[c.id])}</span>
                </div>
              ))}
          </div>

          {topCategory && (
            <div style={styles.insightBox}>
              💡 Tumne sabse zyada <b>{topCategory.label}</b> pe kharch kiya — {fmt(categoryTotals[topCategory.id])}!
              {saved < 0 && " Next month thoda control karo 😅"}
              {saved > 0 && saved / Number(salary) > 0.2 && " Great savings! 🎉"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.tracker}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.monthTag}>{month}</div>
            <div style={styles.headerSalary}>{fmt(salary)} <span style={styles.headerSub}>salary</span></div>
          </div>
          <button style={styles.summaryBtn} onClick={() => setShowSummary(true)}>
            📊 Summary
          </button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressWrap}>
          <div style={styles.progressLabels}>
            <span style={{ color: "#FF6B6B" }}>Spent: {fmt(totalSpent)}</span>
            <span style={{ color: "#6EE7B7" }}>Saved: {fmt(saved)}</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${spentPct}%`, background: spentPct > 80 ? "#FF6B6B" : spentPct > 50 ? "#FFE66D" : "#6EE7B7" }} />
          </div>
          <div style={styles.progressPct}>{spentPct.toFixed(0)}% kharch, {savePct.toFixed(0)}% bacha</div>
        </div>

        {/* Category Quick Stats */}
        <div style={styles.catScroll}>
          {CATEGORIES.map((c) => (
            <div key={c.id} style={{ ...styles.catChip, borderColor: categoryTotals[c.id] > 0 ? c.color : "transparent", background: categoryTotals[c.id] > 0 ? c.color + "22" : "#1a1a2e" }}>
              <span style={styles.catChipIcon}>{c.label.split(" ")[0]}</span>
              <span style={styles.catChipAmt}>{categoryTotals[c.id] > 0 ? fmt(categoryTotals[c.id]) : "—"}</span>
            </div>
          ))}
        </div>

        {/* Add Expense */}
        <div style={styles.addBox}>
          <div style={styles.addTitle}>+ Expense Add Karo</div>
          <div style={styles.addRow}>
            <div style={styles.amtWrap}>
              <span style={styles.addRs}>₹</span>
              <input
                style={styles.amtInput}
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
              />
            </div>
            <select
              style={styles.selectInput}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.noteRow}>
            <input
              style={styles.noteInput}
              placeholder="Note (optional) — e.g. Zomato, petrol..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addExpense()}
            />
            <button style={styles.addBtn} onClick={addExpense}>Add</button>
          </div>
        </div>

        {/* Expense List */}
        <div style={styles.listWrap}>
          <div style={styles.listTitle}>Aaj ke Transactions</div>
          {expenses.length === 0 ? (
            <div style={styles.emptyState}>Koi expense nahi abhi tak 🙌</div>
          ) : (
            expenses.map((e) => {
              const cat = CATEGORIES.find((c) => c.id === e.category);
              return (
                <div key={e.id} style={styles.expItem}>
                  <div style={{ ...styles.expDot, background: cat?.color }} />
                  <div style={styles.expInfo}>
                    <span style={styles.expCat}>{cat?.label}</span>
                    {e.note && <span style={styles.expNote}>{e.note}</span>}
                    <span style={styles.expTime}>{e.time}</span>
                  </div>
                  <span style={styles.expAmt}>-{fmt(e.amount)}</span>
                  <button style={styles.delBtn} onClick={() => deleteExpense(e.id)}>✕</button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0d0d1a", display: "flex", justifyContent: "center", padding: "20px 0", fontFamily: "'DM Sans', sans-serif" },
  onboard: { maxWidth: 420, width: "100%", padding: "60px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 },
  logoWrap: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoIcon: { fontSize: 36, color: "#fff", fontWeight: 800 },
  onboardTitle: { fontSize: 38, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.1, margin: 0 },
  onboardSub: { color: "#8888aa", fontSize: 16, margin: 0 },
  inputRow: { width: "100%", display: "flex", alignItems: "center", background: "#1a1a2e", borderRadius: 16, padding: "6px 16px", border: "1px solid #2a2a4a" },
  rupeePrefix: { fontSize: 24, color: "#6EE7B7", fontWeight: 700, marginRight: 8 },
  bigInput: { flex: 1, background: "none", border: "none", outline: "none", fontSize: 24, color: "#fff", fontWeight: 600 },
  btn: { width: "100%", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", border: "none", color: "#0d0d1a", fontSize: 17, fontWeight: 700, cursor: "pointer" },
  tracker: { maxWidth: 440, width: "100%", padding: "0 16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  monthTag: { fontSize: 12, color: "#8888aa", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  headerSalary: { fontSize: 28, color: "#fff", fontWeight: 800 },
  headerSub: { fontSize: 14, color: "#8888aa", fontWeight: 400 },
  summaryBtn: { background: "#1a1a2e", border: "1px solid #2a2a4a", color: "#fff", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 },
  progressWrap: { background: "#1a1a2e", borderRadius: 16, padding: "16px", marginBottom: 16 },
  progressLabels: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10, fontWeight: 600 },
  progressBg: { height: 10, borderRadius: 10, background: "#0d0d1a", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 10, transition: "width 0.4s ease" },
  progressPct: { fontSize: 12, color: "#8888aa", marginTop: 8, textAlign: "center" },
  catScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" },
  catChip: { flexShrink: 0, borderRadius: 12, border: "1px solid", padding: "8px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 64 },
  catChipIcon: { fontSize: 20 },
  catChipAmt: { fontSize: 11, color: "#ccc", fontWeight: 600 },
  addBox: { background: "#1a1a2e", borderRadius: 16, padding: 16, marginBottom: 16, border: "1px solid #2a2a4a" },
  addTitle: { color: "#8888aa", fontSize: 13, marginBottom: 12, fontWeight: 600 },
  addRow: { display: "flex", gap: 10, marginBottom: 10 },
  amtWrap: { flex: 1, display: "flex", alignItems: "center", background: "#0d0d1a", borderRadius: 10, padding: "8px 12px" },
  addRs: { color: "#6EE7B7", fontWeight: 700, marginRight: 6 },
  amtInput: { flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 16, fontWeight: 600 },
  selectInput: { background: "#0d0d1a", border: "none", outline: "none", color: "#fff", borderRadius: 10, padding: "8px 10px", fontSize: 13, cursor: "pointer" },
  noteRow: { display: "flex", gap: 10 },
  noteInput: { flex: 1, background: "#0d0d1a", border: "none", outline: "none", color: "#ccc", borderRadius: 10, padding: "10px 12px", fontSize: 13 },
  addBtn: { background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", border: "none", color: "#0d0d1a", borderRadius: 10, padding: "0 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 },
  listWrap: { background: "#1a1a2e", borderRadius: 16, padding: 16 },
  listTitle: { color: "#8888aa", fontSize: 13, fontWeight: 600, marginBottom: 12 },
  emptyState: { color: "#555", textAlign: "center", padding: "20px 0", fontSize: 14 },
  expItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #0d0d1a" },
  expDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  expInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  expCat: { color: "#fff", fontSize: 13, fontWeight: 600 },
  expNote: { color: "#8888aa", fontSize: 12 },
  expTime: { color: "#555", fontSize: 11 },
  expAmt: { color: "#FF6B6B", fontWeight: 700, fontSize: 14 },
  delBtn: { background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, padding: "2px 6px" },
  summaryWrap: { maxWidth: 440, width: "100%", padding: "20px 16px" },
  backBtn: { background: "none", border: "none", color: "#8888aa", cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 },
  summaryTitle: { color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 20 },
  summaryCards: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 },
  sCard: { borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  sLabel: { color: "#8888aa", fontSize: 14 },
  sValue: { fontSize: 22, fontWeight: 800 },
  pieWrap: { display: "flex", justifyContent: "center", marginBottom: 24 },
  catBreakdown: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 },
  catRow: { display: "flex", alignItems: "center", gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  catRowLabel: { color: "#ccc", fontSize: 13, width: 120 },
  catBar: { flex: 1, height: 6, background: "#1a1a2e", borderRadius: 6, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 6, transition: "width 0.5s ease" },
  catAmt: { color: "#fff", fontSize: 13, fontWeight: 600, width: 70, textAlign: "right" },
  insightBox: { background: "#1a1a2e", borderRadius: 14, padding: "14px 16px", color: "#ccc", fontSize: 14, lineHeight: 1.5, border: "1px solid #2a2a4a" },
};
