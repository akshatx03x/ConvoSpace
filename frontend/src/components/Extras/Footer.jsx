import React from 'react'

const THEME_MAIN_BG = '#c3a6a0'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

const Footer = () => {
  return (
    <footer
      className="w-full py-8 px-6 md:px-10 my-5 rounded-2xl text-center md:text-left"
      style={{ backgroundColor: '#d9bdb8', color: THEME_TEXT_COLOR }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold" style={{ backgroundColor: '#black' }}>
            Advantage
          </h2>
          <p className="text-sm max-w-sm">
            Designed to simplify teamwork and spark innovation.
            Advantage helps teams stay connected, organized, and inspired — wherever they are.
          </p>
        </div>

        <div className="flex gap-6 text-sm font-medium">
          <a href="#" className="hover:underline hover:text-[#A06C78] transition">
            Features
          </a>
          <a href="#" className="hover:underline hover:text-[#A06C78] transition">
            Pricing
          </a>
          <a href="#" className="hover:underline hover:text-[#A06C78] transition">
            Support
          </a>
        </div>

        {/* Right Side */}
        <div className="text-sm text-gray-800 text-center md:text-right leading-tight">
          <p>Built with passion and precision 💡</p>
          <p>© {new Date().getFullYear()} Advantage Technologies</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
