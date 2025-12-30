import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Use Gemini 2.5 Flash - The current stable free-tier model
    const MODEL_NAME = "gemini-2.5-flash"; 
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Lower temperature = more reliable answers
          maxOutputTokens: 1000,
        },
        // IMPORTANT: Prevent empty responses due to safety blocks
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      }),
    });

    const data = await response.json();

    // Log this to your Terminal (where you ran 'npm start') to see the real reason
    console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gemini API failed",
        details: data?.error?.message || data,
      });
    }

    // Extract text safely
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      // Check if it was blocked
      const finishReason = data?.candidates?.[0]?.finishReason;
      return res.json({ 
        response: `AI responded but gave no text. Reason: ${finishReason || "Unknown"}. Check your terminal logs.` 
      });
    }

    res.json({ response: text });

  } catch (error) {
    console.error("BACKEND CATCH:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;