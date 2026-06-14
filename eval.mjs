// ============================================================
//  AP Success Coach — Question Quality Eval
//  Runs with:  node eval.mjs
//  No dependencies. Uses Node's built-in fetch (Node 18+).
//
//  What it does:
//   1. Generates questions using the SAME prompt as production
//   2. Runs deterministic structural checks (no AI)
//   3. Independently re-solves each question with a STRONGER model
//      (gemini-2.5-pro) that never sees the claimed answer
//   4. Flags any question where the independent solver disagrees
//   5. Writes a full report to eval-results.json
// ============================================================

import fs from "node:fs";

// ---- Load API key from .env (or environment) ----
function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const env = fs.readFileSync(".env", "utf8");
    const m = env.match(/GEMINI_API_KEY=(.+)/);
    if (m) return m[1].trim();
  } catch {}
  throw new Error("No GEMINI_API_KEY found in environment or .env file");
}
const KEY = loadKey();

const GEN_MODEL = "gemini-2.5-flash";   // same model production uses
const VERIFY_MODEL = "gemini-2.5-pro";  // stronger, independent verifier

// ---- Test matrix: math-heavy + conceptual, across difficulties ----
const TESTS = [
  { subject: "AP Precalculus", unit: "Unit 2 – Exponential and Logarithmic Functions", topic: "Properties of Logarithms", difficulty: "Advanced", count: 5 },
  { subject: "AP Precalculus", unit: "Unit 3 – Trigonometric and Polar Functions", topic: "Unit Circle", difficulty: "AP Exam Level", count: 5 },
  { subject: "AP Biology", unit: "Unit 5 – Heredity", topic: "Punnett Squares", difficulty: "Intermediate", count: 5 },
  { subject: "AP Physics 1", unit: "Unit 1 – Kinematics", topic: "Projectile Motion", difficulty: "Advanced", count: 5 },
  { subject: "AP US History", unit: "Unit 3 – Period 3 (1754–1800)", topic: "American Revolution", difficulty: "Intermediate", count: 5 },
];

const LETTERS = ["A", "B", "C", "D"];

// Same schema production uses, so the eval tests the real behavior.
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

async function callGemini(model, prompt, config = {}) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: config }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(`${model}: ${data.error.message}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ---- The PRODUCTION generation prompt (kept in sync with ai.js) ----
function genPrompt({ subject, unit, topic, difficulty, count }) {
  return `You are an expert AP teacher. Generate exactly ${count} ${difficulty} level multiple choice practice questions for:
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
    "wrongAnswerHelp": { "B": "...", "C": "...", "D": "..." }
  }
]`;
}

// ---- Deterministic structural checks (no AI) ----
function structuralCheck(q) {
  const issues = [];
  if (!q.question || typeof q.question !== "string") issues.push("missing question text");
  if (!Array.isArray(q.options) || q.options.length !== 4) issues.push("not exactly 4 options");
  if (!LETTERS.includes(q.correct)) issues.push(`invalid correct letter: ${q.correct}`);
  if (!q.explanation) issues.push("missing explanation");
  const wrong = LETTERS.filter((l) => l !== q.correct);
  if (q.wrongAnswerHelp) {
    for (const l of wrong) if (!q.wrongAnswerHelp[l]) issues.push(`missing wrongAnswerHelp for ${l}`);
  } else issues.push("missing wrongAnswerHelp");
  return issues;
}

// ---- Independent verification (verifier never sees the answer key) ----
async function verify(q) {
  const prompt = `You are an expert AP examiner. Solve this multiple choice question independently and carefully.

${q.question}

${q.options.join("\n")}

