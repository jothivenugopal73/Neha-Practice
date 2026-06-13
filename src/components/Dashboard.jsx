import courses from "../../courses.json";

const BADGE_META = {
  perfect_score: { icon: "⭐", label: "Perfect Score" },
  streak_7: { icon: "🔥", label: "7-Day Streak" },
  xp_500: { icon: "🏆", label: "500 XP Earned" },
};

export default function Dashboard({ data, onStartQuiz, setScreen }) {
  const { profile, xp, streak, totalQuestions, progress, badges } = data;

  const masteryScores = courses.map((course) => {
    let correct = 0, total = 0;
    course.units.forEach((unit) =>
      unit.topics.forEach((topic) => {
        const key = `${course.id}__${unit.id}__${topic}`;
        const p = progress[key];
        if (p) { correct += p.correct; total += p.total; }
      })
    );
    return { ...course, mastery: total ? Math.round((correct / total) * 100) : 0, attempted: total };
  });

  const overallMastery = masteryScores.reduce((a, c) => a + c.mastery, 0) / masteryScores.length || 0;

  const quickStart = courses[0];
  const quickUnit = quickStart?.units[0];
  const quickTopic = quickUnit?.topics[0];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
          Good {getGreeting()}, {profile?.name}! 👋
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
          {getMotivation(streak)}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        <StatCard icon="🔥" label="Study Streak" value={`${streak} days`} color="var(--yellow)" />
        <StatCard icon="🧠" label="Questions Done" value={totalQuestions} color="var(--purple)" />
        <StatCard icon="⚡" label="XP Earned" value={xp} color="var(--accent)" />
        <StatCard icon="📈" label="Avg Mastery" value={`${Math.round(overallMastery)}%`} color="var(--green)" />
      </div>

      {/* Quick practice */}
      <div className="card" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>⚡ Quick Practice</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: 4 }}>
              {quickStart?.name} · {quickUnit?.name}
            </div>
          </div>
          <button
            className="btn"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}
            onClick={() => onStartQuiz({
              subjectId: quickStart.id, subjectName: quickStart.name,
              unitId: quickUnit.id, unitName: quickUnit.name,
              topicId: quickTopic, topicName: quickTopic,
              difficulty: "Intermediate", count: 5,
            })}
          >
            Start 5 Questions →
          </button>
        </div>
      </div>

      {/* Course progress */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Your Courses</h2>
        <div className="grid-2">
          {masteryScores.map((c) => (
            <div key={c.id} className="card" style={{ cursor: "pointer" }}
              onClick={() => setScreen("practice")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <span style={{ fontSize: "1.5rem" }}>{c.icon}</span>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{c.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {c.attempted > 0 ? `${c.attempted} questions practiced` : "Not started yet"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.3rem", color: getMasteryColor(c.mastery) }}>
                    {c.mastery}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>mastery</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${c.mastery}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🏅 Earned Badges</h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {badges.map((b) => (
              <div key={b} className="badge" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "0.5rem 1rem", borderRadius: 99 }}>
                {BADGE_META[b]?.icon} {BADGE_META[b]?.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem" }}>{icon}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color, margin: "0.25rem 0" }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function getMasteryColor(pct) {
  if (pct >= 80) return "var(--green)";
  if (pct >= 50) return "var(--yellow)";
  return "var(--red)";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function getMotivation(streak) {
  if (streak === 0) return "Ready to start your study streak? Let's go!";
  if (streak < 3) return `${streak}-day streak! Keep it going!`;
  if (streak < 7) return `${streak} days strong! You're building great habits.`;
  return `🔥 ${streak}-day streak! You're on fire!`;
}
