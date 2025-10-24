import React from 'react';

// Theme Constants derived from other components
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';

const QUOTES = [
    "\"Collaboration is the magic that transforms challenges into opportunities.\"",
    "\"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will.\" - Vince Lombardi",
    "\"Alone we can do so little; together we can do so much.\" - Helen Keller",
    "\"Innovation distinguishes between a leader and a follower.\" - Steve Jobs",
    "\"The greatest discovery is that a human can alter his future by merely altering his attitude.\" - Oprah Winfrey",
];

const QuotesTicker = () => {
    // Duplicate the quotes twice to create a long, seamless scroll.
    const fullQuotes = [...QUOTES, ...QUOTES, ...QUOTES];

    const quoteElements = fullQuotes.map((quote, index) => (
        <div 
            // Key must be unique; use index + length to guarantee uniqueness for the tripled array
            key={index} 
            className="flex-shrink-0 text-lg font-medium italic whitespace-nowrap" 
            // Ensures ample, guaranteed separation between each quote element
            style={{ marginRight: '10rem', textAlign: 'center' }} 
        >
            "{quote.replace(/\"/g, '')}"
        </div>
    ));

    // CSS Keyframes for continuous horizontal movement (right-to-left)
    const marqueeStyle = `
        @keyframes marquee {
            /* Start with no offset (initial visible position) */
            0% { transform: translateX(0); }
            /* FIX: Scroll exactly the width of the initial set of quotes + gaps, which is 1/3rd of the total content width. 
               This ensures a full loop without visible jump. */
            100% { transform: translateX(calc(-100% / 3)); }
        }

        .marquee-content-wrapper {
            /* Set a massive width (e.g., 300vw for triple duplication) to guarantee horizontal space */
            min-width: 300vw; 
            display: flex;
            flex-shrink: 0;
            /* Apply the animation */
            animation: marquee 75s linear infinite; /* Increased duration for smoother scroll */
            align-items: center;
            /* FIX: Start the quotes on the screen by removing the huge padding */
            padding-left: 2rem; 
        }
    `;

    return (
        <div 
            className="w-full relative py-3 my-5 mt-23 rounded-xl overflow-hidden shadow-inner"
            style={{ backgroundColor: THEME_LIGHT_CARD_BG, color: THEME_TEXT_COLOR }}
        >
            {/* Inject CSS for the animation */}
            <style>{marqueeStyle}</style>

            {/* Container for the scrolling content */}
            <div className="marquee-content-wrapper">
                {quoteElements}
            </div>

            {/* Fading overlay effect to hide the sharp cut-off and enhance seamless looping */}
            <div 
                className="absolute inset-y-0 left-0 w-1/12 pointer-events-none"
                style={{ background: `linear-gradient(to right, ${THEME_LIGHT_CARD_BG}, transparent)` }}
            ></div>
            <div 
                className="absolute inset-y-0 right-0 w-1/12 pointer-events-none"
                style={{ background: `linear-gradient(to left, ${THEME_LIGHT_CARD_BG}, transparent)` }}
            ></div>
        </div>
    );
};

export default QuotesTicker;
