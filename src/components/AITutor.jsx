import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Explain the difference between mitosis and meiosis",
  "What is the chain rule in calculus?",
  "How do I write a strong AP essay thesis?",
  "Explain Newton's second law with an example",
  "Quiz me on the causes of the American Revolution",
];

export default function AITutor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 I'm your AP study tutor. Ask me anything — I can explain concepts, quiz you, help you understand why you got something wrong, or just chat through a tough topic. What are we working on today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "tutor_chat",
          question: msg,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.result || "Sorry, I had trouble with that. Try again?" }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Network error. Please check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)", maxWidth: 720 }}>
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>🤖 AI Tutor</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Ask anything. Explain concepts. Get quizzed. Available 24/7.</p>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20,
                padding: "0.4rem 0.9rem", color: "var(--muted)", fontSize: "0.8rem",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingRight: "0.5rem" }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-in" style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "0.6rem", fontSize: "1rem", flexShrink: 0, marginTop: 4 }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth: "75%",
              background: m.role === "user" ? "var(--accent)" : "var(--card)",
              color: m.role === "user" ? "#fff" : "var(--text)",
              padding: "0.75rem 1rem",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              border: m.role === "assistant" ? "1px solid var(--border)" : "none",
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
            <div className="card" style={{ padding: "0.75rem 1rem" }}>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%", background: "var(--muted)",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
          rows={2}
          style={{
            flex: 1, padding: "0.75rem 1rem",
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, color: "var(--text)", fontSize: "0.9rem",
            resize: "none", outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          className="btn btn-primary"
          disabled={!input.trim() || loading}
          style={{ padding: "0.75rem 1.25rem", opacity: input.trim() && !loading ? 1 : 0.5 }}
          onClick={() => send()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
