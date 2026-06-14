const MODEL = "gemini-2.5-flash";        // accurate model (verified 100% in eval)
const CHUNK_SIZE = 5;                     // questions per parallel call (~14s each)

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
    required: ["question", "options", "correct", "explanation", "wrongAnswerHelp"],
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

async function callGemini(apiKey, prompt, generationConfig) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(`Gemini: ${data.error.message}`);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("AI returned an empty response. Please try again.");
  return text;
}

function questionPrompt({ subject, unit, topic, difficulty, count }) {
  return `You are an expert AP teacher. Generate exactly ${count} ${difficulty} level multiple choice practice questions for:
Subject: ${subject}
Unit: ${unit}
Topic(s): ${topic}

If multiple topics are listed above, distribute the questions roughly evenly across them.

MATH FORMATTING: For any mathematical expressions, use LaTeX wrapped in single dollar signs, e.g. $\\frac{x^3}{y}$ or $\\log_b(x)$. Do this in the question text, all four options, and the explanations.

Each question needs: question, 4 options labeled "A) ".."D) ", correct letter, explanation, concept, memoryTrick, examTip, and wrongAnswerHelp.

BE CONCISE: explanation max 3 sentences; concept, memoryTrick, examTip, and each wrongAnswerHelp entry max 1 sentence each. Do not over-explain.

CRITICAL: The correct answer can be ANY letter (A, B, C, or D) - vary it naturally, do not always make it A. In wrongAnswerHelp, provide an entry for EACH of the three INCORRECT options (every letter that is NOT the correct answer). Do not include the correct letter in wrongAnswerHelp.`;
}

// Split a total count into chunks of CHUNK_SIZE, e.g. 20 -> [5,5,5,5], 7 -> [5,2]
function chunkCounts(total) {
  const chunks = [];
  let remaining = total;
  while (remaining > 0) {
    chunks.push(Math.min(CHUNK_SIZE, remaining));
    remaining -= CHUNK_SIZE;
  }
  return chunks;
}

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

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

  try {
    const body = await request.json();
    const { mode, subject, unit, topic, difficulty, count, question, history } = body;

    // ---- QUESTION GENERATION: parallel batches of 5 to stay under the timeout ----
    if (mode === "generate_questions") {
      const total = Math.max(1, Math.min(20, Number(count) || 5));
      const counts = chunkCounts(total);
      const genConfig = {
        temperature: 0.7,
        maxOutputTokens: 32768,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: QUESTION_SCHEMA,
      };

      // Generate one batch; retry once if the JSON is somehow incomplete.
      const genBatch = async (c) => {
        const p = questionPrompt({ subject, unit, topic, difficulty, count: c });
        try {
          return JSON.parse(await callGemini(apiKey, p, genConfig));
        } catch {
          return JSON.parse(await callGemini(apiKey, p, genConfig));
        }
      };

      const batches = await Promise.all(counts.map((c) => genBatch(c)));

      const merged = batches.flat().map((q, i) => ({ ...q, id: i + 1 }));
      return json({ result: merged });
    }

    // ---- STUDY PLAN ----
    if (mode === "study_plan") {
      const prompt = `You are an AP exam prep coach. Create a 5-day study plan for:
Subject: ${subject}
Unit: ${unit}
Exam Date: ${body.examDate || "in 1 week"}

Return a JSON object with a "plan" array; each day has day (number), title, tasks (array), focus.`;
      const text = await callGemini(apiKey, prompt, {
        temperature: 0.7, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json", responseSchema: PLAN_SCHEMA,
      });
      return json({ result: JSON.parse(text) });
    }

    // ---- TUTOR CHAT ----
    if (mode === "tutor_chat") {
      const historyText = (history || [])
        .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
        .join("\n");
      const prompt = `You are a patient, encouraging AP tutor helping a Grade 12 student. You are teen-friendly, motivating, and explain things clearly with examples.

Previous conversation:
${historyText}

Student's question: ${question}

Respond in a helpful, conversational way. Use simple language. If relevant, give a short example. Keep response under 200 words.`;
      const text = await callGemini(apiKey, prompt, {
        temperature: 0.7, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 },
      });
      return json({ result: text });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
};

export const config = { path: "/api/ai" };
