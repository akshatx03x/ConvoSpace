// Subscriptions.jsx (UI Redesign - Premium Pricing Page)
import React from 'react';
import { ArrowLeft, CheckCircle, Zap, User, Users, Shield, Award, Clock } from 'lucide-react';

// Design Tokens (Using the consistent set)
const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',       // Brighter Blue
    primaryDark: '#005ACF',
    secondary: '#FF4500',     // Orange-red
    tertiary: '#AF52DE',      // Purple
    surface: '#FFFFFF',       // Pure white
    surfaceElevated: '#F0F2F5', // Lightest grey
    surfaceHighlight: '#E0E5EC', // Slightly darker
    border: '#E0E0E0',        // Light border
    text: {
      primary: '#1C1C1E',     // Darkest grey
      secondary: '#6A6A6A',   // Medium grey
      placeholder: '#A0A0A0',
      white: '#FFFFFF'
    },
    // The shared accent gradient from VideoCalling
    accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    success: '#4CAF50', // Green for checks
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.16)',
    glow: '0 0 25px rgba(102, 126, 234, 0.6)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    full: '9999px',
  }
};

const NAVBAR_HEIGHT = '64px';
const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.accentGradient;


const CheckIcon = ({ color }) => (
    // Replaced inline SVG with Lucide CheckCircle icon
    <CheckCircle size={20} style={{ color: color }} className="flex-shrink-0" />
);

const PlanCard = ({ name, price, features, isPopular = false }) => {
    // Apply themed colors and gradients
    const cardBg = isPopular ? ACCENT_GRADIENT : SURFACE_BG;
    const textColor = isPopular ? DESIGN_TOKENS.colors.text.white : PRIMARY_TEXT;
    const priceColor = isPopular ? DESIGN_TOKENS.colors.text.white : PRIMARY_COLOR;
    const featureTextColor = isPopular ? DESIGN_TOKENS.colors.text.white : SECONDARY_TEXT;
    
    const shadowStyle = isPopular 
        ? { boxShadow: DESIGN_TOKENS.shadows.glow } 
        : { boxShadow: DESIGN_TOKENS.shadows.md };

    const checkColor = isPopular ? DESIGN_TOKENS.colors.surface : PRIMARY_COLOR;

    return (
        <div 
            className={`flex flex-col p-8 rounded-2xl transition-all duration-300 transform ${
                isPopular ? 'scale-[1.03] z-10' : 'hover:shadow-lg hover:scale-[1.01]'
            }`}
            style={{ 
                background: cardBg, 
                color: textColor,
                borderRadius: DESIGN_TOKENS.radius.lg,
                border: isPopular ? `4px solid ${SURFACE_BG}` : `1px solid ${BORDER_COLOR}`,
                ...shadowStyle
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className={`text-3xl font-extrabold mb-1`} style={{ color: textColor }}>
                    {name}
                </h3>
                {isPopular && (
                    <span 
                        className="px-4 py-1 text-xs font-bold rounded-full shadow-lg"
                        style={{ backgroundColor: SURFACE_BG, color: PRIMARY_COLOR }}
                    >
                        MOST POPULAR
                    </span>
                )}
            </div>
            
            <div className="mb-6">
                <p className="text-6xl font-extrabold" style={{ color: priceColor }}>
                    ${price}
                </p>
                <p className={`text-base opacity-80`} style={{ color: isPopular ? DESIGN_TOKENS.colors.text.white : SECONDARY_TEXT }}>
                    / month
                </p>
            </div>
            
            <div className="flex-grow space-y-3 mb-8 pt-4 border-t" style={{ borderColor: isPopular ? 'rgba(255, 255, 255, 0.3)' : BORDER_COLOR }}>
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <CheckIcon color={checkColor} />
                        <span className={`text-base font-medium`} style={{ color: featureTextColor }}>
                            {feature}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-auto">
                {/* REQUIRED: Coming Soon in every model/plan */}
                <span className="text-2xl font-extrabold" style={{ color: isPopular ? SURFACE_BG : PRIMARY_COLOR }}>
                    Coming Soon...
                </span>
                <button
                    className={`mt-4 w-full py-3 rounded-full font-bold text-lg shadow-xl opacity-50 cursor-not-allowed`}
                    style={{ 
                        backgroundColor: isPopular ? SURFACE_BG : PRIMARY_COLOR, 
                        color: isPopular ? PRIMARY_COLOR : DESIGN_TOKENS.colors.text.white,
                        borderRadius: DESIGN_TOKENS.radius.full // Fully rounded button
                    }}
                    disabled
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};


const Subscriptions = () => {
    const plans = [
        {
            name: "Basic",
            price: 9,
            features: [
                "1 Video/Audio Call (2 Users)",
                "Basic AI Assistant Access",
                "Notepad & File Viewer",
                "50MB Storage Limit"
            ],
            isPopular: false
        },
        {
            name: "Pro",
            price: 29,
            features: [
                "Unlimited Group Calls",
                "Advanced AI/ML Features",
                "Real-time Collaboration Suite",
                "1TB Cloud Storage",
                "Priority Feature Access"
            ],
            isPopular: true
        },
        {
            name: "Premium",
            price: 49,
            features: [
                "All Pro Features",
                "Dedicated 24/7 Support",
                "Custom Branding Options",
                "Advanced Security Controls",
                "Early Access to Beta Features"
            ],
            isPopular: false
        }
    ];

    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/'; 
        }
    };

    return (
        <div 
            className="w-full min-h-screen p-4 sm:p-8 font-sans" 
            style={{ 
                backgroundColor: ELEVATED_BG,
                marginTop: NAVBAR_HEIGHT 
            }}
        >
            <div className="max-w-7xl mx-auto">
                
                {/* Back Button (Lucide Icon and themed) */}
                <button 
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 px-4 py-2 mb-12 rounded-full font-semibold shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    style={{ 
                        backgroundColor: SURFACE_BG, 
                        color: PRIMARY_TEXT,
                        border: `1px solid ${BORDER_COLOR}`,
                        borderRadius: DESIGN_TOKENS.radius.full
                    }}
                >
                    <ArrowLeft size={20} style={{ color: PRIMARY_COLOR }}/>
                    <span>Back to Home</span>
                </button>

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4" style={{ color: PRIMARY_TEXT }}>
                        <span style={{ color: PRIMARY_COLOR }}>Unlock</span> Your Collaboration Advantage
                    </h1>
                    <p className="text-lg md:text-xl font-light" style={{ color: SECONDARY_TEXT }}>
                        Choose the plan that fits your team's size and feature needs.
                    </p>
                </div>

                {/* Subscription Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-stretch">
                    {plans.map((plan) => (
                        <PlanCard key={plan.name} {...plan} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Subscriptions;