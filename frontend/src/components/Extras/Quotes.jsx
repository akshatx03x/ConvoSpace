import React, { useEffect, useState } from 'react'

const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'
const THEME_LIGHT_CARD_BG = '#F0EBEA'

const quotes = [
  "Collaborate seamlessly. Innovate effortlessly. Your work, connected.",
  "Empowering teams to connect, create, and conquer together.",
  "Where collaboration meets clarity and productivity.",
  "Smart meetings. Smarter outcomes.",
  "Connect. Collaborate. Achieve."
]

const QuotesTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className=" h-[100px] p-5" >
    <div 
      className="py-3 m-8  w-2/3 px-6 mb-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 bg-[#F0EBEA]  border-gray-300 "
      style={{ backgroundColor:  {THEME_LIGHT_CARD_BG}}}
    >
      <p className="text-lg font-medium text-gray-800">
        {quotes[currentIndex]}
      </p>
    </div>
    </div>
  )
}

export default QuotesTicker
