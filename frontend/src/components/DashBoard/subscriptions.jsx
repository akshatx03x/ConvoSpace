import React from 'react';

// Theme Constants derived from other components
const THEME_MAIN_BG = '#c3a6a0';
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';
const NAVBAR_HEIGHT = '80px';

const CheckIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const PlanCard = ({ name, price, features, isPopular = false }) => {
    const cardBg = isPopular ? THEME_ACCENT_COLOR : 'white';
    const textColor = isPopular ? 'white' : THEME_TEXT_COLOR;
    const priceColor = isPopular ? 'white' : THEME_ACCENT_COLOR;
    const shadowClass = isPopular ? 'shadow-2xl transform scale-[1.03] border-4 border-white' : 'shadow-xl hover:shadow-2xl hover:scale-[1.01]';
    const featureTextColor = isPopular ? 'white' : 'gray-600';

    return (
        <div 
            className={`flex flex-col p-8 rounded-3xl transition-all duration-300 ${shadowClass}`}
            style={{ backgroundColor: cardBg, color: textColor }}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className={`text-3xl font-extrabold mb-1`} style={{ color: isPopular ? 'white' : THEME_TEXT_COLOR }}>
                    {name}
                </h3>
                {isPopular && (
                    <span className="px-4 py-1 text-xs font-bold rounded-full bg-white text-pink-700 shadow-lg">
                        MOST POPULAR
                    </span>
                )}
            </div>
            
            <div className="mb-6">
                <p className="text-5xl font-extrabold" style={{ color: priceColor }}>
                    ${price}
                </p>
                <p className={`text-sm opacity-80`} style={{ color: isPopular ? 'white' : THEME_TEXT_COLOR }}>
                    / month
                </p>
            </div>
            
            <div className="flex-grow space-y-3 mb-8">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <CheckIcon color={isPopular ? 'white' : THEME_ACCENT_COLOR} />
                        <span className={`text-base font-medium`} style={{ color: featureTextColor }}>
                            {feature}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-auto">
                {/* REQUIRED: Coming Soon in every model/plan */}
                <span className="text-2xl font-bold" style={{ color: isPopular ? THEME_LIGHT_CARD_BG : THEME_ACCENT_COLOR }}>
                    Coming Soon...
                </span>
                <button
                    className={`mt-4 w-full py-3 rounded-full font-bold text-lg shadow-xl opacity-50 cursor-not-allowed`}
                    style={{ 
                        backgroundColor: isPopular ? THEME_LIGHT_CARD_BG : THEME_ACCENT_COLOR, 
                        color: isPopular ? THEME_ACCENT_COLOR : 'white',
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
        // Fallback to home route if history doesn't exist
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/'; 
        }
    };

    return (
        <div 
            className="w-full min-h-screen p-8 font-sans" 
            style={{ 
                backgroundColor: THEME_LIGHT_CARD_BG,
                marginTop: NAVBAR_HEIGHT 
            }}
        >
            <div className="max-w-7xl mx-auto">
                
                {/* Back Button */}
                <button 
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 px-4 py-2 mb-8 rounded-full font-semibold shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    style={{ 
                        backgroundColor: THEME_ACCENT_COLOR, 
                        color: 'white',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span>Back to Home</span>
                </button>

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-extrabold mb-4" style={{ color: THEME_TEXT_COLOR }}>
                        <span style={{ color: THEME_ACCENT_COLOR }}>Unlock</span> Your Collaboration Advantage
                    </h1>
                    <p className="text-xl font-light" style={{ color: THEME_TEXT_COLOR }}>
                        Choose the plan that fits your team's size and feature needs.
                    </p>
                </div>

                {/* Subscription Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
                    {plans.map((plan) => (
                        <PlanCard key={plan.name} {...plan} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Subscriptions;
