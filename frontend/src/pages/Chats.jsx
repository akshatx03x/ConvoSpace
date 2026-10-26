// Chats.jsx (UI Redesign - Premium Messaging)
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from '../context/SocketProvider'
import { toast } from 'react-toastify'
import { Send, MessageSquare } from 'lucide-react'

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
      toast.info(`File has been uploaded`)
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


  // Welcome screen when no chats yet (Redesigned matching Notepad)
  const WelcomePreview = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8" style={{ color: SECONDARY_TEXT }}>
      <MessageSquare size={48} style={{ color: PRIMARY_COLOR }} className="mb-4" />
      <h3 className="text-xl font-bold mb-2" style={{ color: PRIMARY_TEXT }}>
        Meeting Discussion
      </h3>
      <p className="text-sm">
        Send a message below to share thoughts and chat with everyone in the room.
      </p>
    </div>
  )

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
          <MessageSquare size={20} style={{ color: PRIMARY_COLOR }} className="mr-3" />
          <span className="text-lg font-semibold" style={{ color: PRIMARY_TEXT }}>Meeting Discussion</span>
        </div>
        <span className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
          Room: {room}
        </span>
      </div>

      {/* Chat Messages Scroll Area (Elevated Background) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
        style={{
          backgroundColor: ELEVATED_BG,
        }}
      >
        {messages.length === 0 ? (
          <WelcomePreview />
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[78%] p-3.5 rounded-lg shadow-sm transition-all duration-150"
                style={{
                  backgroundColor: msg.isOwn ? PRIMARY_COLOR : SURFACE_BG,
                  color: msg.isOwn ? '#FFFFFF' : PRIMARY_TEXT,
                  borderLeft: msg.isOwn ? 'none' : `4px solid ${PRIMARY_COLOR}`,
                  boxShadow: DESIGN_TOKENS.shadows.sm,
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: msg.isOwn ? '#FFFFFF' : PRIMARY_COLOR
                    }}
                  >
                    {msg.name}
                  </span>
                </div>
                <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input box */}
      <div
        className="p-3 flex items-center"
        style={{ backgroundColor: SURFACE_BG, borderTop: `1px solid ${BORDER_COLOR}` }}
      >
        <input
          type="text"
          placeholder="Type a message in Meeting Discussion..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
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
          onClick={sendMessage}
          disabled={!message.trim()}
          className={`p-3 ml-2 rounded-full transition-transform duration-200 hover:scale-[1.05] active:scale-[0.98] ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          style={{
            background: ACCENT_GRADIENT,
            color: DESIGN_TOKENS.colors.text.white,
            boxShadow: DESIGN_TOKENS.shadows.md,
          }}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

export default Chats