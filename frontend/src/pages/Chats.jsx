// Chats.jsx (UI Redesign - Premium Messaging)
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from '../context/SocketProvider'
import { toast } from 'react-toastify'
import { Send, MessageSquare } from 'lucide-react'

// Design Tokens (Imported for consistency)
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


const Chats = ({ room }) => {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const socket = useSocket()
  const messagesContainerRef = useRef(null)

  // --- START: Existing Functionality (NO CHANGES) ---
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    const handleMessage = ({ name, message }) => {
      setMessages(prev => [...prev, { name, message, isOwn: false }])
      toast.info(`New message from ${name}: ${message}`)
    }

    const handleFileEvent = ({ uploader, name }) => {
      toast.info(`File event: ${name} by ${uploader}`)
    }

    const handleUserJoin = ({ email }) => {
      toast.info(`New user joined: ${email}`)
    }

    socket.on('receive:message', handleMessage)
    socket.on('file:shared', handleFileEvent)
    socket.on('file:deleted', handleFileEvent)
    socket.on('user:join', handleUserJoin)

    return () => {
      socket.off('receive:message', handleMessage)
      socket.off('file:shared', handleFileEvent)
      socket.off('file:deleted', handleFileEvent)
      socket.off('user:join', handleUserJoin)
    }
  }, [socket])

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit('send:message', { room, message })
      setMessages(prev => [...prev, { name: 'You', message, isOwn: true }])
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage()
  }
  // --- END: Existing Functionality (NO CHANGES) ---


  // Welcome screen when no chats yet (Redesigned)
  const WelcomePreview = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8" style={{ color: SECONDARY_TEXT }}>
      <MessageSquare size={48} style={{ color: ACCENT_COLOR }} className="mb-4" />
      <h3 className="text-xl font-bold mb-1" style={{ color: PRIMARY_TEXT }}>
        Start the Conversation
      </h3>
      <p className="text-sm mt-1">
        Send a message below to begin chatting with others in the room.
      </p>
      <p className="text-xs opacity-80 mt-2">
        You are connected to room <span className="font-semibold" style={{ color: ACCENT_COLOR }}>{room}</span>.
      </p>
    </div>
  )

  return (
    <div
      className="w-full flex flex-col overflow-hidden rounded-xl shadow-lg border"
      style={{
        height: '100%', // Use full height of the parent ElevatedCard
        minHeight: '40vh',
        backgroundColor: SURFACE_BG,
        borderColor: BORDER_COLOR,
        color: PRIMARY_TEXT,
      }}
    >
      {/* Header (Minimalist and Clean) */}
      <div
        className="p-4 text-lg font-semibold flex items-center shadow-sm"
        style={{ 
          backgroundColor: SURFACE_BG, 
          borderBottom: `1px solid ${BORDER_COLOR}` 
        }}
      >
        <MessageSquare size={20} style={{ color: ACCENT_COLOR }} className="mr-3" />
        <span>Group Chat</span>
      </div>

      {/* Chat Messages Scroll Area (Elevated Background) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
        style={{
          backgroundColor: ELEVATED_BG, // Use elevated background for message area
        }}
      >
        {messages.length === 0 ? (
          <WelcomePreview />
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] p-3 rounded-xl shadow-sm transition-all duration-100"
                style={{
                  // iOS/Google Chat Bubble Styling
                  backgroundColor: msg.isOwn ? ACCENT_COLOR : SURFACE_BG,
                  color: msg.isOwn ? SURFACE_BG : PRIMARY_TEXT,
                  boxShadow: DESIGN_TOKENS.shadows.sm,
                  // Dynamic Radius for bubble shape
                  borderTopLeftRadius: DESIGN_TOKENS.radius.lg,
                  borderTopRightRadius: DESIGN_TOKENS.radius.lg,
                  borderBottomLeftRadius: msg.isOwn ? DESIGN_TOKENS.radius.lg : DESIGN_TOKENS.radius.sm,
                  borderBottomRightRadius: msg.isOwn ? DESIGN_TOKENS.radius.sm : DESIGN_TOKENS.radius.lg,
                }}
              >
                <span 
                  className="text-xs font-bold" 
                  style={{ 
                    color: msg.isOwn ? SURFACE_BG : SECONDARY_TEXT // Name color change for readability
                  }}
                >
                  {msg.name}
                </span>
                <p className="text-sm mt-0.5" style={{ color: msg.isOwn ? SURFACE_BG : PRIMARY_TEXT }}>
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input box (Clean White Surface) */}
      <div 
        className="p-3 flex items-center" 
        style={{ backgroundColor: SURFACE_BG, borderTop: `1px solid ${BORDER_COLOR}` }}
      >
        <input
          type="text"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 rounded-full text-sm transition-all duration-200"
          style={{ 
            backgroundColor: ELEVATED_BG, // Use elevated background for the input field
            color: PRIMARY_TEXT,
            border: `1px solid ${BORDER_COLOR}`,
            outline: 'none',
            '--tw-ring-color': ACCENT_COLOR // Tailwind focus ring equivalent
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className={`p-3 ml-2 rounded-full transition-all duration-200 hover:scale-[1.05] ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          style={{ 
            background: ACCENT_GRADIENT, 
            color: SURFACE_BG,
            boxShadow: DESIGN_TOKENS.shadows.md 
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

export default Chats