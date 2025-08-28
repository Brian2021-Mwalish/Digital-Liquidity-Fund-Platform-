// src/features/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NavigationArrow from "../../components/NavigationArrow";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, CheckCircle, Key, ArrowLeft, Shield } from "lucide-react";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .matches(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .matches(/(?=.*\d)/, "Password must contain at least one number")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPassword = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Validate token on component mount
    validateToken();

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateToken = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/auth/reset-password/${uidb64}/${token}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        const result = await res.json();
        toast.error(result.error || "Invalid or expired reset link");
      }
    } catch (error) {
      setIsTokenValid(false);
      toast.error("Failed to validate reset link");
    }
  };

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

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`http://localhost:8000/api/auth/reset-password/${uidb64}/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: data.password,
          confirm_password: data.confirmPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        showAllMessages(result, "error");
        return;
      }

      showAllMessages(result, "success");
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    const strengthMap = {
      0: { label: "", color: "" },
      1: { label: "Very Weak", color: "text-red-500" },
      2: { label: "Weak", color: "text-orange-500" },
      3: { label: "Fair", color: "text-yellow-500" },
      4: { label: "Strong", color: "text-blue-500" },
      5: { label: "Very Strong", color: "text-green-500" },
    };
    
    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  // Success state
  if (isSuccess) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
          }}
        />
        
        <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-2">
            <NavigationArrow label="Back to Home" to="/" />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Password Reset Successful!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to the sign in page in a few seconds.
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft size={16} className="mr-2" />
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isTokenValid === false) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
          }}
        />
        
        <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-2">
            <NavigationArrow label="Back to Home" to="/" />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="text-red-600" size={32} />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Invalid Reset Link
            </h2>
            
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline text-sm sm:text-base py-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isTokenValid === null) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      {/* Dynamic background elements */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
        }}
      />
      
      <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mb-2">
          <NavigationArrow label="Back to Home" to="/" />
        </div>

        <div className="text-center transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="text-blue-600 animate-pulse" size={24} />
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Reset Password
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 transition-colors duration-300 hover:text-gray-800">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            {/* New Password Field */}
            <div className="group">
              <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                New Password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  {...register("password")}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm sm:text-base transition-all duration-300 pl-10 pr-10 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  }`}
                  placeholder="Enter new password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {watchedPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength <= 1 ? 'bg-red-500' :
                        passwordStrength.strength <= 2 ? 'bg-orange-500' :
                        passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                        passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 animate-pulse flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm sm:text-base transition-all duration-300 pl-10 pr-10 ${
                    errors.confirmPassword
                      ? "border-red-400 focus:ring-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  }`}
                  placeholder="Confirm new password"
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isConfirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 animate-pulse flex items-center gap-1">
                  {errors.confirmPassword.message}
                </p>
              )}
              
              {watchedConfirmPassword && watchedPassword && watchedConfirmPassword === watchedPassword && !errors.confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Reset Password
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
            <p className="text-sm text-gray-600">Remember your password?</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline text-sm sm:text-base py-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Need help?{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            >
              Request new reset link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;