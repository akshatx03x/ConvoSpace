import React from 'react'

const THEME_LIGHT_CARD_BG = '#F0EBEA'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

const features = [
  {
    icon: "🎥",
    title: "Group Video Calls",
    description: "Connect with your team seamlessly in high-quality video calls."
  },
  {
    icon: "🤖",
    title: "AI Assistant",
    description: "Get instant help with projects, research, or code directly in the call."
  },
  {
    icon: "📄",
    title: "Document Sharing",
    description: "Upload and share documents, PDFs, or notes with everyone in the room."
  },
  {
    icon: "📝",
    title: "Collaborative Notes",
    description: "Take notes together during meetings and save them for later reference."
  },
]

const FeatureCard = () => {
  return (
    <div 
      className="w-[320px] h-170 p-6 m-10 rounded-3xl shadow-2xl flex flex-col gap-6 absolute right-10 top-20"
      style={{ backgroundColor: THEME_LIGHT_CARD_BG }}
    >
      <h3 className="text-2xl font-extrabold mb-4" style={{ color: THEME_TEXT_COLOR }}>
        Features
      </h3>

      {features.map((feature, index) => (
        <div 
          key={index} 
          className="flex items-start gap-1 p-3 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          style={{ 
            background: `linear-gradient(145deg, ${THEME_ACCENT_COLOR}15, ${THEME_ACCENT_COLOR}05)`, 
            border: `1px solid ${THEME_ACCENT_COLOR}40`
          }}
        >
          <div className="text-3xl">{feature.icon}</div>
          <div className="flex flex-col">
            <h4 className="text-xl font-bold" style={{ color: THEME_ACCENT_COLOR }}>{feature.title}</h4>
            <p className="text-gray-700 mt-1 text-sm">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FeatureCard
