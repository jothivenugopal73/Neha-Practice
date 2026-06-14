import { useState, useEffect } from "react";
import MathText from "./MathText.jsx";

export default function QuizEngine({ config, onComplete, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate_questions",
          subject: config.subjectName,
          unit: config.unitName,
          topic: config.aiTopic || config.topicName,
          difficulty: config.difficulty,
          count: config.count,
          source: config.source,
          sourceText: config.sourceText,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(Array.isArray(data.result) ? data.result : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
  };

  const handleReveal = () => {
    if (!selected) return;
    setRevealed(true);
    const letter = selected.charAt(0);
    if (letter === questions[current].correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onBack={onBack} onRetry={loadQuestions} />;

  if (done) {
    return <ResultScreen score={score} total={questions.length} config={config} onComplete={() => onComplete(score, questions.length)} onBack={onBack} />;
  }

  const q = questions[current];
  if (!q) return null;
  const selectedLetter = selected?.charAt(0);
  const isCorrect = revealed && selectedLetter === q.correct;

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontWeight: 700, color: config.color }}>{config.subjectName}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{config.unitName}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent2)" }}>{config.topicName} · {config.difficulty}</div>
        </div>
        <div style={{ fontWeight: 700, color: "var(--muted)" }}>{current + 1} / {questions.length}</div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%`, background: config.color }} />
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Question {current + 1}
        </div>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500 }}><MathText>{q.question}</MathText></p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
        {q.options.map((opt) => {
          const letter = opt.charAt(0);
          const isSelected = selected === opt;
          let bg = "var(--card)";
          let border = "var(--border)";
          let color = "var(--text)";
          if (revealed) {
            if (letter === q.correct) { bg = "rgba(16,185,129,0.15)"; border = "var(--green)"; color = "var(--green)"; }
            else if (isSelected) { bg = "rgba(239,68,68,0.15)"; border = "var(--red)"; color = "var(--red)"; }
          } else if (isSelected) {
            bg = "rgba(99,102,241,0.15)"; border = "var(--accent)"; color = "var(--accent2)";
          }

          return (
            <button key={opt} onClick={() => handleSelect(opt)}
              style={{
                background: bg, border: `2px solid ${border}`, borderRadius: 10,
                padding: "0.85rem 1.25rem", textAlign: "left", color,
                fontSize: "0.95rem", cursor: revealed ? "default" : "pointer",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%", background: border,
                color: revealed || isSelected ? (letter === q.correct ? "var(--green)" : isSelected ? "var(--red)" : "var(--bg)") : "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                background: revealed ? (letter === q.correct ? "var(--green)" : isSelected ? "var(--red)" : "var(--muted)") : isSelected ? "var(--accent)" : "var(--muted)",
              }}>
                {letter}
              </span>
              <MathText>{opt.substring(3)}</MathText>
            </button>
          );
        })}
      </div>

      {/* Action button */}
      {!revealed ? (
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem", opacity: selected ? 1 : 0.5 }}
          disabled={!selected} onClick={handleReveal}>
          Check Answer
        </button>
      ) : (
        <div className="fade-in">
          <ExplanationPanel q={q} isCorrect={isCorrect} selectedLetter={selectedLetter} />
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem", marginTop: "1rem" }}
            onClick={handleNext}>
            {current + 1 >= questions.length ? "See Results 🎉" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

function ExplanationPanel({ q, isCorrect, selectedLetter }) {
  return (
    <div className="card fade-in" style={{
      border: `1px solid ${isCorrect ? "var(--green)" : "var(--red)"}`,
      background: isCorrect ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
    }}>
      <div style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
        {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
      </div>

      {!isCorrect && q.wrongAnswerHelp?.[selectedLetter] && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontWeight: 600, color: "var(--red)", fontSize: "0.85rem", marginBottom: 4 }}>Why your answer was wrong:</div>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}><MathText>{q.wrongAnswerHelp[selectedLetter]}</MathText></p>
        </div>
      )}

      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ fontWeight: 600, color: "var(--green)", fontSize: "0.85rem", marginBottom: 4 }}>
          {isCorrect ? "Why this is correct:" : `Correct answer (${q.correct}):`}
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}><MathText>{q.explanation}</MathText></p>
      </div>

      {q.concept && (
        <InfoRow icon="🧠" label="Key Concept" text={q.concept} />
      )}
      {q.memoryTrick && (
        <InfoRow icon="💡" label="Memory Trick" text={q.memoryTrick} />
      )}
      {q.examTip && (
        <InfoRow icon="🎓" label="AP Exam Tip" text={q.examTip} />
      )}
    </div>
  );
}

function InfoRow({ icon, label, text }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", padding: "0.6rem", background: "var(--bg3)", borderRadius: 8 }}>
      <span>{icon}</span>
      <div>
        <span style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--accent2)" }}>{label}: </span>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}><MathText>{text}</MathText></span>
      </div>
    </div>
  );
}

function ResultScreen({ score, total, config, onComplete, onBack }) {
  const pct = Math.round((score / total) * 100);
  const msg = pct >= 90 ? "Outstanding! 🌟" : pct >= 70 ? "Great work! 💪" : pct >= 50 ? "Good effort! Keep practicing." : "Keep going — practice makes perfect! 🔄";

  return (
    <div className="fade-in card" style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{pct >= 70 ? "🎉" : "📚"}</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Quiz Complete!</h2>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>{msg}</p>
      <div style={{ fontSize: "3rem", fontWeight: 800, color: pct >= 70 ? "var(--green)" : pct >= 50 ? "var(--yellow)" : "var(--red)", marginBottom: "0.5rem" }}>
        {score}/{total}
      </div>
      <div style={{ fontSize: "1.2rem", color: "var(--muted)", marginBottom: "1.5rem" }}>{pct}% accuracy</div>
      <div style={{ fontSize: "0.9rem", color: "var(--accent2)", marginBottom: "2rem" }}>
        +{score * 10} XP earned!
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onBack}>Practice More</button>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={onComplete}>Dashboard</button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "1rem" }}>
      <div style={{ fontSize: "2.5rem" }} className="pulse">🤖</div>
      <div style={{ fontWeight: 600 }}>Generating your questions...</div>
      <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Gemini AI is crafting personalized questions for you</div>
    </div>
  );
}

function ErrorScreen({ error, onBack, onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "1rem", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem" }}>⚠️</div>
      <div style={{ fontWeight: 600 }}>Couldn't load questions</div>
      <div style={{ color: "var(--muted)", fontSize: "0.9rem", maxWidth: 360 }}>{error}</div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button className="btn btn-secondary" onClick={onBack}>Go Back</button>
        <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}
