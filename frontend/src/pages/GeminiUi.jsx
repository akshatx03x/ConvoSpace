// GeminiChatUI.jsx (FINAL CONVOSPACE BRANDING & FIXED HEIGHT RESPONSE)
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Bot, Send, Copy, Eye, EyeOff, Loader, Sparkles, Share2, CornerDownLeft } from 'lucide-react';

// Design Tokens (Using the consistent set)
const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',       // Brighter Blue
    primaryDark: '#005ACF',
    secondary: '#FF4500',     // Orange-red
    tertiary: '#AF52DE',      // Purple
    surface: '#FFFFFF',       // Pure white
    surfaceElevated: '#F0F2F5', // Lightest grey
    surfaceHighlight: '#E0E5EC', // Slightly darker for active states
    border: '#E0E0E0',        // Light border
    text: {
      primary: '#1C1C1E',     // Darkest grey
      secondary: '#6A6A6A',   // Medium grey
      placeholder: '#A0A0A0',
      white: '#FFFFFF'
    },
    accentGradient: 'linear-gradient(45deg, #007AFF, #5AC8FA)',
    aiGradient: 'linear-gradient(90deg, #AF52DE, #FF00FF)',
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.16)',
    input: '0px 2px 8px rgba(0, 0, 0, 0.1)'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    full: '9999px',
  },
  animation: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const PLACEHOLDER_TEXT = DESIGN_TOKENS.colors.text.placeholder;
const WHITE_TEXT = DESIGN_TOKENS.colors.text.white;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const HIGHLIGHT_BG = DESIGN_TOKENS.colors.surfaceHighlight;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const AI_GRADIENT = DESIGN_TOKENS.colors.aiGradient;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.accentGradient;

// Fixed height for the response area content
const MAX_RESPONSE_HEIGHT = '350px'; 

