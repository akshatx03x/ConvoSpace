// Login.jsx (UI Redesign - Premium Login Screen)
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa"; 
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

  const googleButtonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = clientId && clientId !== "placeholder_client_id";

  const handleGoogleLoginSuccess = async (response) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/google-login`,
        { idToken: response.credential },
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGoogleConfigured && window.google && googleButtonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleLoginSuccess,
          ux_mode: "popup"
        });
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: "outline", size: "large", text: "continue_with", width: 320 }
        );
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
      }
    }
  }, [isGoogleConfigured, clientId]);

  const handleCustomGoogleClick = () => {
    setError("Google Login is not fully configured. Please configure VITE_GOOGLE_CLIENT_ID in your frontend .env file, and GOOGLE_CLIENT_ID in your backend .env file.");
  };

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

          {/* Social Auth Button: Continue with Google */}
          <div className="flex justify-center w-full mb-6">
            {isGoogleConfigured ? (
              <div ref={googleButtonRef} className="w-full flex justify-center"></div>
            ) : (
              <button 
                type="button"
                onClick={handleCustomGoogleClick}
                className="w-full py-3 flex items-center justify-center space-x-3 border rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 cursor-pointer"
                style={{ borderColor: BORDER_COLOR, backgroundColor: SURFACE_BG, boxShadow: DESIGN_TOKENS.shadows.sm }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.62-1.09-1.39-1.09-2.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="font-semibold" style={{ color: PRIMARY_TEXT }}>Continue with Google</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <hr className="flex-grow" style={{ borderColor: BORDER_COLOR }} />
            <span className="px-3 text-sm" style={{ color: SECONDARY_TEXT }}>
              OR
            </span>
            <hr className="flex-grow" style={{ borderColor: BORDER_COLOR }} />
          </div>

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
              className="w-full py-3 mt-6 text-white rounded-xl font-bold text-lg transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
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

export default Login;