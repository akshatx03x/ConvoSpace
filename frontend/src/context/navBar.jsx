import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

// Premium Design System - Inspired by Apple & Google
const DESIGN_TOKENS = {
  colors: {
    primary: '#0066FF',      // Vibrant blue
    primaryHover: '#0052CC',
    secondary: '#FF3B30',    // Accent red
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F7',
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
    lg: '0 12px 40px rgba(0,0,0,0.12)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3)'
  },
  blur: 'blur(20px)',
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  }
};

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' }
  ];

  return (
    <nav 
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: DESIGN_TOKENS.blur,
        WebkitBackdropFilter: DESIGN_TOKENS.blur,
        borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
        boxShadow: DESIGN_TOKENS.shadows.sm
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a 
            href="/dashboard"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: DESIGN_TOKENS.colors.gradient,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Sparkles size={20} color="white" strokeWidth={2.5} />
            </div>
            <span 
              className="text-xl font-semibold tracking-tight"
              style={{ 
                color: DESIGN_TOKENS.colors.text.primary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              ConvoSpace
            </span>
          </a>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    color: DESIGN_TOKENS.colors.text.secondary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surfaceElevated;
                    e.currentTarget.style.color = DESIGN_TOKENS.colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = DESIGN_TOKENS.colors.text.secondary;
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/subscriptions"
                className="ml-2 px-5 py-2 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: DESIGN_TOKENS.colors.gradient,
                  boxShadow: DESIGN_TOKENS.shadows.md
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = DESIGN_TOKENS.shadows.glow;
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = DESIGN_TOKENS.shadows.md;
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                Upgrade
              </a>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 rounded-lg transition-all duration-200"
            style={{
              color: DESIGN_TOKENS.colors.text.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surfaceElevated;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div 
            className="md:hidden pb-4 pt-2 px-2 animate-in fade-in slide-in-from-top-2 duration-300"
            style={{
              borderTop: `1px solid ${DESIGN_TOKENS.colors.border}`
            }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    color: DESIGN_TOKENS.colors.text.secondary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.surfaceElevated;
                    e.currentTarget.style.color = DESIGN_TOKENS.colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = DESIGN_TOKENS.colors.text.secondary;
                  }}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="/subscriptions"
                onClick={handleLinkClick}
                className="mt-2 px-4 py-3 rounded-xl font-semibold text-sm text-white text-center transition-all duration-200"
                style={{
                  background: DESIGN_TOKENS.colors.gradient,
                  boxShadow: DESIGN_TOKENS.shadows.md
                }}
              >
                Upgrade
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;