import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
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
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, formData, {
        withCredentials: true,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      if (errorMessage === "User already exists") {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8] p-4 sm:p-8">
      <div className="flex w-full max-w-6xl h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-semibold mb-2 text-gray-800">Create Account</h1>
          <p className="text-gray-500 mb-8">Start your 30-day free trial today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="userName"
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

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
              className="w-full py-3 mt-6 text-white bg-[#A06C78] rounded-lg font-medium hover:bg-[#8B5C67] transition disabled:opacity-50 shadow-md"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#A06C78] hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right side - Gradient panel */}
        <div
          className="hidden lg:block lg:w-1/2 p-10 relative rounded-r-3xl"
          style={{
            backgroundImage:
              "linear-gradient(to top, #7A789A, #E8A878, #F4D3C5)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-light">
              Join Us & Build Your Future.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
