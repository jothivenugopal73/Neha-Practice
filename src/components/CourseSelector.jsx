import { useState } from "react";
import courses from "../../courses.json";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "AP Exam Level"];
const COUNTS = [5, 10, 20];

export default function CourseSelector({ onStartQuiz }) {
  const [step, setStep] = useState("course");
  const [sel, setSel] = useState({ course: null, unit: null, topic: null, difficulty: "Intermediate", count: 10 });

  const set = (k, v) => setSel((p) => ({ ...p, [k]: v }));

  if (step === "course") {
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>Choose a Subject</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Pick what you want to practice today</p>
        <div className="grid-2">
          {courses.map((c) => (
            <button key={c.id} onClick={() => { set("course", c); setStep("unit"); }}
              style={{
                background: "var(--card)", border: `2px solid var(--border)`,
                borderRadius: "var(--radius)", padding: "1.5rem", textAlign: "left",
                color: "var(--text)", transition: "all 0.2s", cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{c.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
                {c.units.length} units · {c.units.reduce((a, u) => a + u.topics.length, 0)} topics
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "unit") {
    return (
      <div className="fade-in">
        <Breadcrumb items={[{ label: sel.course.name, onClick: () => setStep("course") }, { label: "Select Unit" }]} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "1rem 0 0.5rem" }}>Which unit?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sel.course.units.map((u) => (
            <button key={u.id} onClick={() => { set("unit", u); setStep("topic"); }}
              style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                padding: "1rem 1.25rem", textAlign: "left", color: "var(--text)",
                transition: "all 0.2s", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = sel.course.color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{u.topics.length} topics</div>
              </div>
              <span style={{ color: "var(--muted)" }}>→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "topic") {
    return (
      <div className="fade-in">
        <Breadcrumb items={[
          { label: sel.course.name, onClick: () => setStep("course") },
          { label: sel.unit.name, onClick: () => setStep("unit") },
          { label: "Select Topic" },
        ]} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "1rem 0 0.5rem" }}>Which topic?</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {sel.unit.topics.map((t) => (
            <button key={t} onClick={() => { set("topic", t); setStep("config"); }}
              style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
                padding: "0.6rem 1.2rem", color: "var(--text)", fontSize: "0.9rem",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = sel.course.color; e.currentTarget.style.color = sel.course.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "config") {
    return (
      <div className="fade-in" style={{ maxWidth: 560 }}>
        <Breadcrumb items={[
          { label: sel.course.name, onClick: () => setStep("course") },
          { label: sel.unit.name, onClick: () => setStep("unit") },
          { label: sel.topic, onClick: () => setStep("topic") },
          { label: "Configure Quiz" },
        ]} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "1rem 0 1.5rem" }}>Set up your quiz</h2>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Difficulty</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => set("difficulty", d)}
                style={{
                  padding: "0.5rem 1rem", borderRadius: 8, border: "none", fontSize: "0.85rem",
                  background: sel.difficulty === d ? sel.course.color : "var(--bg3)",
                  color: sel.difficulty === d ? "#fff" : "var(--muted)",
                  fontWeight: sel.difficulty === d ? 600 : 400, cursor: "pointer", transition: "all 0.2s",
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Number of Questions</div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {COUNTS.map((n) => (
              <button key={n} onClick={() => set("count", n)}
                style={{
                  padding: "0.5rem 1.25rem", borderRadius: 8, border: "none",
                  background: sel.count === n ? sel.course.color : "var(--bg3)",
                  color: sel.count === n ? "#fff" : "var(--muted)",
                  fontWeight: sel.count === n ? 600 : 400, cursor: "pointer", fontSize: "1rem", transition: "all 0.2s",
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem" }}
          onClick={() => onStartQuiz({
            subjectId: sel.course.id, subjectName: sel.course.name, color: sel.course.color,
            unitId: sel.unit.id, unitName: sel.unit.name,
            topicId: sel.topic, topicName: sel.topic,
            difficulty: sel.difficulty, count: sel.count,
          })}>
          Start Quiz →
        </button>
      </div>
    );
  }
}

function Breadcrumb({ items }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {i > 0 && <span style={{ color: "var(--muted)" }}>›</span>}
          {item.onClick ? (
            <button onClick={item.onClick} style={{ background: "none", border: "none", color: "var(--accent2)", fontSize: "0.85rem", cursor: "pointer", padding: 0 }}>
              {item.label}
            </button>
          ) : (
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
