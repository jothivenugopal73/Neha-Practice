import { useState } from "react";

export default function Profile({ profile, onSave }) {
  const [form, setForm] = useState(profile || {});
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>👤 Profile</h2>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>Update your information and goals</p>

      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field label="Name" value={form.name || ""} onChange={(v) => set("name", v)} />
          <Field label="Grade" value={form.grade || ""} onChange={(v) => set("grade", v)} />
          <Field label="School" value={form.school || ""} onChange={(v) => set("school", v)} />
          <Field label="Academic Year" value={form.year || ""} onChange={(v) => set("year", v)} />
          <Field label="Target GPA" value={form.gpa || ""} onChange={(v) => set("gpa", v)} />
          <Field label="Dream College" value={form.goal || ""} onChange={(v) => set("goal", v)} placeholder="Optional" />
        </div>

        <button
          className="btn btn-primary"
          style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center", padding: "0.9rem" }}
          onClick={handleSave}
        >
          {saved ? "✅ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.4rem", fontWeight: 500 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        style={{
          width: "100%", padding: "0.7rem 1rem",
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: 10, color: "var(--text)", fontSize: "0.95rem", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
