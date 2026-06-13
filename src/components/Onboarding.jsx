import { useState } from "react";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", grade: "12", school: "", gpa: "4.0", goal: "", year: "2025-2026",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const steps = [
    {
      title: "Hey! 👋 Let's set up your profile",
      subtitle: "This helps us personalize your study experience",
      fields: (
        <>
          <Field label="Your Name" placeholder="e.g. Neha" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Grade" placeholder="12" value={form.grade} onChange={(v) => set("grade", v)} />
          <Field label="School Name" placeholder="Heritage High School" value={form.school} onChange={(v) => set("school", v)} />
        </>
      ),
      valid: form.name.trim() && form.school.trim(),
    },
    {
      title: `Great to meet you, ${form.name}! 🌟`,
      subtitle: "Tell us about your academic goals",
      fields: (
        <>
          <Field label="Target GPA" placeholder="4.0" value={form.gpa} onChange={(v) => set("gpa", v)} />
          <Field label="Academic Year" placeholder="2025-2026" value={form.year} onChange={(v) => set("year", v)} />
          <Field label="College Goal (optional)" placeholder="e.g. UT Austin, USC..." value={form.goal} onChange={(v) => set("goal", v)} />
        </>
      ),
      valid: form.gpa.trim(),
    },
    {
      title: "You're all set! 🚀",
      subtitle: "Your AP Success Coach is ready. Let's start studying!",
      fields: (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎓</div>
          <div style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            <div><strong style={{ color: "var(--text)" }}>Name:</strong> {form.name}</div>
            <div><strong style={{ color: "var(--text)" }}>School:</strong> {form.school}</div>
            <div><strong style={{ color: "var(--text)" }}>Target GPA:</strong> {form.gpa}</div>
            {form.goal && <div><strong style={{ color: "var(--text)" }}>Dream College:</strong> {form.goal}</div>}
          </div>
        </div>
      ),
      valid: true,
    },
  ];

  const current = steps[step];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "2rem",
    }}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= step ? "var(--accent)" : "var(--border)",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>{current.title}</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{current.subtitle}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {current.fields}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={!current.valid}
            style={{ opacity: current.valid ? 1 : 0.5 }}
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else onComplete(form);
            }}
          >
            {step < steps.length - 1 ? "Continue →" : "Start Learning 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.4rem", fontWeight: 500 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "0.7rem 1rem",
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: 10, color: "var(--text)", fontSize: "0.95rem",
          outline: "none", transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
