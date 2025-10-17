const express = require('express');
const router = express.Router();

// POST endpoint to proxy requests to Gemini API
router.post('/', async (req, res) => {
  try {
    const response = await fetch(process.env.GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Gemini API:', error);
    res.status(500).json({ error: 'Failed to fetch from Gemini API' });
  }
});

module.exports = router;
