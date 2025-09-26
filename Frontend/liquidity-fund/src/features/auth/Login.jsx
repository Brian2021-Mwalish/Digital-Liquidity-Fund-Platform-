// src/features/auth/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Shield, Sparkles, User, Lock, Mail, WifiOff, ArrowLeft } from "lucide-react";
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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-100 to-green-300 p-4">
      {/* Back Arrow at top left, outside the container */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 bg-green-900 text-green-50 px-4 py-2 rounded-full shadow-lg hover:bg-green-800 transition z-50"
        style={{ textDecoration: "none" }}
      >
        <ArrowLeft size={22} />
        <span className="font-semibold text-base">Back to Home</span>
      </Link>
      <div className="w-full max-w-md bg-green-50/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-6 border-2 border-green-900 relative">
        {/* Header */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center gap-2">
            <Shield className="text-green-900 animate-pulse" size={24} />
            <h2 className="text-2xl font-bold text-green-900">Sign In</h2>
            <Sparkles className="text-green-700 animate-bounce" size={20} />
          </div>
          <p className="text-green-700 text-sm">Access your Liquidity account</p>
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
          <div className="flex-grow border-t border-green-300"></div>
          <span className="px-2 text-xs text-green-700">or</span>
          <div className="flex-grow border-t border-green-300"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-green-900 flex items-center gap-1">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter email"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 text-sm ${
                errors.email ? "border-red-400 bg-red-50" : "border-green-300 bg-green-50"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-green-900 flex items-center gap-1">
              <Lock size={14} /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 text-sm ${
                  errors.password ? "border-red-400 bg-red-50" : "border-green-300 bg-green-50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-green-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-xs text-green-900 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            className="w-full bg-gradient-to-r from-green-900 to-green-700 text-white py-2 rounded-lg font-semibold text-sm hover:from-green-800 hover:to-green-600 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {!isOnline ? <WifiOff size={16} /> : <User size={16} />}
            {isSubmitting ? "Signing in..." : !isOnline ? "Offline" : "Sign In"}
          </button>
        </form>

        {/* Register */}
        <p className="text-center text-sm text-green-700">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-900 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
