import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../context/navBar';
import Footer from '../components/Extras/Footer';
import {
  Video,
  Bot,
  MessageSquare,
  NotebookPen,
  CloudUpload,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Share2,
  Lock,
  Download,
  Smartphone,
  Flame
} from 'lucide-react';

const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',
    primaryDark: '#005ACF',
    secondary: '#FF4500',
    tertiary: '#AF52DE',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F2F5',
    surfaceHighlight: '#E0E5EC',
    border: '#E0E0E0',
    text: {
      primary: '#1C1C1E',
      secondary: '#6A6A6A',
      placeholder: '#A0A0A0',
      white: '#FFFFFF',
    },
    accentGradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
    heroGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    badgeBg: 'rgba(0, 122, 255, 0.08)',
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.10)',
    lg: '0px 12px 32px rgba(0, 0, 0, 0.12)',
    glow: '0 0 25px rgba(0, 122, 255, 0.35)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },
};

const FEATURES_LIST = [
  {
    icon: <Video size={28} className="text-[#007AFF]" />,
    badge: "Real-Time WebRTC",
    title: "Crystal-Clear HD Video Calling",
    description: "Ultra-low latency peer-to-peer video streaming. Adaptive layouts automatically showcase active speakers and multi-member grids with camera-off privacy mode.",
    bullets: [
      "Dynamic 1 to 4+ participant responsive grid",
      "One-click microphone & camera toggling",
      "Camera-off privacy screen placeholder",
      "Auto-reconnection on network drop or page reload",
    ],
  },
  {
    icon: <Bot size={28} className="text-[#AF52DE]" />,
    badge: "AI Powered",
    title: "ConvoSpace AI Meeting Assistant",
    description: "Integrated AI built right into your meeting room. Ask complex questions, brainstorm ideas, and generate instant structured summaries on demand.",
    bullets: [
      "Instant meeting minutes & executive summaries",
      "Action items checklist extraction",
      "Decision log formulation",
      "Direct one-tap sharing to Meeting Discussion",
    ],
  },
  {
    icon: <MessageSquare size={28} className="text-[#007AFF]" />,
    badge: "Live Chat",
    title: "Meeting Discussion & Room Chat",
    description: "Synchronous group messaging powered by real-time websockets. Keep the conversation moving with live updates, system notifications, and shared thoughts.",
    bullets: [
      "Zero-latency room messaging with Socket.IO",
      "Peer join and leave live notifications",
      "Card-based message bubbles aligned with notes",
      "Seamless clipboard and message sharing",
    ],
  },
  {
    icon: <NotebookPen size={28} className="text-[#34C759]" />,
    badge: "Productivity",
    title: "Collaborative Meeting Notes",
    description: "Capture key insights as they happen. Save action items and important discussion points in a dedicated, card-based notepad saved directly to your room.",
    bullets: [
      "Auto-saved room-specific notepad",
      "Timestamped note cards with edit & delete",
      "System Web Share API & clipboard integration",
      "Clean unified card aesthetic",
    ],
  },
  {
    icon: <CloudUpload size={28} className="text-[#FF9500]" />,
    badge: "File Sharing",
    title: "Secure Document & File Sharing",
    description: "Drag-and-drop file sharing right within your meeting room. Share PDFs, research docs, images, and notes with everyone in seconds.",
    bullets: [
      "Intuitive drag-and-drop dropzone",
      "Supports PDFs, Word docs, TXT, images up to 20MB",
      "Instant room-wide sync notification",
      "One-click secure downloads and file management",
    ],
  },
  {
    icon: <Zap size={28} className="text-[#FF2D55]" />,
    badge: "Instant Access",
    title: "Frictionless Room Access",
    description: "No downloads, no installations, no complex setup. Create an instant room code or share a direct URL link to invite team members in seconds.",
    bullets: [
      "5-character instant room generation",
      "Direct link joining (?room=CODE)",
      "Zero app install required - works in any browser",
      "Session preservation across page refreshes",
    ],
  },
];

