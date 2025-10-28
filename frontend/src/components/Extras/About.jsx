// About.jsx (UI Redesign - Premium Marketing Section)
import React from 'react';
import { Zap, Users, Code, ArrowRight } from 'lucide-react';

// Design Tokens (Imported/Defined for consistency)
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
    // Using the original gradient from VideoCalling, which is a purple/blue blend
    accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    aiGradient: 'linear-gradient(90deg, #AF52DE, #FF00FF)',
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.16)',
    glow: '0 0 15px rgba(0, 102, 255, 0.4)'
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
// Using the shared accent gradient from VideoCalling for the main CTA/Visuals
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; 


// Helper component for the feature list
const FeatureItem = ({ icon: Icon, title, text, color }) => (
    <div className="flex flex-col p-4 rounded-xl" style={{ backgroundColor: ELEVATED_BG }}>
        <Icon size={24} className="mb-2" style={{ color: color }} />
        <h4 className="font-semibold text-base" style={{ color: PRIMARY_TEXT }}>{title}</h4>
        <p className="text-xs mt-1" style={{ color: SECONDARY_TEXT }}>{text}</p>
    </div>
);


const About = () => {
  return (
    <div
      id="about"
      className="w-full py-20 px-4 sm:px-6 lg:px-8"
      // Replaced old #d9bdb8 with the proper elevated background
      style={{ backgroundColor: ELEVATED_BG }} 
    >
      {/* Main Container - Centered and constrained */}
      <div
        className="max-w-7xl mx-auto rounded-xl overflow-hidden shadow-lg transform transition-transform duration-500 hover:scale-[1.005]"
        style={{ 
          // Replaced old THEME_LIGHT_CARD_BG with surface white
          backgroundColor: SURFACE_BG,
          borderRadius: DESIGN_TOKENS.radius.xl,
          boxShadow: DESIGN_TOKENS.shadows.lg
        }}
      >
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Section - Content & Call to Action */}
          <div className="w-full lg:w-2/3 p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-8">
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight"
              // Replaced old THEME_TEXT_COLOR with PRIMARY_TEXT
              style={{ color: PRIMARY_TEXT }}
            >
              The <span className='text-violet-800'>Advantage</span> for Modern Collaboration
            </h1>

            <p className="text-lg md:text-xl leading-relaxed" style={{ color: SECONDARY_TEXT }}>
              **ConvoSpace** is a unified workspace designed to empower seamless
              collaboration. With built-in video calling, intelligent AI assistance, and
              interactive project tools, we bring teams together—no matter where they are.
            </p>

            <p className="text-md leading-relaxed" style={{ color: SECONDARY_TEXT }}>
              From brainstorming sessions to daily stand-ups, we merge innovation and simplicity to help you connect, create, and grow. Our platform ensures smooth communication, **data security**, and productivity, all in one elevated space.
            </p>

            {/* Key Features/Value Proposition (Borrowed from previous high-quality version) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <FeatureItem icon={Zap} title="Instant Connect" text="Zero-latency peer-to-peer video." color={DESIGN_TOKENS.colors.primary} />
              <FeatureItem icon={Users} title="Unified Tools" text="Chat, notes, and file sharing combined." color={DESIGN_TOKENS.colors.tertiary || '#AF52DE'} />
              <FeatureItem icon={Code} title="Designed to Last" text="Built with premium, modern architecture." color={DESIGN_TOKENS.colors.secondary || '#FF4500'} />
            </div>

            {/* Call to Action Button */}
            <div className="pt-8">
              <button
                className="flex items-center px-8 py-3 text-lg font-semibold rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{ 
                  // Replaced old THEME_ACCENT_COLOR with ACCENT_GRADIENT
                  background: ACCENT_GRADIENT, 
                  color: DESIGN_TOKENS.colors.text.white,
                  boxShadow: DESIGN_TOKENS.shadows.glow
                }}
              >
                Explore Features
                <ArrowRight size={20} className="ml-3" />
              </button>
            </div>
          </div>

          {/* Right Section - Visual Gradient + Quote */}
          <div
            className="w-full lg:w-1/3 p-10 md:p-12 flex flex-col justify-between rounded-t-3xl lg:rounded-l-none lg:rounded-r-3xl min-h-[300px] lg:min-h-full"
            style={{
              // Replaced old custom gradient with the standard accent gradient
              background: ACCENT_GRADIENT, 
              boxShadow: DESIGN_TOKENS.shadows.md 
            }}
          >
            <p className="text-white text-3xl italic font-light mb-auto opacity-90">
              "Collaboration isn’t just about working together — it’s about **achieving more, together.**"
            </p>
            <p className="text-white font-semibold text-lg mt-8">
              — The ConvoSpace Team
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Tagline (Cleaned up) */}
      <p className="mt-12 text-center text-xl font-medium" style={{ color: SECONDARY_TEXT }}>
        ~Empowering modern work with Clarity, Connection, and Creativity.
      </p>
    </div>
  )
}

export default About;