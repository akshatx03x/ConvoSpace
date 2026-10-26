// GeminiChatUI.jsx (Redesigned to perfectly match Group Chat UI & experience)
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useSocket } from '../context/SocketProvider';
import { toast } from 'react-toastify';
import { Bot, Send, Copy, Check, Share2, Trash2, Loader2, MessageSquare } from 'lucide-react';

// Design Tokens (Identical to Notepad.jsx for 100% visual harmony)
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
    success: '#4CAF50',
    delete: '#FF3B30',
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.16)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    full: '9999px',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.accentGradient;

const QUICK_PROMPTS = [
  { label: 'Explain a concept', prefix: 'Explain in simple terms with examples: ', text: 'Explain how this works in simple terms with examples: ' },
  { label: 'Compare options', prefix: 'Compare the pros and cons of: ', text: 'Compare the pros and cons of: ' },
  { label: 'Brainstorm solutions', prefix: 'Give creative ideas and practical solutions for: ', text: 'Brainstorm creative ideas and practical solutions for: ' },
  { label: 'Best practices', prefix: 'What are the recommended best practices and key principles for: ', text: 'What are the industry best practices and key principles for: ' },
];

const GeminiChatUI = forwardRef(({ room }, ref) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sharedId, setSharedId] = useState(null);
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(!!window.markdownit);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Markdown-it script loader for rich responses
  useEffect(() => {
    if (window.markdownit) {
      setIsMarkdownLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js';
    script.onload = () => setIsMarkdownLoaded(true);
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSearching]);

  const handleAsk = async (promptText = query) => {
    const textToSend = promptText.trim();
    if (!textToSend || isSearching) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      name: 'You',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsSearching(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.message || 'AI request failed');
      }

      const aiReplyText = data.response || 'No response returned from AI.';
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        name: 'ConvoSpace AI',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gemini error:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        name: 'ConvoSpace AI',
        text: `⚠️ **Error:** ${error.message || 'Could not fetch response from AI. Please try again.'}`,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  useImperativeHandle(ref, () => ({
    ask: handleAsk,
  }));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleSelectPrompt = (prompt) => {
    if (query.trim()) {
      handleAsk(`${prompt.prefix}${query.trim()}`);
    } else {
      setQuery(prompt.text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const copyMessage = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied AI response to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareToGroupChat = (text, id) => {
    if (!socket || !room) {
      toast.info('Connect to a room to share directly with Meeting Discussion');
      return;
    }
    // Clean markdown bold/heading markers slightly for clean chat presentation
    const cleanSnippet = text.length > 500 ? `${text.substring(0, 500)}...` : text;
    socket.emit('send:message', {
      room,
      message: `🤖 [ConvoSpace AI]: ${cleanSnippet}`,
    });
    setSharedId(id);
    toast.success('Shared AI response to Meeting Discussion!');
    setTimeout(() => setSharedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderMarkdown = (content) => {
    if (window.markdownit && isMarkdownLoaded) {
      try {
        const md = window.markdownit({ html: false, linkify: true, breaks: true });
        return { __html: md.render(content) };
      } catch (err) {
        console.error('Markdown parse error:', err);
      }
    }
    return { __html: content.replace(/\n/g, '<br/>') };
  };

  return (
    <div
      className="w-full h-full flex flex-col rounded-xl overflow-hidden"
      style={{
        minHeight: '40vh',
        backgroundColor: ELEVATED_BG,
        color: PRIMARY_TEXT,
        boxShadow: DESIGN_TOKENS.shadows.lg,
        borderRadius: DESIGN_TOKENS.radius.xl,
      }}
    >
      {/* Header (Aligned with Notepad.jsx) */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          backgroundColor: SURFACE_BG,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxShadow: DESIGN_TOKENS.shadows.sm,
        }}
      >
        <div className="flex items-center">
          <Bot size={20} style={{ color: PRIMARY_COLOR }} className="mr-3" />
          <span className="text-lg font-semibold" style={{ color: PRIMARY_TEXT }}>ConvoSpace AI</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
            Room: {room}
          </span>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Clear AI Chat"
              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors ml-1"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Scroll Area (Elevated Background matching Notepad) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
        style={{
          backgroundColor: ELEVATED_BG,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8" style={{ color: SECONDARY_TEXT }}>
            <Bot size={48} style={{ color: PRIMARY_COLOR }} className="mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: PRIMARY_TEXT }}>
              ConvoSpace AI
            </h3>
            <p className="text-sm max-w-xs mb-4">
              Ask questions, brainstorm solutions, or get answers to assist your meeting.
            </p>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectPrompt(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left shadow-xs"
                  style={{
                    backgroundColor: SURFACE_BG,
                    borderColor: BORDER_COLOR,
                    color: PRIMARY_TEXT,
                  }}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {isUser ? (
                  <div
                    className="max-w-[78%] p-3.5 rounded-lg shadow-sm transition-all duration-150"
                    style={{
                      backgroundColor: PRIMARY_COLOR,
                      color: DESIGN_TOKENS.colors.text.white,
                      boxShadow: DESIGN_TOKENS.shadows.sm,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-xs font-bold text-white/90">
                        {msg.name}
                      </span>
                      {msg.time && (
                        <span className="text-[10px] text-white/70">
                          {msg.time}
                        </span>
                      )}
                    </div>
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ) : (
                  <div
                    className="max-w-[85%] p-4 rounded-lg shadow-md transition-all duration-150 hover:shadow-lg"
                    style={{
                      backgroundColor: SURFACE_BG,
                      borderLeft: `5px solid ${PRIMARY_COLOR}`,
                      boxShadow: DESIGN_TOKENS.shadows.md,
                    }}
                  >
                    {/* Note Card Header */}
                    <div className="flex items-center justify-between mb-2 pb-1 border-b" style={{ borderColor: BORDER_COLOR }}>
                      <span className="text-xs font-bold flex items-center" style={{ color: PRIMARY_COLOR }}>
                        <Bot size={14} className="mr-1.5" />
                        {msg.name}
                      </span>
                      {msg.time && (
                        <span className="text-xs" style={{ color: SECONDARY_TEXT }}>
                          {msg.time}
                        </span>
                      )}
                    </div>

                    {/* Note Card Body */}
                    <div
                      className="text-sm leading-relaxed space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded text-gray-800 break-words"
                      dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                    />

                    {/* Action Buttons styled identically to Notepad.jsx */}
                    <div className="flex space-x-2 pt-2.5 mt-3 border-t" style={{ borderColor: BORDER_COLOR }}>
                      {/* Copy button */}
                      <button
                        onClick={() => copyMessage(msg.text, msg.id)}
                        className="text-xs font-medium py-1 px-3 rounded-full transition-colors hover:bg-blue-500 hover:text-white"
                        style={{ border: `1px solid ${PRIMARY_COLOR}`, color: PRIMARY_COLOR }}
                      >
                        {copiedId === msg.id ? <Check size={13} className="inline-block mr-1 text-green-600" /> : <Copy size={13} className="inline-block mr-1 relative -top-px" />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>

                      {/* Share to Meeting Discussion */}
                      {room && (
                        <button
                          onClick={() => shareToGroupChat(msg.text, msg.id)}
                          className="text-xs font-medium py-1 px-3 rounded-full transition-colors hover:bg-green-500 hover:text-white"
                          style={{ border: `1px solid ${DESIGN_TOKENS.colors.success}`, color: DESIGN_TOKENS.colors.success }}
                        >
                          <Share2 size={13} className="inline-block mr-1 relative -top-px" />
                          {sharedId === msg.id ? 'Shared' : 'Share'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* AI Typing / Thinking Indicator */}
        {isSearching && (
          <div className="flex justify-start">
            <div
              className="p-3.5 rounded-lg shadow-sm flex items-center space-x-2 border"
              style={{
                backgroundColor: SURFACE_BG,
                borderColor: BORDER_COLOR,
              }}
            >
              <Loader2 size={16} style={{ color: PRIMARY_COLOR }} className="animate-spin" />
              <span className="text-xs font-medium" style={{ color: SECONDARY_TEXT }}>
                ConvoSpace AI is thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div
        className="p-3 flex items-center"
        style={{
          backgroundColor: SURFACE_BG,
          borderTop: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask ConvoSpace AI..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-3 rounded-full text-sm border focus:ring-1 focus:ring-opacity-70 focus:outline-none transition-all duration-200"
          style={{
            backgroundColor: ELEVATED_BG,
            color: PRIMARY_TEXT,
            borderColor: BORDER_COLOR,
            '--tw-ring-color': PRIMARY_COLOR,
            boxShadow: DESIGN_TOKENS.shadows.sm,
          }}
        />
        <button
          onClick={() => handleAsk()}
          disabled={!query.trim() || isSearching}
          className={`p-3 ml-2 rounded-full transition-transform duration-200 hover:scale-[1.05] active:scale-[0.98] ${
            !query.trim() || isSearching ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{
            background: ACCENT_GRADIENT,
            color: DESIGN_TOKENS.colors.text.white,
            boxShadow: DESIGN_TOKENS.shadows.md,
          }}
          title="Send query"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
});

export default GeminiChatUI;