const STATS = [
  { value: "100%", label: "Browser Based (No Downloads)" },
  { value: "< 100ms", label: "Real-Time Audio/Video Latency" },
  { value: "24/7", label: "AI Assistant Availability" },
  { value: "End-to-End", label: "Secure P2P Encryption" },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: DESIGN_TOKENS.colors.surfaceElevated }}
    >
      <NavBar />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-6 pb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs border"
            style={{
              backgroundColor: DESIGN_TOKENS.colors.badgeBg,
              color: DESIGN_TOKENS.colors.primary,
              borderColor: 'rgba(0, 122, 255, 0.2)',
            }}
          >
            Everything You Need For Collaborative Meetings
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6"
            style={{ color: DESIGN_TOKENS.colors.text.primary }}
          >
            Built for Modern Teams. <br />
            <span
              style={{
                background: DESIGN_TOKENS.colors.heroGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powered by Intelligence.
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl leading-relaxed mb-8"
            style={{ color: DESIGN_TOKENS.colors.text.secondary }}
          >
            ConvoSpace brings together high-definition video calling, intelligent AI assistance, live discussions, notes, and file sharing into one unified workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: DESIGN_TOKENS.colors.accentGradient,
                boxShadow: DESIGN_TOKENS.shadows.md,
              }}
            >
              Start Meeting Now <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/subscriptions')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border"
              style={{
                backgroundColor: DESIGN_TOKENS.colors.surface,
                color: DESIGN_TOKENS.colors.text.primary,
                borderColor: DESIGN_TOKENS.colors.border,
                boxShadow: DESIGN_TOKENS.shadows.sm,
              }}
            >
              View Pricing & Plans
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-2xl border shadow-sm mb-16"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.surface,
            borderColor: DESIGN_TOKENS.colors.border,
          }}
        >
          {STATS.map((stat, idx) => (
            <div key={idx} className="text-center p-2">
              <div
                className="text-2xl sm:text-3xl font-extrabold mb-1"
                style={{ color: DESIGN_TOKENS.colors.primary }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs sm:text-sm font-medium"
                style={{ color: DESIGN_TOKENS.colors.text.secondary }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: DESIGN_TOKENS.colors.text.primary }}
            >
              Deep Dive into Capabilities
            </h2>
            <p className="text-sm sm:text-base" style={{ color: DESIGN_TOKENS.colors.text.secondary }}>
              Designed to make every remote conference faster, smarter, and infinitely more productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES_LIST.map((feat, index) => (
              <div
                key={index}
                className="p-6 sm:p-7 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                style={{
                  backgroundColor: DESIGN_TOKENS.colors.surface,
                  borderColor: DESIGN_TOKENS.colors.border,
                  borderLeft: `5px solid ${DESIGN_TOKENS.colors.primary}`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: DESIGN_TOKENS.colors.surfaceElevated }}
                    >
                      {feat.icon}
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: DESIGN_TOKENS.colors.surfaceElevated,
                        borderColor: DESIGN_TOKENS.colors.border,
                        color: DESIGN_TOKENS.colors.text.secondary,
                      }}
                    >
                      {feat.badge}
                    </span>
                  </div>

                  <h3
                    className="text-xl font-bold mb-2.5"
                    style={{ color: DESIGN_TOKENS.colors.text.primary }}
                  >
                    {feat.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: DESIGN_TOKENS.colors.text.secondary }}
                  >
                    {feat.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-4 border-t" style={{ borderColor: DESIGN_TOKENS.colors.border }}>
                  {feat.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start text-xs sm:text-sm font-medium" style={{ color: DESIGN_TOKENS.colors.text.primary }}>
                      <CheckCircle2 size={16} className="text-[#34C759] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="p-8 sm:p-12 rounded-3xl text-center text-white relative overflow-hidden shadow-xl"
          style={{ background: DESIGN_TOKENS.colors.heroGradient }}
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Meetings?
            </h2>
            <p className="text-base text-white/80">
              Join thousands of teams collaborating effortlessly with ConvoSpace today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 rounded-full font-bold text-sm bg-white text-gray-900 shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Launch Dashboard
              </button>
              <button
                onClick={() => navigate('/subscriptions')}
                className="px-8 py-3.5 rounded-full font-semibold text-sm bg-white/20 text-white border border-white/40 backdrop-blur-md transition-all duration-200 hover:bg-white/30"
              >
                Explore Pro Features
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
