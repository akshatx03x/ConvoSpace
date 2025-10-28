// Login.jsx (UI Redesign - Premium Login Screen)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebookF } from "react-icons/fa"; 
import axios from "axios";
import { Sparkles, Loader } from 'lucide-react';

// Design Tokens (Using the consistent set)
const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',       // Brighter Blue
    primaryDark: '#005ACF',
    secondary: '#FF4500',     // Orange-red
    tertiary: '#AF52DE',      // Purple
    surface: '#FFFFFF',       // Pure white
    surfaceElevated: '#F0F2F5', // Lightest grey (used as page BG)
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
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.16)',
    input: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    glow: '0 0 15px rgba(102, 126, 234, 0.6)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    full: '9999px',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.accentGradient;

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- START: Functionality (UNCHANGED) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        formData,
        { withCredentials: true }
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  // --- END: Functionality (UNCHANGED) ---


  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: ELEVATED_BG }}
    >
      
      <div 
        className="flex w-full max-w-6xl h-auto lg:h-[650px] rounded-xl shadow-lg overflow-hidden"
        style={{ 
          backgroundColor: SURFACE_BG,
          boxShadow: DESIGN_TOKENS.shadows.lg,
          borderRadius: DESIGN_TOKENS.radius.lg
        }}
      >
        
        {/* Left Section: Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          
          <div className="flex items-center mb-6">
            <Sparkles size={32} style={{ color: PRIMARY_COLOR }} className="mr-2" />
            <h1 className="text-3xl font-extrabold" style={{ color: PRIMARY_TEXT }}>
              ConvoSpace
            </h1>
          </div>
          
          <h2 className="text-4xl font-semibold mb-2" style={{ color: PRIMARY_TEXT }}>
            Welcome Back!
          </h2>
          <p className="mb-8" style={{ color: SECONDARY_TEXT }}>
            Sign in to access your collaboration dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2"
                style={{
                  borderColor: BORDER_COLOR,
                  backgroundColor: ELEVATED_BG,
                  color: PRIMARY_TEXT,
                  boxShadow: DESIGN_TOKENS.shadows.input,
                  '--tw-ring-color': PRIMARY_COLOR
                }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2"
                style={{
                  borderColor: BORDER_COLOR,
                  backgroundColor: ELEVATED_BG,
                  color: PRIMARY_TEXT,
                  boxShadow: DESIGN_TOKENS.shadows.input,
                  '--tw-ring-color': PRIMARY_COLOR
                }}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 mt-8 text-white rounded-xl font-bold text-lg transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
              style={{
                background: ACCENT_GRADIENT,
                boxShadow: DESIGN_TOKENS.shadows.glow
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader size={24} className="animate-spin mx-auto" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <hr className="flex-grow" style={{ borderColor: BORDER_COLOR }} />
            <span className="px-3 text-sm" style={{ color: SECONDARY_TEXT }}>
              Or continue with
            </span>
            <hr className="flex-grow" style={{ borderColor: BORDER_COLOR }} />
          </div>

          {/* Social Auth Buttons */}
          <div className="flex justify-center space-x-4">
            <SocialAuthButton icon={FaGoogle} label="Google" />
            <SocialAuthButton icon={FaApple} label="Apple" />
            <SocialAuthButton icon={FaFacebookF} label="Facebook" />
          </div>

          <p className="text-sm text-center mt-8" style={{ color: SECONDARY_TEXT }}>
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="font-semibold" 
              style={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Register Now
            </Link>
          </p>
        </div>
        
        {/* Right Section: Promotional Gradient Panel */}
        <div 
          className="hidden lg:block lg:w-1/2 p-12 relative" 
          style={{ 
            background: ACCENT_GRADIENT,
            boxShadow: DESIGN_TOKENS.shadows.lg,
          }}
        >
          <div className="absolute bottom-12 left-12 text-white">
            <h2 className="text-5xl font-bold mb-4">
              Connect. Collaborate. Conquer.
            </h2>
            <p className="text-xl font-light opacity-90">
              Your unified workspace is waiting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for styled social auth buttons
const SocialAuthButton = ({ icon: Icon, label }) => (
    <button 
        className="p-4 border rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ borderColor: BORDER_COLOR, backgroundColor: SURFACE_BG, boxShadow: DESIGN_TOKENS.shadows.sm }}
        aria-label={`Sign in with ${label}`}
    >
        <Icon className="w-6 h-6" style={{ color: PRIMARY_TEXT }} />
    </button>
);

export default Login;