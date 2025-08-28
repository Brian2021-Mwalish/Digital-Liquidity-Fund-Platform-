// src/features/auth/ForgotPassword.jsx
import React, { useState, useEffect } from "react";
import NavigationArrow from "../../components/NavigationArrow";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Mail, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});

const ForgotPassword = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchedEmail = watch("email");

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

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password/", {
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
      setSentEmail(data.email);
      setIsEmailSent(true);
    } catch (error) {
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  const handleResendEmail = async () => {
    if (!sentEmail) return;
    
    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentEmail }),
      });

      const result = await res.json();

      if (!res.ok) {
        showAllMessages(result, "error");
        return;
      }

      toast.success("Password reset email sent again!");
    } catch (error) {
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  const resetForm = () => {
    setIsEmailSent(false);
    setSentEmail("");
  };

  if (isEmailSent) {
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

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Email Sent!
            </h2>
            
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to:
            </p>
            
            <p className="font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg mb-6">
              {sentEmail}
            </p>
            
            <p className="text-sm text-gray-600 mb-6">
              Check your inbox and click the link to reset your password. The link will expire in 15 minutes.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105"
              >
                Resend Email
              </button>
              
              <button
                onClick={resetForm}
                className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-gray-200 hover:-translate-y-1 hover:shadow-md transform hover:scale-105"
              >
                Try Different Email
              </button>
              
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
            <Mail className="text-blue-600 animate-pulse" size={24} />
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Forgot Password
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 transition-colors duration-300 hover:text-gray-800">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div className="group">
              <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm sm:text-base transition-all duration-300 pl-10 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  }`}
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 animate-pulse flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
              
              {watchedEmail && !errors.email && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Valid email format
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Reset Link
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

export default ForgotPassword;