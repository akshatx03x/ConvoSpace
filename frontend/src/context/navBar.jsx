import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react' // Using lucide-react for icons

const THEME_ACCENT_COLOR = '#A06C78'
const BUTTON_HOVER_COLOR = '#8B5C67' // Extracted the hover color for clarity

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLinkClick = () => {
    // Closes the mobile menu after a link is clicked
    if (isOpen) {
      setIsOpen(false)
    }
  }

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
  ]

  return (
    <nav className='fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg p-4 border-b border-gray-200 z-50'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        {/* Logo */}
        <Link 
          to="/dashboard" 
          className='text-2xl sm:text-3xl font-sans text-gray-800 tracking-wider cursor-pointer transition-transform duration-300 transform hover:scale-105 font-extrabold'
        >
          ConvoSpace
        </Link>

        {/* Desktop Menu (Hidden on Mobile) */}
        <ul className='hidden md:flex items-center space-x-8 lg:space-x-12 font-medium'>
          {navLinks.map((link) => (
            <li key={link.name} className='relative group'>
              <a
                href={link.href}
                // FIX: Used template literal for THEME_ACCENT_COLOR
                className={`text-gray-700 hover:text-[${THEME_ACCENT_COLOR}] transition-all duration-300 cursor-pointer p-1`}
              >
                {link.name}
                {/* FIX: Used template literal for THEME_ACCENT_COLOR */}
                <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[${THEME_ACCENT_COLOR}] group-hover:w-full transition-all duration-300`}></span>
              </a>
            </li>
          ))}
          <li>
            <Link 
              to='/subscriptions' 
              // FIX: Used template literal for THEME_ACCENT_COLOR and BUTTON_HOVER_COLOR
              className={`text-white bg-[${THEME_ACCENT_COLOR}] hover:bg-[${BUTTON_HOVER_COLOR}] px-4 py-2 rounded-lg font-bold transition-colors duration-300 cursor-pointer shadow-md`}
            >
              Subscriptions
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button (Hidden on Desktop) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          // FIX: Used template literal for THEME_ACCENT_COLOR
          className={`md:hidden p-2 text-gray-700 hover:text-[${THEME_ACCENT_COLOR}] transition-all duration-300`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Content (Conditionally Rendered) */}
      {isOpen && (
        <div className='md:hidden mt-4 space-y-3 pb-2 transition-all duration-300 ease-in-out'>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              // FIX: Used template literal for THEME_ACCENT_COLOR
              className={`block w-full text-lg text-gray-700 font-medium hover:text-[${THEME_ACCENT_COLOR}] hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200`}
            >
              {link.name}
            </a>
          ))}
          <Link 
            to='/subscriptions' 
            onClick={handleLinkClick}
            // FIX: Used template literal for THEME_ACCENT_COLOR and BUTTON_HOVER_COLOR
            className={`block w-full text-center text-white bg-[${THEME_ACCENT_COLOR}] hover:bg-[${BUTTON_HOVER_COLOR}] px-4 py-2 rounded-lg font-bold transition-colors duration-300 shadow-md mt-4`}
          >
            Subscriptions
          </Link>
        </div>
      )}
    </nav>
  )
}

export default NavBar
