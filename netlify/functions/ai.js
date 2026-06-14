export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { mode, subject, unit, topic, difficulty, count, question, history } = body;

  // Schemas force the API to return guaranteed-valid JSON (no parse failures,
  // backslashes/control chars escaped correctly even for LaTeX math).
  const QUESTION_SCHEMA = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        question: { type: "STRING" },
        options: { type: "ARRAY", items: { type: "STRING" } },
        correct: { type: "STRING" },
        explanation: { type: "STRING" },
        concept: { type: "STRING" },
        memoryTrick: { type: "STRING" },
        examTip: { type: "STRING" },
        wrongAnswerHelp: {
          type: "OBJECT",
          properties: { A: { type: "STRING" }, B: { type: "STRING" }, C: { type: "STRING" }, D: { type: "STRING" } },
        },
      },
      required: ["question", "options", "correct", "explanation"],
    },
  };

  const PLAN_SCHEMA = {
    type: "OBJECT",
    properties: {
      plan: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            day: { type: "NUMBER" },
            title: { type: "STRING" },
            tasks: { type: "ARRAY", items: { type: "STRING" } },
            focus: { type: "STRING" },
          },
        },
      },
    },
  };

  let prompt = "";

  if (mode === "generate_questions") {
    prompt = `You are an expert AP teacher. Generate exactly ${count} ${difficulty} level multiple choice practice questions for:
Subject: ${subject}
Unit: ${unit}
Topic(s): ${topic}

If multiple topics are listed above, distribute the questions roughly evenly across them.

MATH FORMATTING: For any mathematical expressions, use LaTeX wrapped in single dollar signs, e.g. $\\frac{x^3}{y}$ or $\\log_b(x)$. Do this in the question text, all four options, and the explanations.

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON array.

Format:
[
  {
    "id": 1,
    "question": "question text here",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A",
    "explanation": "Why A is correct...",
    "concept": "Key concept to remember",
    "memoryTrick": "Easy way to remember this",
    "examTip": "How this shows up on AP exam",
    "wrongAnswerHelp": { "A": "Why A is wrong...", "B": "...", "C": "...", "D": "..." }
  }
]

CRITICAL: The correct answer can be ANY letter (A, B, C, or D) - vary it naturally, do not always make it A. In wrongAnswerHelp, provide an entry for EACH of the three INCORRECT options (every letter that is NOT the correct answer). Do not include the correct letter in wrongAnswerHelp.`;
  } else if (mode === "tutor_chat") {
    const historyText = (history || [])
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n");

    prompt = `You are a patient, encouraging AP tutor helping a Grade 12 student. You are teen-friendly, motivating, and explain things clearly with examples.

Previous conversation:
${historyText}

Student's question: ${question}

Respond in a helpful, conversational way. Use simple language. If relevant, give a short example. Keep response under 200 words.`;
  } else if (mode === "study_plan") {
    prompt = `You are an AP exam prep coach. Create a 5-day study plan for:
Subject: ${subject}
Unit: ${unit}
Exam Date: ${body.examDate || "in 1 week"}

Return ONLY valid JSON:
{
  "plan": [
    { "day": 1, "title": "Day title", "tasks": ["task1", "task2", "task3"], "focus": "what to focus on" }
  ]
}`;
  }

  const generationConfig = { temperature: 0.7, maxOutputTokens: 16384, thinkingConfig: { thinkingBudget: 0 } };
  if (mode === "generate_questions") {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = QUESTION_SCHEMA;
  } else if (mode === "study_plan") {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = PLAN_SCHEMA;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: `Gemini: ${data.error.message}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return new Response(JSON.stringify({ error: "AI returned an empty response. Please try again." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (mode === "generate_questions" || mode === "study_plan") {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/ai" };
