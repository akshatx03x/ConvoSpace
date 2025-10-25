import React from 'react'
import {
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
} from 'react-icons/fa' // Importing social media icons

// Existing theme variables
const THEME_MAIN_BG = '#c3a6a0'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

// Data structure for the navigation links (inspired by the IncBlog image)
const footerLinks = {
  PLATFORM: ['Home', 'Create Pitch', 'Browse Startups'],
  CATEGORIES: ['Technology', 'Health', 'Education', 'Finance'],
  RESOURCES: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'],
}

const Footer = () => {
  // Retaining the original footer background and text color style
  return (
    <footer
      className="w-full py-10 px-6 md:px-10 mt-9 rounded-2xl"
      style={{ backgroundColor: '#d9bdb8', color: THEME_TEXT_COLOR }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Content Area: Logo/Description and Link Columns */}
        <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-gray-400/50 pb-8">
          
          {/* 1. Logo and Description Column (based on IncBlog's left side) */}
          <div className="md:w-1/3 space-y-3 text-center md:text-left">
            {/* The text color for the title is still THEME_TEXT_COLOR ('#333333') as defined by the parent style. 
               The original 'backgroundColor: #black' has been removed as it was likely an error and would clash. */}
            <h2 className="text-2xl font-bold">
              IncBlog {/* Changed to match the visual reference */}
            </h2>
            <p className="text-sm max-w-xs mx-auto md:mx-0 text-gray-700">
              Share Your Tech Insights, Connect With Innovators {/* Changed description */}
            </p>
            {/* Kept the original copyright structure for the top-left area */}
            <p className="text-sm pt-4 text-gray-800">
              © {new Date().getFullYear()} TechCloud. All rights reserved.
            </p>
          </div>

          {/* 2. Navigation Link Columns */}
          <div className="flex-grow flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="w-1/3 min-w-[120px] md:w-auto text-center md:text-left">
                {/* Titles are bolded and slightly darker for hierarchy */}
                <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider text-gray-800">
                  {title}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      {/* Using the existing accent color for hover: #A06C78 */}
                      <a 
                        href="#" 
                        className="text-sm text-gray-700 hover:underline transition"
                        style={{ '--hover-color': THEME_ACCENT_COLOR }} // Using style variable for better Tailwind integration (if needed, otherwise inline style)
                        onMouseEnter={(e) => e.currentTarget.style.color = THEME_ACCENT_COLOR}
                        onMouseLeave={(e) => e.currentTarget.style.color = THEME_TEXT_COLOR}
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
          {/* Social media icons with hover color #A06C78 */}
          <div className="flex space-x-5 text-xl">
            <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-[#A06C78] transition">
              <FaTwitter />
            </a>
            <a href="#" aria-label="GitHub" className="text-gray-600 hover:text-[#A06C78] transition">
              <FaGithub />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-[#A06C78] transition">
              <FaLinkedin />
            </a>
            <a href="#" aria-label="Email" className="text-gray-600 hover:text-[#A06C78] transition">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer