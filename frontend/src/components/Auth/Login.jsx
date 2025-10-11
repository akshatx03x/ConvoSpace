import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaFacebookF } from "react-icons/fa"; 
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        formData,
        { withCredentials: true }
      );

      alert(response.data.message);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8] p-4 sm:p-8">
      
      <div className="flex w-full max-w-6xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          
          <h1 className="text-4xl font-semibold mb-2 text-gray-800">
            Hello Again!
          </h1>
          <p className="text-gray-500 mb-8">
            Let's get started with your 30 days trial
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 mt-8 text-white bg-[#A06C78] rounded-lg font-medium hover:bg-[#8B5C67] transition disabled:opacity-50 shadow-md"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-200" />
            <span className="px-3 text-gray-400 text-sm">Or continue with</span>
            <hr className="flex-grow border-gray-200" />
          </div>

          <div className="flex justify-center space-x-6">
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <FaGoogle className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <FaApple className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <FaFacebookF className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 p-10 relative rounded-r-3xl" 
             style={{ 
               backgroundImage: 'linear-gradient(to top, #7A789A, #E8A878, #F4D3C5)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
             }}
        >
          <div className="absolute bottom-10 left-10 text-white">
             <h2 className="text-3xl font-light">Finally, Get your Advantage.</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;