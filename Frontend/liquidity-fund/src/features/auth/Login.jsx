// src/features/auth/Login.jsx
import React, { useState, useEffect } from "react";
import NavigationArrow from "../../components/NavigationArrow";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Eye, EyeOff, Shield, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showAllMessages = (result, type = "success") => {
    if (typeof result === "string") {
      type === "success" ? toast.success(result) : toast.error(result);
      return;
    }
    if (typeof result === "object") {
      Object.entries(result).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((msg) =>
            type === "success" ? toast.success(`${key.toUpperCase()}: ${msg}`) : toast.error(`${key.toUpperCase()}: ${msg}`)
          );
        } else {
          type === "success"
            ? toast.success(`${key.toUpperCase()}: ${value}`)
            : toast.error(`${key.toUpperCase()}: ${value}`);
        }
      });
    }
  };

  const handleLoginNavigation = (result) => {
    const token = result.token || result.access;
    if (token) {
      localStorage.setItem("jwt", token);
      // ✅ Store token under "access" so AdminDashboard.jsx can find it
      localStorage.setItem("access", token);

      const user = result.user;
      if (user) {
        localStorage.setItem("client_name", user.full_name || user.username || "");

        if (user.is_superuser) {
          navigate("/admin-dashboard");
        } else {
          navigate("/client-dashboard");
        }
      }
    } else {
      toast.error("Invalid login. No access token returned. Contact support.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showAllMessages(result, "error");
        return;
      }

      showAllMessages(result, "success");
      handleLoginNavigation(result);
    } catch (error) {
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const result = await res.json();

      if (!res.ok) {
        showAllMessages(result, "error");
        return;
      }

      showAllMessages(result, "success");
      handleLoginNavigation(result);
    } catch (error) {
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      {/* Dynamic background elements */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
        }}
      />
      
      <div className={`w-full max-w-sm sm:max-w-md lg:max-w-2xl space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mb-2">
          <NavigationArrow label="Back to Home" to="/" />
        </div>

        <div className="text-center transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="text-blue-600 animate-pulse" size={24} />
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sign In
            </h2>
            <Sparkles className="text-indigo-600 animate-bounce" size={20} />
          </div>
          <p className="text-sm sm:text-base text-gray-600 transition-colors duration-300 hover:text-gray-800">
            Access your Liquidity Investments account
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 min-h-[320px] sm:min-h-[350px]">
          <div className="mb-4 sm:mb-6">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google login failed")}
              useOneTap
              size="large"
              width="100%"
            />
          </div>

          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-4 bg-white text-gray-500 transition-colors duration-300 hover:text-gray-700">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="group w-full sm:w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm">Email Address</label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm transition-all duration-300 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1 animate-pulse">{errors.email.message}</p>}
              </div>

              <div className="group w-full sm:w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 pr-8 sm:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm transition-all duration-300 ${
                      errors.password
                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                        : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 sm:right-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1 animate-pulse">{errors.password.message}</p>}
                
                {/* ✅ Forgot Password Link */}
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </div>
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">
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