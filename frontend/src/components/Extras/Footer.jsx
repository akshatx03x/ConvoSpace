// Footer.jsx (UI Redesign - Premium Footer)
import React from 'react';
import { FaTwitter, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';

// Design Tokens (Using the consistent set)
const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',       // Brighter Blue
    primaryDark: '#005ACF',
    secondary: '#FF4500',     // Orange-red
    tertiary: '#AF52DE',      // Purple
    surface: '#FFFFFF',       // Pure white
    surfaceElevated: '#F0F2F5', // Lightest grey (used as the main footer BG)
    surfaceHighlight: '#E0E5EC', // Slightly darker
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
  },
  radius: {
    lg: '20px',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const FOOTER_BG = DESIGN_TOKENS.colors.surfaceElevated;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;

// Data structure for the navigation links (Adapted for ConvoSpace)
const footerLinks = {
  PLATFORM: ['Home', 'Dashboard', 'Upgrade'],
  TOOLS: ['Live Chat', 'AI Assistant', 'Notepad', 'File Sharing'],
  COMPANY: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'],
};

const Footer = () => {
  return (
    <footer
      className="w-full py-10 px-4 md:px-10 mt-12"
      style={{ 
        backgroundColor: FOOTER_BG, 
        color: PRIMARY_TEXT,
        borderRadius: DESIGN_TOKENS.radius.lg 
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Content Area: Logo/Description and Link Columns */}
        <div 
          className="flex flex-col md:flex-row justify-between gap-10 border-b pb-8"
          style={{ borderColor: BORDER_COLOR }}
        >
          
          {/* 1. Logo and Description Column */}
          <div className="md:w-1/3 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <Sparkles size={24} style={{ color: PRIMARY_COLOR }} className="mr-2" />
              {/* Branding Fix */}
              <h2 className="text-xl font-extrabold tracking-tight" style={{ color: PRIMARY_TEXT }}>
                ConvoSpace
              </h2>
            </div>
            
            <p className="text-sm max-w-xs mx-auto md:mx-0" style={{ color: SECONDARY_TEXT }}>
              Empowering modern collaboration with seamless video, AI, and integrated tools, all in one space.
            </p>
            
            <p className="text-xs pt-4" style={{ color: SECONDARY_TEXT }}>
              © {new Date().getFullYear()} ConvoSpace. All rights reserved.
            </p>
          </div>

          {/* 2. Navigation Link Columns */}
          <div className="flex-grow flex flex-wrap justify-around md:justify-end gap-x-12 gap-y-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="w-1/3 min-w-[120px] md:w-auto text-center md:text-left">
                {/* Titles are bolded and use the primary text color */}
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: PRIMARY_TEXT }}>
                  {title}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="text-sm transition-colors duration-200"
                        style={{ color: SECONDARY_TEXT }}
                        onMouseEnter={(e) => e.currentTarget.style.color = PRIMARY_COLOR}
                        onMouseLeave={(e) => e.currentTarget.style.color = SECONDARY_TEXT}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Social Media Row */}
        <div className="flex justify-center md:justify-end pt-5">
          {/* Social media icons with hover color based on PRIMARY_COLOR */}
          <div className="flex space-x-5 text-xl">
            <SocialIconLink icon={FaTwitter} label="Twitter" />
            <SocialIconLink icon={FaGithub} label="GitHub" />
            <SocialIconLink icon={FaLinkedin} label="LinkedIn" />
            <SocialIconLink icon={FaEnvelope} label="Email" />
          </div>
        </div>
      </div>
    </footer>
  )
}

// Helper component for styled social icons
const SocialIconLink = ({ icon: Icon, label }) => (
    <a 
        href="#" 
        aria-label={label} 
        className="transition-colors duration-200"
        style={{ color: SECONDARY_TEXT }}
        onMouseEnter={(e) => e.currentTarget.style.color = PRIMARY_COLOR}
        onMouseLeave={(e) => e.currentTarget.style.color = SECONDARY_TEXT}
    >
        <Icon />
    </a>
);

export default Footer;