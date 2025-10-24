import React from 'react'

// Theme Constants (assuming these are globally available or passed down)
const THEME_LIGHT_CARD_BG = '#F0EBEA'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

const Chats = () => {
  return (
    <div 
        className="w-full h-[300px] flex flex-col rounded-2xl shadow-xl overflow-hidden"
        style={{ 
            backgroundColor: 'white', // Use white background for a cleaner chat area
            color: THEME_TEXT_COLOR 
        }}
    >
      {/* Elegant Header with Subtle Shadow */}
      <div 
        className="p-3 text-lg font-extrabold flex items-center justify-between shadow-md"
        style={{ backgroundColor: THEME_ACCENT_COLOR, color: 'white' }}
      >
        <div className="flex items-center space-x-2">
            {/* Simple Chat Icon (Inline SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Live Chat</span>
        </div>
        
        {/* User Status Placeholder */}
        <div className="text-xs px-2 py-1 rounded-full bg-green-500/80 font-semibold">
            2 Online
        </div>
      </div>
      
      {/* Chat Messages Area - Elegant Styling for Messages */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4"
        style={{ backgroundColor: THEME_LIGHT_CARD_BG }} // Use light background for the scrollable area
      >
        {/* Incoming Message (Left) */}
        <div className="flex justify-start">
            <div 
                className="max-w-[75%] p-3 rounded-xl rounded-bl-none shadow-sm"
                style={{ backgroundColor: 'white' }}
            >
                <span className="text-xs font-bold" style={{ color: THEME_ACCENT_COLOR }}>User 1</span>
                <p className="text-sm mt-0.5">Hello team! Let's review the document uploads.</p>
            </div>
        </div>

        {/* Outgoing Message (Right) */}
        <div className="flex justify-end">
            <div 
                className="max-w-[75%] p-3 rounded-xl rounded-br-none shadow-sm"
                style={{ backgroundColor: THEME_ACCENT_COLOR + '20' }} // Subtle accent color background
            >
                <span className="text-xs font-bold" style={{ color: THEME_TEXT_COLOR }}>You</span>
                <p className="text-sm mt-0.5">Got it! I'm checking the latest files now. Ready to start the discussion.</p>
            </div>
        </div>
      </div>
      
      {/* Input Box - Clean and Integrated */}
      <div className="p-3 flex items-center bg-white border-t" style={{ borderColor: THEME_ACCENT_COLOR + '40' }}>
        <input
            type="text"
            placeholder="Send a message..."
            className="flex-1 p-2 border-none rounded-lg focus:ring-0 focus:outline-none"
            style={{ backgroundColor: 'transparent', color: THEME_TEXT_COLOR }}
        />
        <button
            className="p-2 ml-2 rounded-full shadow-md transition-colors duration-200 hover:scale-[1.05]"
            style={{ backgroundColor: THEME_ACCENT_COLOR, color: 'white' }}
        >
            {/* Send Icon (Inline SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        </button>
      </div>
    </div>
  )
}

export default Chats
