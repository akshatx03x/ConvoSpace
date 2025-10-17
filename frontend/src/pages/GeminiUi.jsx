import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const THEME_MAIN_BG = '#c3a6a0';
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';
const GRADIENT_BG_DASHBOARD = 'linear-gradient(to right bottom, #E0C0C0, #EAE0E0, #a06c78)';

const GeminiChatUI = forwardRef((props, ref) => {
  const [query, setQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    ask: handleAsk,
  }));

  const handleAsk = async (apiQuery = query) => {
    if (apiQuery.trim() === '') return;
    setIsSearching(true);
    setIsPreviewing(true);
    setResponseText('');
    setIsCopied(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: apiQuery }] }] })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response available';
      setResponseText(answer);
    } catch (error) {
      console.error(error);
      setResponseText('Error: Unable to get response.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePreview = () => setIsPreviewing(!isPreviewing);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [query]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js";
    script.onload = () => setIsMarkdownLoaded(true);
    script.onerror = () => setIsMarkdownLoaded(false);
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const renderMarkdownPreview = () => {
    if (isMarkdownLoaded && window.markdownit) {
      const md = window.markdownit({ html: true, linkify: true, typographer: true });
      return { __html: md.render(responseText) };
    }
    return { __html: `<p style="color: ${THEME_TEXT_COLOR};">Loading preview...</p>` };
  };

  const LoadingIndicator = () => (
    <div className="flex flex-col py-10 items-center justify-center text-center h-full">
      <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: THEME_ACCENT_COLOR }}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg font-medium" style={{ color: THEME_TEXT_COLOR }}>Generating response...</p>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="w-full max-w-lg mx-auto mb-4 h-full flex items-center justify-center">
      <div className="w-full h-full rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderColor: THEME_ACCENT_COLOR + '60' }}>
        <span className="text-6xl mb-4">👋</span>
        <h3 className="text-3xl font-bold mb-2" style={{ color: THEME_ACCENT_COLOR }}>Hi there!</h3>
        <p className="text-center text-lg" style={{ color: THEME_TEXT_COLOR }}>
          Ask me anything to get started. I'm here to help you and your colleague!
        </p>
      </div>
    </div>
  );

  const showWelcomeScreen = !isSearching && responseText.trim() === '';

  return (
    <div className="relative h-full flex flex-col p-4 pt-20" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
      <div className="flex-grow overflow-y-auto mb-4 p-2">
        {showWelcomeScreen ? <WelcomeScreen /> : (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="w-full rounded-2xl shadow-xl p-4 border" style={{ backgroundColor: 'white', borderColor: THEME_ACCENT_COLOR + '60' }}>
              <div className="flex justify-end space-x-2 mb-4">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-full text-sm font-medium shadow-md transition-colors duration-200"
                  style={{ backgroundColor: isCopied ? '#4CAF50' : THEME_ACCENT_COLOR, color: 'white', borderColor: THEME_ACCENT_COLOR }}
                >
                  {isCopied ? 'Copied! 🎉' : 'Copy'}
                </button>
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 rounded-full text-sm font-medium shadow-md transition-colors duration-200 text-white"
                  style={{ backgroundColor: THEME_ACCENT_COLOR }}
                >
                  {isPreviewing ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              {responseText ? (
                isPreviewing ? (
                  <div className="markdown-body" dangerouslySetInnerHTML={renderMarkdownPreview()} style={{ color: THEME_TEXT_COLOR, lineHeight: '1.6', fontSize: '1rem' }}></div>
                ) : (
                  <pre className="p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm" style={{ backgroundColor: '#EEE', color: THEME_TEXT_COLOR }}>{responseText}</pre>
                )
              ) : <LoadingIndicator />}
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex-shrink-0">
        <div className="w-full max-w-lg mx-auto">
          <div className="relative flex items-end p-2 rounded-3xl shadow-2xl" style={{ backgroundColor: 'white', border: `2px solid ${THEME_ACCENT_COLOR}60` }}>
            <div className="flex items-center justify-center p-2 mr-2">
              <span className="font-extrabold text-lg" style={{ color: THEME_ACCENT_COLOR }}>ConvoSpace</span>
            </div>
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent placeholder-gray-500 mb-2 focus:outline-none text-base resize-none overflow-y-hidden"
              style={{ color: THEME_TEXT_COLOR }}
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
            />
            <button
              className="p-3 rounded-xl shadow-md transition-colors duration-200 hover:scale-[1.05]"
              style={{ backgroundColor: THEME_ACCENT_COLOR }}
              onClick={() => handleAsk()}
              disabled={!query.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GeminiChatUI;
