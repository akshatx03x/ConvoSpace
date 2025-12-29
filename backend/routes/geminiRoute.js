import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("=== GEMINI ROUTE HIT ===");
    console.log("BODY:", req.body);
    console.log(
      "API KEY:",
      process.env.GEMINI_API_KEY ? "FOUND" : "MISSING"
    );

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
      }),
    });

    const data = await response.json();
    console.log("GEMINI RAW RESPONSE:", data);

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API failed",
        details: data,
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({ response: text });
  } catch (error) {
    console.error("GEMINI CATCH ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
