import React from "react";

const THEME_LIGHT_BG = '#eed9de';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';
const THEME_HOVER_COLOR = '#b87c8a';

const Footer = () => {
  return (
    <footer
      className="w-full mt-10 py-6 shadow-inner flex flex-col items-center justify-center border-t border-white/30 backdrop-blur-md"
      style={{ backgroundColor: THEME_LIGHT_BG }}
    >
      <div className="flex space-x-6 mb-3">
        <a
          href="#"
          className="text-sm font-semibold transition-colors duration-300 hover:underline"
          style={{ color: THEME_ACCENT_COLOR }}
        >
          About
        </a>
        <a
          href="#"
          className="text-sm font-semibold transition-colors duration-300 hover:underline"
          style={{ color: THEME_ACCENT_COLOR }}
        >
          Contact
        </a>
        <a
          href="#"
          className="text-sm font-semibold transition-colors duration-300 hover:underline"
          style={{ color: THEME_ACCENT_COLOR }}
        >
          Privacy Policy
        </a>
      </div>

      <p
        className="text-sm text-center font-medium tracking-wide"
        style={{ color: THEME_TEXT_COLOR }}
      >
        © {new Date().getFullYear()} GroupMeet. All rights reserved.
      </p>

      <p
        className="text-xs mt-1 italic text-center"
        style={{ color: THEME_ACCENT_COLOR }}
      >
        Built with ❤️ using React & Socket.io
      </p>
    </footer>
  );
};

export default Footer;
