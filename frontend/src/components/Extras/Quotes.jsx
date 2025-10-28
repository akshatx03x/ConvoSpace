// QuotesTicker.jsx (UI Redesign - Premium Marquee Ticker)
import React from 'react';
import { Star } from 'lucide-react';

// Design Tokens (Using the consistent set)
const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',       // Brighter Blue
    primaryDark: '#005ACF',
    secondary: '#FF4500',     // Orange-red
    tertiary: '#AF52DE',      // Purple
    surface: '#FFFFFF',       // Pure white
    surfaceElevated: '#F0F2F5', // Lightest grey (used as the ticker BG)
    surfaceHighlight: '#E0E5EC', // Slightly darker
    border: '#E0E0E0',        // Light border
    text: {
      primary: '#1C1C1E',     // Darkest grey (for quote text)
      secondary: '#6A6A6A',   // Medium grey (for author/secondary info)
      placeholder: '#A0A0A0',
      white: '#FFFFFF'
    },
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  },
  radius: {
    lg: '20px',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const Ticker_BG = DESIGN_TOKENS.colors.surfaceElevated;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;

const QUOTES = [
    "Collaboration is the magic that transforms challenges into opportunities.",
    "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will. — Vince Lombardi",
    "Alone we can do so little; together we can do so much. — Helen Keller",
    "Innovation distinguishes between a leader and a follower. — Steve Jobs",
    "The greatest discovery is that a human can alter his future by merely altering his attitude. — Oprah Winfrey",
];

const QuotesTicker = () => {
    // Duplicate the quotes to create a long, seamless scroll.
    const fullQuotes = [...QUOTES, ...QUOTES, ...QUOTES];

    const quoteElements = fullQuotes.map((quote, index) => {
        const parts = quote.split('—');
        const quoteText = parts[0].trim();
        const authorText = parts[1] ? `— ${parts[1].trim()}` : '';

        return (
            <div 
                key={index} 
                className="flex-shrink-0 flex items-center whitespace-nowrap" 
                style={{ marginRight: '5rem' }} 
            >
                {/* Visual Separator */}
                <Star size={18} style={{ color: PRIMARY_COLOR }} className="mx-4 flex-shrink-0" />
                
                {/* Quote Content */}
                <p className="text-md font-medium" style={{ color: PRIMARY_TEXT }}>
                    <span className="italic">"{quoteText}"</span>
                    <span className="ml-2 font-semibold" style={{ color: SECONDARY_TEXT }}>{authorText}</span>
                </p>
            </div>
        );
    });

    // CSS Keyframes and Style for continuous horizontal movement (right-to-left)
    const marqueeStyle = `
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% / 3)); }
        }

        .marquee-content-wrapper {
            /* Set a massive width (3x content width) */
            min-width: 300vw; 
            display: flex;
            flex-shrink: 0;
            /* Apply the animation */
            animation: marquee 75s linear infinite; 
            align-items: center;
            padding-left: 2rem; 
        }
    `;

    return (
        <div 
            className="w-full relative py-4 mt-8 mb-12 overflow-hidden"
            style={{ 
                backgroundColor: Ticker_BG, 
                color: PRIMARY_TEXT, 
                borderRadius: DESIGN_TOKENS.radius.lg,
                border: `1px solid ${BORDER_COLOR}`,
                boxShadow: DESIGN_TOKENS.shadows.sm
            }}
        >
            {/* Inject CSS for the animation */}
            <style>{marqueeStyle}</style>

            {/* Container for the scrolling content */}
            <div className="marquee-content-wrapper">
                {quoteElements}
            </div>

            {/* Fading overlay effect for seamless looping */}
            <div 
                className="absolute inset-y-0 left-0 w-1/12 pointer-events-none"
                style={{ background: `linear-gradient(to right, ${Ticker_BG} 30%, transparent)` }}
            ></div>
            <div 
                className="absolute inset-y-0 right-0 w-1/12 pointer-events-none"
                style={{ background: `linear-gradient(to left, ${Ticker_BG} 30%, transparent)` }}
            ></div>
        </div>
    );
};

export default QuotesTicker;