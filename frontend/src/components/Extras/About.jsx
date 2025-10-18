import React from 'react'

const THEME_MAIN_BG = '#c3a6a0'
const THEME_LIGHT_CARD_BG = '#F0EBEA'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

const About = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center rounded-3xl p-10 "
      style={{ backgroundColor: '#d9bdb8' }}
    >
      {/* Card Container */}
      <div
        className="max-w-5xl w-full shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row transform transition-transform duration-500 hover:scale-[1.02]"
        style={{ backgroundColor: THEME_LIGHT_CARD_BG }}
      >
        {/* Left section - About text */}
        <div className="w-full md:w-2/3 p-10 flex flex-col justify-center space-y-6">
          <h1
            className="text-5xl font-extrabold tracking-tight transition-all duration-300 hover:scale-105"
            style={{ color: THEME_TEXT_COLOR }}
          >
            About{' '}
            <span style={{ color: THEME_ACCENT_COLOR }}>Advantage</span>
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed transition-transform duration-300 hover:scale-[1.01]">
            Advantage is a unified workspace designed to empower seamless
            collaboration. With built-in video calling, intelligent chat
            assistance, and interactive project tools, we bring teams together —
            no matter where they are.
          </p>

          <p className="text-gray-700 text-lg leading-relaxed transition-transform duration-300 hover:scale-[1.01]">
            From brainstorming sessions to daily stand-ups, Advantage merges
            innovation and simplicity to help you connect, create, and grow. Our
            platform ensures smooth communication, data security, and
            productivity — all in one place.
          </p>

          <div className="pt-4">
            <button
              className="px-8 py-4 text-white font-bold rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300"
              style={{ backgroundColor: THEME_ACCENT_COLOR }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right section - Visual gradient + quote */}
        <div
          className="w-full md:w-1/3 flex flex-col justify-end items-end p-8 text-right rounded-t-3xl md:rounded-l-3xl transition-transform duration-500 hover:scale-[1.03]"
          style={{
            background: 'linear-gradient(to top right, #E0C0C0, #D5B0B0, #a06c78)',
          }}
        >
          <p className="text-white text-2xl italic font-light mb-4 transition-all duration-300 hover:scale-105">
            "Collaboration isn’t just about working together —
            it’s about achieving more, together."
          </p>
          <p className="text-white font-semibold transition-all duration-300 hover:scale-105">
            — The Advantage Team
          </p>
        </div>
      </div>

      {/* Small tagline below */}
      <p className="mt-10 text-gray-100 text-lg font-medium tracking-wide transition-transform duration-300 hover:scale-105">
        Empowering modern work with clarity, connection, and creativity.
      </p>
    </div>
  )
}

export default About
