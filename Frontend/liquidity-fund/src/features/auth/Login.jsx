// src/features/auth/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login failed");
      }

      toast.success("Login successful!");

      // Save token in localStorage if present
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // Debug: log the response to check is_superuser value
      console.log("Login response:", result);

      // Admin redirect: backend returns is_superuser as integer (1 for admin, 0 for others)
      if (result.is_superuser === 1) {
        navigate("/admin-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = () => {
    toast.loading("Redirecting to Google...");
    window.location.href = "http://localhost:8000/api/auth/google/";
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center transform transition-all duration-300 hover:scale-105">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">Sign In</h2>
          <p className="mt-2 text-gray-600 transition-colors duration-300 hover:text-gray-800">Access your Liquidity Investments account</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1" style={{ minHeight: '350px' }}>
          {/* Google Login - Now at the top */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full group relative overflow-hidden bg-white border-2 border-gray-200 flex items-center justify-center py-3 rounded-xl transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5 mr-3 relative z-10 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-medium text-gray-700 relative z-10 group-hover:text-blue-700 transition-colors duration-300">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 transition-colors duration-300 hover:text-gray-700">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email & Password - Horizontal Alignment */}
            <div className="flex gap-4">
              <div className="group w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Email Address</label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${
                    errors.email
                      ? "border-red-400 focus:ring-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  }`}
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="group w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`w-full px-2 py-1 pr-8 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${
                      errors.password
                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                        : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                    }`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? "Logging in..." : "Sign In"}
              </div>
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