Work it out, then give your independent answer.`;
  const text = await callGemini(VERIFY_MODEL, prompt, {
    temperature: 0,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        answer: { type: "STRING" },
        confidence: { type: "STRING" },
        reasoning: { type: "STRING" },
      },
      required: ["answer"],
    },
  });
  return parseJSON(text);
}

// ---- Main ----
async function run() {
  const results = [];
  let totalQ = 0, structFails = 0, answerMismatches = 0, lowConfAgree = 0;

  for (const test of TESTS) {
    process.stdout.write(`\nGenerating: ${test.subject} / ${test.topic} (${test.difficulty})...\n`);
    let questions;
    try {
      const text = await callGemini(GEN_MODEL, genPrompt(test), {
        temperature: 0.7, maxOutputTokens: 16384, thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json", responseSchema: QUESTION_SCHEMA,
      });
      questions = parseJSON(text);
    } catch (e) {
      console.log(`  ❌ generation failed: ${e.message}`);
      results.push({ test, error: e.message });
      continue;
    }

    for (const q of questions) {
      totalQ++;
      const struct = structuralCheck(q);
      let v = null, mismatch = false;
      if (struct.length === 0) {
        try {
          v = await verify(q);
          mismatch = v.answer !== q.correct;
          if (mismatch) answerMismatches++;
          else if (v.confidence === "low") lowConfAgree++;
        } catch (e) {
          v = { error: e.message };
        }
      } else {
        structFails++;
      }

      const flagged = struct.length > 0 || mismatch;
      const mark = flagged ? "🚩" : "✅";
      console.log(`  ${mark} [${test.subject.slice(3)}] claimed=${q.correct} verified=${v?.answer ?? "-"} ${v?.confidence ? "(" + v.confidence + ")" : ""}${struct.length ? " STRUCT:" + struct.join(",") : ""}`);

      results.push({
        subject: test.subject, topic: test.topic, difficulty: test.difficulty,
        question: q.question, options: q.options,
        claimedAnswer: q.correct, verifiedAnswer: v?.answer ?? null,
        verifierConfidence: v?.confidence ?? null, verifierReasoning: v?.reasoning ?? null,
        structuralIssues: struct, answerMismatch: mismatch, flagged,
      });
    }
  }

  const passed = totalQ - structFails - answerMismatches;
  const report = {
    runAt: new Date().toISOString(),
    genModel: GEN_MODEL, verifyModel: VERIFY_MODEL,
    summary: {
      totalQuestions: totalQ,
      structurallyValid: totalQ - structFails,
      answerAgreement: `${passed}/${totalQ} (${Math.round((passed / totalQ) * 100)}%)`,
      structuralFailures: structFails,
      answerMismatches,
      lowConfidenceAgreements: lowConfAgree,
    },
    flagged: results.filter((r) => r.flagged),
    all: results,
  };

  fs.writeFileSync("eval-results.json", JSON.stringify(report, null, 2));

  console.log("\n" + "=".repeat(55));
  console.log("EVAL SUMMARY");
  console.log("=".repeat(55));
  console.log(`Total questions:        ${totalQ}`);
  console.log(`Structurally valid:     ${totalQ - structFails}`);
  console.log(`Answer agreement:       ${report.summary.answerAgreement}`);
  console.log(`Answer mismatches:      ${answerMismatches}  (need human review)`);
  console.log(`Low-confidence agrees:  ${lowConfAgree}  (worth a glance)`);
  console.log(`\nFull details written to eval-results.json`);
  if (report.flagged.length) {
    console.log(`\n🚩 ${report.flagged.length} flagged question(s):`);
    for (const f of report.flagged) {
      console.log(`\n  [${f.subject}] ${f.question?.slice(0, 90)}`);
      if (f.answerMismatch) console.log(`     claimed ${f.claimedAnswer} but verifier said ${f.verifiedAnswer} — ${f.verifierReasoning}`);
      if (f.structuralIssues?.length) console.log(`     structural: ${f.structuralIssues.join(", ")}`);
    }
  } else {
    console.log("\n🎉 No flags — all questions passed structural + independent verification.");
  }
}

run().catch((e) => { console.error("Eval crashed:", e); process.exit(1); });
