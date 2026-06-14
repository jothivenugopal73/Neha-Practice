import { useState } from "react";
import courses from "../../courses.json";
import { extractText } from "../extractText.js";

export default function Materials({ materials, onAdd, onDelete }) {
  const [subjectId, setSubjectId] = useState(courses[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = async (fileList) => {
    setError(null);
    const files = Array.from(fileList);
    for (const file of files) {
      setBusy(true);
      try {
        const text = await extractText(file);
        if (!text || text.length < 20) {
          setError(`"${file.name}" had no readable text (it may be a scanned image).`);
          continue;
        }
        onAdd({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          subjectId,
          chars: text.length,
          text,
          addedAt: new Date().toISOString(),
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
  };

  const subjectName = (id) => courses.find((c) => c.id === id)?.name || "Unknown subject";
  const grouped = courses
    .map((c) => ({ course: c, items: materials.filter((m) => m.subjectId === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>📂 My Materials</h2>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Upload your class notes, study guides, or teacher slides (PDF or Word). Then in Practice you can
        generate questions straight from your own material — perfect for school tests.
      </p>

      {/* Upload card */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.6rem" }}>Add a document</div>
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.4rem" }}>
          Which subject is this for?
        </label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          style={{
            width: "100%", padding: "0.6rem 0.9rem", background: "var(--bg3)",
            border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)",
            fontSize: "0.95rem", marginBottom: "1rem", outline: "none",
          }}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <label
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "0.5rem", padding: "1.75rem", border: "2px dashed var(--border)", borderRadius: 12,
            cursor: busy ? "default" : "pointer", textAlign: "center",
            background: "var(--bg3)", transition: "border-color 0.2s",
          }}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--border)"; if (!busy) handleFiles(e.dataTransfer.files); }}
        >
          <div style={{ fontSize: "1.8rem" }}>{busy ? "⏳" : "📄"}</div>
          <div style={{ fontWeight: 600 }}>{busy ? "Reading document..." : "Click or drop a PDF / Word file"}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>PDF or .docx · stays on this device</div>
          <input
            type="file" accept=".pdf,.docx" multiple hidden disabled={busy}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {error && (
          <div style={{ marginTop: "0.75rem", color: "var(--red)", fontSize: "0.85rem" }}>⚠️ {error}</div>
        )}
      </div>

      {/* Saved materials */}
      {grouped.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
          No materials yet. Upload your first document above.
        </div>
      ) : (
        grouped.map(({ course, items }) => (
          <div key={course.id} style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.6rem" }}>{course.icon} {course.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {items.map((m) => (
                <div key={m.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {m.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {(m.chars / 1000).toFixed(1)}k characters · added {new Date(m.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(m.id)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem 0.5rem" }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
