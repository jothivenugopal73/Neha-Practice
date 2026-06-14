import { useState } from "react";
import courses from "../../courses.json";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "AP Exam Level"];
const COUNTS = [5, 10, 20];

export default function CourseSelector({ onStartQuiz, materials = [] }) {
  const [step, setStep] = useState("course");
  const [sel, setSel] = useState({
    course: null,
    units: [],        // array of selected unit objects (multi-select)
    topic: null,      // single topic (only when drilling into one unit)
    difficulty: "Intermediate",
    count: 10,
    source: "ai",     // "ai" | "materials" | "blend"
  });

  const set = (k, v) => setSel((p) => ({ ...p, [k]: v }));

  const toggleUnit = (unit) => {
    setSel((p) => {
      const exists = p.units.find((u) => u.id === unit.id);
      const units = exists ? p.units.filter((u) => u.id !== unit.id) : [...p.units, unit];
      return { ...p, units };
    });
  };

  // Materials saved for the currently selected subject
  const subjectMaterials = (courseId) => materials.filter((m) => m.subjectId === courseId);

  // Build the config object passed to the quiz
  const buildConfig = (mode) => {
    const course = sel.course;
    const mats = subjectMaterials(course.id);
    const effectiveSource = mats.length === 0 ? "ai" : sel.source;
    const sourceText =
      effectiveSource === "ai" ? "" : mats.map((m) => `### ${m.name}\n${m.text}`).join("\n\n");

    const base = {
      subjectId: course.id, subjectName: course.name, color: course.color,
      difficulty: sel.difficulty, count: sel.count,
      source: effectiveSource, sourceText,
    };

    if (mode === "topic") {
      const unit = sel.units[0];
      return {
        ...base,
        unitId: unit.id, unitName: unit.name,
        topicId: sel.topic, topicName: sel.topic,
        aiTopic: sel.topic,
      };
    }
    // multi-unit (whole units)
    const allTopics = sel.units.flatMap((u) => u.topics);
    const unitLabel = sel.units.length === 1 ? sel.units[0].name : `${sel.units.length} units`;
    return {
      ...base,
      unitId: sel.units.map((u) => u.id).join("+"), unitName: unitLabel,
      topicId: "mixed", topicName: sel.units.length === 1 ? "All topics" : "Mixed topics",
      aiTopic: allTopics.join(", "),
    };
  };

  // ---------- COURSE ----------
  if (step === "course") {
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>Choose a Subject</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Pick what you want to practice today</p>
        <div className="grid-2">
          {courses.map((c) => (
            <button key={c.id} onClick={() => { set("course", c); setSel((p) => ({ ...p, course: c, units: [], topic: null })); setStep("unit"); }}
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

  // ---------- UNIT (multi-select) ----------
  if (step === "unit") {
    const selectedCount = sel.units.length;
    return (
      <div className="fade-in">
        <Breadcrumb items={[{ label: sel.course.name, onClick: () => setStep("course") }, { label: "Select Unit(s)" }]} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "1rem 0 0.25rem" }}>Which unit(s)?</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Tick one or more units. Pick a single unit if you also want to drill into one topic.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
          {sel.course.units.map((u) => {
            const checked = !!sel.units.find((x) => x.id === u.id);
            return (
              <button key={u.id} onClick={() => toggleUnit(u)}
                style={{
                  background: checked ? "rgba(99,102,241,0.12)" : "var(--card)",
                  border: `2px solid ${checked ? sel.course.color : "var(--border)"}`,
                  borderRadius: "var(--radius)", padding: "0.9rem 1.1rem", textAlign: "left",
                  color: "var(--text)", cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "0.85rem",
                }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${checked ? sel.course.color : "var(--muted)"}`,
                  background: checked ? sel.course.color : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 700,
                }}>
                  {checked ? "✓" : ""}
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{u.topics.length} topics</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            disabled={selectedCount === 0}
            style={{ opacity: selectedCount === 0 ? 0.5 : 1 }}
            onClick={() => setStep("config-multi")}
          >
            {selectedCount <= 1 ? "Practice this unit →" : `Practice ${selectedCount} units (mixed) →`}
          </button>
          {selectedCount === 1 && (
            <button className="btn btn-secondary" onClick={() => setStep("topic")}>
              Or pick a specific topic →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- TOPIC (single unit drill) ----------
  if (step === "topic") {
    const unit = sel.units[0];
    return (
      <div className="fade-in">
        <Breadcrumb items={[
          { label: sel.course.name, onClick: () => setStep("course") },
          { label: unit.name, onClick: () => setStep("unit") },
          { label: "Select Topic" },
        ]} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "1rem 0 0.5rem" }}>Which topic?</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {unit.topics.map((t) => (
            <button key={t} onClick={() => { set("topic", t); setStep("config-topic"); }}
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

  // ---------- CONFIG ----------
  if (step === "config-topic" || step === "config-multi") {
    const isTopic = step === "config-topic";
    const crumbs = isTopic
      ? [
          { label: sel.course.name, onClick: () => setStep("course") },
          { label: sel.units[0].name, onClick: () => setStep("unit") },
          { label: sel.topic, onClick: () => setStep("topic") },
          { label: "Configure" },
        ]
      : [
          { label: sel.course.name, onClick: () => setStep("course") },
          { label: sel.units.length === 1 ? sel.units[0].name : `${sel.units.length} units`, onClick: () => setStep("unit") },
          { label: "Configure" },
        ];

    return (
      <div className="fade-in" style={{ maxWidth: 560 }}>
        <Breadcrumb items={crumbs} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "1rem 0 1.5rem" }}>Set up your quiz</h2>

        {(() => {
          const mats = subjectMaterials(sel.course.id);
          const SOURCES = [
            { id: "ai", label: "AI (general AP)", desc: "Standard AP-style questions" },
            { id: "materials", label: "My materials only", desc: "Only from your uploaded notes — best for school tests" },
            { id: "blend", label: "Blend both", desc: "Mix of AP questions and your notes" },
          ];
          return (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Question source</div>
              {mats.length === 0 ? (
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Using AI questions. Upload notes in <strong>My Materials</strong> to generate questions from your own documents.
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                    {mats.length} document{mats.length > 1 ? "s" : ""} available for {sel.course.name}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {SOURCES.map((s) => (
                      <button key={s.id} onClick={() => set("source", s.id)}
                        style={{
                          textAlign: "left", padding: "0.65rem 0.9rem", borderRadius: 10,
                          border: `2px solid ${sel.source === s.id ? sel.course.color : "var(--border)"}`,
                          background: sel.source === s.id ? "rgba(99,102,241,0.12)" : "var(--bg3)",
                          color: "var(--text)", cursor: "pointer", transition: "all 0.2s",
                        }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.label}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}

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
          {!isTopic && sel.units.length > 1 && (
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.75rem" }}>
              {sel.count} questions total, mixed across your {sel.units.length} selected units.
            </div>
          )}
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem" }}
          onClick={() => onStartQuiz(buildConfig(isTopic ? "topic" : "multi"))}>
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
