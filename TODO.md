# TODO: Connect Gemini URL from Backend to Frontend

## Steps to Complete
- [ ] Create backend/routes/geminiRoute.js: Add a POST endpoint that forwards requests to the Gemini API using process.env.GEMINI_URL.
- [ ] Update backend/index.js: Register the new geminiRoute.
- [ ] Update frontend/src/pages/GeminiUi.jsx: Change URL to the backend proxy endpoint `${import.meta.env.VITE_API_BASE_URL}/gemini`.
- [ ] Test the Gemini API call after changes.
