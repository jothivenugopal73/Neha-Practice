const links = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "practice", icon: "📚", label: "Practice" },
  { id: "materials", icon: "📂", label: "My Materials" },
  { id: "tutor", icon: "🤖", label: "AI Tutor" },
  { id: "progress", icon: "📈", label: "Progress" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function Nav({ screen, setScreen }) {
  return (
    <nav style={{
      width: 220,
      background: "var(--bg2)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      gap: "0.25rem",
      flexShrink: 0,
    }}>
      <div style={{ padding: "0.5rem 0.75rem 1.5rem" }}>
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent2)" }}>
          🎓 AP Coach
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
          Neha's Study Companion
        </div>
      </div>

      {links.map((l) => (
        <button
          key={l.id}
          onClick={() => setScreen(l.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.7rem 0.75rem",
            borderRadius: 10,
            border: "none",
            background: screen === l.id ? "var(--accent)" : "transparent",
            color: screen === l.id ? "#fff" : "var(--muted)",
            fontWeight: screen === l.id ? 600 : 400,
            fontSize: "0.9rem",
            textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { if (screen !== l.id) e.currentTarget.style.background = "var(--card)"; }}
          onMouseLeave={(e) => { if (screen !== l.id) e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: "1.1rem" }}>{l.icon}</span>
          {l.label}
        </button>
      ))}
    </nav>
  );
}