const GeminiChatUI = forwardRef((props, ref) => {
  const [query, setQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);
  const textareaRef = useRef(null);
  const responseAreaRef = useRef(null); // Ref for the scrollable content area

  useImperativeHandle(ref, () => ({
    ask: handleAsk,
  }));

  const handleAsk = async (apiQuery = query) => {
    if (apiQuery.trim() === '') return;
    setIsSearching(true);
    setIsPreviewing(true);
    setResponseText('');
    setIsCopied(false);
    setIsShared(false);

    // Auto-scroll response area to top when starting a new query
    if (responseAreaRef.current) {
        responseAreaRef.current.scrollTop = 0;
    }

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
      setQuery(''); 
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
    if (!responseText) return;
    navigator.clipboard.writeText(responseText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!responseText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Response from ConvoSpace',
          text: responseText,
        });
        setIsShared(true);
      } catch (error) {
        handleCopy(); 
      }
    } else {
      handleCopy();
    }
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };
  
  const handlePreview = () => setIsPreviewing(!isPreviewing);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 160;
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
    return { __html: `<p style="color: ${SECONDARY_TEXT};">Loading preview library...</p>` };
  };

  const LoadingIndicator = () => (
    <div className="flex flex-col py-10 items-center justify-center text-center h-full">
      <Loader className="animate-spin h-10 w-10 mb-4" style={{ color: DESIGN_TOKENS.colors.tertiary }} /> 
      <p className="text-xl font-semibold" style={{ color: PRIMARY_TEXT }}>Generating insights...</p>
      <p className="text-sm mt-2" style={{ color: SECONDARY_TEXT }}>The answer is on its way.</p>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div 
        className="w-full max-w-sm rounded-xl p-8 flex flex-col items-center justify-center text-center" 
        style={{ 
          backgroundColor: SURFACE_BG, 
          boxShadow: DESIGN_TOKENS.shadows.md, 
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: DESIGN_TOKENS.radius.lg
        }}
      >
        <Sparkles size={48} style={{ color: DESIGN_TOKENS.colors.tertiary }} className="mb-4 animate-pulse-slow"/> 
        <h3 className="text-3xl font-bold mb-2" style={{ color: PRIMARY_TEXT }}>ConvoSpace AI</h3>
        <p className="text-center text-md leading-relaxed" style={{ color: SECONDARY_TEXT }}>
          Your intelligent co-pilot for meetings. Ask about notes, brainstorm, or summarize discussions.
        </p>
      </div>
    </div>
  );

  const showWelcomeScreen = !isSearching && responseText.trim() === '';

  const buttonBaseClasses = `
    flex items-center px-3 py-1.5 rounded-full text-sm font-medium
    transition-all duration-200 ease-in-out
    hover:scale-[1.03] active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div 
      className="relative h-full flex flex-col rounded-xl overflow-hidden" 
      style={{
        minHeight: '40vh',
        backgroundColor: ELEVATED_BG, 
        color: PRIMARY_TEXT,
        boxShadow: DESIGN_TOKENS.shadows.lg, 
        borderRadius: DESIGN_TOKENS.radius.xl 
      }}
    >
        {/* Header - ConvoSpace Branding */}
        <div
            className="p-4 flex items-center justify-between"
            style={{ 
                background: AI_GRADIENT, 
                color: WHITE_TEXT,
                boxShadow: DESIGN_TOKENS.shadows.sm,
            }}
        >
            <div className="flex items-center">
                <Sparkles size={24} className="mr-3"/>
                <span className="text-xl font-bold">ConvoSpace</span> 
            </div>
            <span className="text-xs opacity-80">AI Co-pilot</span>
        </div>
        
        {/* Response Area Container (Flex-Grow to fill space) */}
        <div 
          className="flex-grow overflow-hidden p-4 md:p-6"
          style={{ backgroundColor: SURFACE_BG }} 
        >
            {showWelcomeScreen ? <WelcomeScreen /> : (
              <div className="w-full">
                  {/* Controls (Share, Copy, Preview) */}
                  <div className="flex justify-end space-x-2 mb-4">
                      
                      {/* Share Button */}
                      <button
                          onClick={handleShare}
                          disabled={isSearching || !responseText}
                          className={`${buttonBaseClasses} ${isShared ? 'bg-green-500 text-white' : 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                      >
                          <Share2 size={16} className="mr-1" />
                          {isShared ? 'Shared!' : 'Share'}
                      </button>

                      {/* Copy Button */}
                      <button
                          onClick={handleCopy}
                          disabled={isSearching || !responseText}
                          className={`${buttonBaseClasses} ${isCopied ? 'bg-green-500 text-white' : 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                      >
                          <Copy size={16} className="mr-1" />
                          {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                      
                      {/* Preview Toggle Button */}
                      <button
                          onClick={handlePreview}
                          disabled={isSearching || !responseText}
                          className={`${buttonBaseClasses} ${isPreviewing ? 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50' : 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                      >
                          {isPreviewing ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                          {isPreviewing ? 'Plain Text' : 'Rendered'}
                      </button>
                  </div>
                  
                  {/* Content Display (Fixed Height with Scroll) */}
                  <div 
                      ref={responseAreaRef}
                      className="w-full rounded-lg p-4 md:p-6 shadow-sm overflow-y-auto" // Added overflow-y-auto
                      style={{ 
                          backgroundColor: ELEVATED_BG,
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: DESIGN_TOKENS.radius.md,
                          height: MAX_RESPONSE_HEIGHT, // Fixed height applied here
                      }}
                  >
                      {isSearching ? <LoadingIndicator /> : (
                          responseText ? (
                              isPreviewing ? (
                                  <div className="markdown-body" dangerouslySetInnerHTML={renderMarkdownPreview()} style={{ color: PRIMARY_TEXT, lineHeight: '1.7', fontSize: '1rem' }}></div>
                              ) : (
                                  <pre className="p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-sm" style={{ backgroundColor: SURFACE_BG, color: PRIMARY_TEXT, border: `1px solid ${BORDER_COLOR}` }}>{responseText}</pre>
                              )
                          ) : null
                      )}
                  </div>
              </div>
            )}
        </div>

        {/* Input Bar */}
        <div className="w-full flex-shrink-0 p-4" style={{ backgroundColor: ELEVATED_BG, borderTop: `1px solid ${BORDER_COLOR}` }}>
            <div 
                className="relative flex items-end p-2 rounded-xl shadow-input" 
                style={{ 
                    backgroundColor: SURFACE_BG, 
                    border: `1px solid ${BORDER_COLOR}`,
                    borderRadius: DESIGN_TOKENS.radius.xl, 
                }}
            >
                
                <div className="flex items-center justify-center p-2 pl-3 mr-1">
                    <Sparkles size={20} style={{ color: DESIGN_TOKENS.colors.tertiary }} />
                </div>
                
                <textarea
                    ref={textareaRef}
                    className="flex-1 bg-transparent mb-2 focus:outline-none text-base resize-none overflow-y-hidden pt-1.5"
                    style={{ color: PRIMARY_TEXT, '::placeholder': { color: PLACEHOLDER_TEXT } }}
                    placeholder="Ask ConvoAI anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows="1"
                />
                
                <button
                    className={`p-2 rounded-lg transition-colors duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50`}
                    style={{ background: ACCENT_GRADIENT, borderRadius: DESIGN_TOKENS.radius.lg }} 
                    onClick={() => handleAsk()}
                    disabled={!query.trim() || isSearching}
                >
                    <Send size={20} className="text-white" />
                </button>
            </div>
            <p className="text-right text-xs mt-2 mr-3" style={{ color: SECONDARY_TEXT }}>
                Press <span className="font-semibold px-1 py-0.5 rounded" style={{ backgroundColor: HIGHLIGHT_BG, color: PRIMARY_TEXT }}><CornerDownLeft size={10} className="inline-block mr-0.5 relative -top-px"/>Enter</span> to send
            </p>
        </div>
    </div>
  );
});

export default GeminiChatUI;