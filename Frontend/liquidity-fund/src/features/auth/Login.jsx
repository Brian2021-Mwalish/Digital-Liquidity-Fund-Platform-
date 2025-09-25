// src/features/auth/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Shield, Sparkles, User, Lock, Mail, WifiOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "Min 8 characters").required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const handleLoginNavigation = async (access, refresh) => {
    try {
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const res = await fetch("http://localhost:8000/api/auth/profile/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");

      const user = await res.json();
      localStorage.setItem("profile", JSON.stringify(user));

      if (user.is_superuser) {
        navigate("/admin-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSubmit = async (data) => {
    if (!isOnline) {
      toast.error("You are offline");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.detail || "Login failed");
        return;
      }
      toast.success("Login successful ✅");
      await handleLoginNavigation(result.access, result.refresh);
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.detail || "Google login failed");
        return;
      }
      toast.success("Google login successful ✅");
      await handleLoginNavigation(result.access, result.refresh);
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2">
            <Shield className="text-blue-600 animate-pulse" size={24} />
            <h2 className="text-2xl font-bold text-blue-600">Sign In</h2>
            <Sparkles className="text-indigo-600 animate-bounce" size={20} />
          </div>
          <p className="text-gray-600 text-sm">Access your Liquidity account</p>
        </div>

        {/* Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => toast.error("Google login failed")}
          useOneTap
          size="large"
          width="100%"
        />
        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-xs text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter email"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 text-sm ${
                errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Lock size={14} /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 text-sm ${
                  errors.password ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {!isOnline ? <WifiOff size={16} /> : <User size={16} />}
            {isSubmitting ? "Signing in..." : !isOnline ? "Offline" : "Sign In"}
          </button>
        </form>

        {/* Register */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
