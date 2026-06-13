import courses from "../../courses.json";

export default function Progress({ data }) {
  const { progress, xp, streak, totalQuestions, badges } = data;

  const BADGE_META = {
    perfect_score: { icon: "⭐", label: "Perfect Score", desc: "Scored 100% on a quiz" },
    streak_7: { icon: "🔥", label: "7-Day Streak", desc: "Studied 7 days in a row" },
    xp_500: { icon: "🏆", label: "500 XP", desc: "Earned 500 experience points" },
  };

  const ALL_BADGES = Object.keys(BADGE_META);

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>📈 Your Progress</h2>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>Track mastery across every subject and topic</p>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent2)" }}>{xp}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Total XP</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Level {Math.floor(xp / 100) + 1}</div>
          <div className="progress-bar" style={{ marginTop: "0.5rem" }}>
            <div className="progress-fill" style={{ width: `${(xp % 100)}%` }} />
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--yellow)" }}>{streak}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Day Streak 🔥</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--green)" }}>{totalQuestions}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Questions Practiced</div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>🏅 Badges</h3>
        <div className="grid-3">
          {ALL_BADGES.map((b) => {
            const earned = badges.includes(b);
            const meta = BADGE_META[b];
            return (
              <div key={b} className="card" style={{ textAlign: "center", opacity: earned ? 1 : 0.4, transition: "opacity 0.2s" }}>
                <div style={{ fontSize: "2rem" }}>{meta.icon}</div>
                <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>{meta.label}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{meta.desc}</div>
                {earned && <div style={{ fontSize: "0.75rem", color: "var(--green)", marginTop: 6, fontWeight: 600 }}>✓ Earned</div>}
                {!earned && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 6 }}>Locked</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject breakdown */}
      <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>📚 Subject Mastery</h3>
      {courses.map((course) => {
        const topicRows = [];
        course.units.forEach((unit) =>
          unit.topics.forEach((topic) => {
            const key = `${course.id}__${unit.id}__${topic}`;
            const p = progress[key];
            if (p && p.total > 0) {
              topicRows.push({ unit: unit.name, topic, correct: p.correct, total: p.total, pct: Math.round((p.correct / p.total) * 100) });
            }
          })
        );

        return (
          <div key={course.id} className="card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: topicRows.length ? "1rem" : 0 }}>
              <span style={{ fontSize: "1.5rem" }}>{course.icon}</span>
              <div style={{ fontWeight: 700 }}>{course.name}</div>
              {topicRows.length === 0 && <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--muted)" }}>Not started</span>}
            </div>
            {topicRows.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {topicRows.map((row, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--muted)" }}>{row.topic}</span>
                      <span style={{ fontWeight: 600, color: row.pct >= 80 ? "var(--green)" : row.pct >= 50 ? "var(--yellow)" : "var(--red)" }}>
                        {row.pct}% ({row.correct}/{row.total})
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${row.pct}%`,
                        background: row.pct >= 80 ? "var(--green)" : row.pct >= 50 ? "var(--yellow)" : "var(--red)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
