// GeminiChatUI.jsx (Redesigned to perfectly match Group Chat UI & experience)
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useSocket } from '../context/SocketProvider';
import { toast } from 'react-toastify';
import { Bot, Send, Copy, Check, Share2, Trash2, Loader2, MessageSquare } from 'lucide-react';

// Design Tokens (Identical to Chats.jsx for 100% visual harmony)
const DESIGN_TOKENS = {
  colors: {
    primary: '#0066FF',       // Vibrant blue
    primaryHover: '#0052CC',
    secondary: '#FF3B30',     // Accent red
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F7', // Light gray background for contrast
    border: '#E5E5EA',
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
      tertiary: '#AEAEB2'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
  },
  radius: {
    lg: '16px',
    xl: '24px',
  }
};

const ACCENT_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.gradient;

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
      toast.info('Connect to a room to share directly with group chat');
      return;
    }
    // Clean markdown bold/heading markers slightly for clean chat presentation
    const cleanSnippet = text.length > 500 ? `${text.substring(0, 500)}...` : text;
    socket.emit('send:message', {
      room,
      message: `🤖 [ConvoSpace AI]: ${cleanSnippet}`,
    });
    setSharedId(id);
    toast.success('Shared AI response to Group Chat!');
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
      className="w-full flex flex-col overflow-hidden rounded-xl shadow-lg border"
      style={{
        height: '100%',
        minHeight: '40vh',
        backgroundColor: SURFACE_BG,
        borderColor: BORDER_COLOR,
        color: PRIMARY_TEXT,
      }}
    >
      {/* Header (Aligned with Chats.jsx) */}
      <div
        className="p-4 text-lg font-semibold flex items-center justify-between shadow-sm"
        style={{
          backgroundColor: SURFACE_BG,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <div className="flex items-center">
          <Bot size={22} style={{ color: ACCENT_COLOR }} className="mr-2.5" />
          <span>ConvoSpace AI</span>
          <span
            className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#EBF3FF', color: ACCENT_COLOR }}
          >
            AI Assistant
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Clear AI Chat"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Chat Messages Scroll Area (Elevated Background matching Chats.jsx) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
        style={{
          backgroundColor: ELEVATED_BG,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6" style={{ color: SECONDARY_TEXT }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: '#EBF3FF' }}
            >
              <Bot size={28} style={{ color: ACCENT_COLOR }} />
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: PRIMARY_TEXT }}>
              ConvoSpace AI
            </h3>
            <p className="text-sm max-w-xs mt-1">
              Ask questions, explore concepts, brainstorm solutions, or get answers to help your discussion.
            </p>

            {/* Quick Action Chips */}
            <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-sm">
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
                <div
                  className="max-w-[85%] p-3.5 rounded-xl shadow-sm transition-all duration-100"
                  style={{
                    backgroundColor: isUser ? ACCENT_COLOR : SURFACE_BG,
                    color: isUser ? SURFACE_BG : PRIMARY_TEXT,
                    border: isUser ? 'none' : `1px solid ${BORDER_COLOR}`,
                    boxShadow: DESIGN_TOKENS.shadows.sm,
                    borderTopLeftRadius: DESIGN_TOKENS.radius.lg,
                    borderTopRightRadius: DESIGN_TOKENS.radius.lg,
                    borderBottomLeftRadius: isUser ? DESIGN_TOKENS.radius.lg : DESIGN_TOKENS.radius.sm,
                    borderBottomRightRadius: isUser ? DESIGN_TOKENS.radius.sm : DESIGN_TOKENS.radius.lg,
                  }}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between mb-1 pb-1">
                    <span
                      className="text-xs font-bold flex items-center"
                      style={{ color: isUser ? SURFACE_BG : ACCENT_COLOR }}
                    >
                      {!isUser && <Bot size={14} className="mr-1" />}
                      {msg.name}
                    </span>

                    {!isUser && (
                      <div className="flex items-center space-x-1 ml-2">
                        {/* Copy button */}
                        <button
                          onClick={() => copyMessage(msg.text, msg.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>

                        {/* Share to Group Chat button */}
                        {room && (
                          <button
                            onClick={() => shareToGroupChat(msg.text, msg.id)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                            title="Share to Group Chat"
                          >
                            {sharedId === msg.id ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Body */}
                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div
                      className="text-sm leading-relaxed space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded text-gray-800"
                      dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                    />
                  )}

                  {msg.time && (
                    <div
                      className="text-[10px] text-right mt-1 opacity-70"
                      style={{ color: isUser ? SURFACE_BG : SECONDARY_TEXT }}
                    >
                      {msg.time}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing / Thinking Indicator */}
        {isSearching && (
          <div className="flex justify-start">
            <div
              className="p-3.5 rounded-xl shadow-sm flex items-center space-x-2 border"
              style={{
                backgroundColor: SURFACE_BG,
                borderColor: BORDER_COLOR,
                borderTopLeftRadius: DESIGN_TOKENS.radius.lg,
                borderTopRightRadius: DESIGN_TOKENS.radius.lg,
                borderBottomLeftRadius: DESIGN_TOKENS.radius.sm,
                borderBottomRightRadius: DESIGN_TOKENS.radius.lg,
              }}
            >
              <Loader2 size={16} style={{ color: ACCENT_COLOR }} className="animate-spin" />
              <span className="text-xs font-medium" style={{ color: SECONDARY_TEXT }}>
                ConvoSpace AI is thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input box (Matching Chats.jsx) */}
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
          className="flex-1 p-3 rounded-full text-sm transition-all duration-200"
          style={{
            backgroundColor: ELEVATED_BG,
            color: PRIMARY_TEXT,
            border: `1px solid ${BORDER_COLOR}`,
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleAsk()}
          disabled={!query.trim() || isSearching}
          className={`p-3 ml-2 rounded-full transition-all duration-200 hover:scale-[1.05] ${
            !query.trim() || isSearching ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{
            background: ACCENT_GRADIENT,
            color: SURFACE_BG,
            boxShadow: DESIGN_TOKENS.shadows.md,
          }}
          title="Send query"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
});

export default GeminiChatUI;