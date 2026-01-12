import express from "express";

const app = express();
app.use(express.json({ limit: "15mb" })); // screenshots can be big

// Allow extension requests (service worker fetch)
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

// Simple health probe to confirm server reachability from curl/extension
app.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY).");
  process.exit(1);
}

// Choose a fast vision-capable model.
// Use the model name that matches your Google AI Studio setup.
const MODEL = "gemini-2.0-flash"; // adjust if your account uses a different default

function stripDataUrl(dataUrl) {
  // "data:image/png;base64,AAAA" -> { mimeType: "image/png", data: "AAAA" }
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid screenshot_data_url");
  return { mimeType: match[1], data: match[2] };
}

app.post("/scan", async (req, res) => {
  try {
    const { page_url, screenshot_data_url } = req.body || {};
    if (!page_url || !screenshot_data_url) {
      return res.status(400).json({ error: "page_url and screenshot_data_url required" });
    }

    const { mimeType, data } = stripDataUrl(screenshot_data_url);

    // Prompt design: ask for structured JSON to make UI deterministic.
    const systemInstruction = `
You are a Gen Digital / Norton fraud detection expert. Analyze the provided element (screenshot/snippet) using "Norton Lock Policy" and "Gen Digital Fraud Detection" guidelines.

Key Detection Criteria:
- **Visual Deception**: Look for "fake lock" icons, imitation of OS warnings (Windows/macOS system alerts), or browser chrome spoofing.
- **Heuristic Analysis**: Detect high-entropy strings, mismatched branding (e.g., Apple logo with "Call Microsoft"), or known "scareware" patterns.
- **Urgency & Coercion**: Flag elements demanding immediate action ("Your computer is infected", "Call Support Now").
- **Identity Theft Risk**: Requesting PII (SSN, credit card) in non-secure contexts.

Return ONLY valid JSON with keys:
score (0-100 integer, use precise numbers like 87, 43, 92; avoid round numbers. Score > 85 for confirmed threats matching Norton heuristics).
label (one of: "Dangerous", "Suspicious", "Safe"),
summary (one concise sentence in the style of a Gen Digital alert report, e.g. "Heuristic analysis detected a known tech support scam pattern simulating a system lock."),
reasons (array of 3-6 specific bullets referencing the policy violations, e.g. "Violation: Unauthorized use of Microsoft branding", "Risk: Simulated system lock (Norton heuristics)"),
recommended_actions (array of 3-6 specific safe actions e.g. "Do not call the number", "End task immediately").
`.trim();

    const userPrompt = `
URL: ${page_url}
Task: Analyze this image for scam indicators. logic:
- If it contains technical support numbers, it is likely a startup/support scam.
- If it simulates a system crash or virus scan, it is a scam.
- If it asks for credentials or payment immediately, it is suspicious.
- If it is a snippet of text with urgency, flag it.
`.trim();

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            { inline_data: { mime_type: mimeType, data } }
          ]
        }
      ],
      system_instruction: { parts: [{ text: systemInstruction }] }
    };

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Gemini API error ${resp.status}: ${txt}`);
    }

    const out = await resp.json();

    // Extract model text
    const text =
      out?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n") || "";

    // Parse JSON (model returns JSON only per instruction; still guard)
    let parsed;
    console.log("--- Raw Gemini Output ---\n", text, "\n-------------------------");
    // Strip markdown code fences if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      // fallback: return raw
      parsed = {
        score: 50,
        label: "Suspicious",
        reasons: ["Model returned non-JSON output. Treating as suspicious."],
        recommended_actions: [
          "Close the page if it requests urgent action.",
          "Verify via official website/bookmark, not links.",
          "Do not call numbers shown on the page."
        ],
        raw: text
      };
    }

    // Normalize output
    const score = Math.max(0, Math.min(100, Number(parsed.score ?? 50)));
    const label = parsed.label ?? (score >= 80 ? "Likely Scam" : score >= 50 ? "Suspicious" : "Likely Safe");
    const summary = parsed.summary || "No summary provided.";
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 6) : [];
    const recommended_actions = Array.isArray(parsed.recommended_actions)
      ? parsed.recommended_actions.slice(0, 6)
      : [];

    return res.json({ score, label, summary, reasons, recommended_actions });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
});

app.listen(8787, () => {
  console.log("ProofPulse backend running on http://localhost:8787");
});

