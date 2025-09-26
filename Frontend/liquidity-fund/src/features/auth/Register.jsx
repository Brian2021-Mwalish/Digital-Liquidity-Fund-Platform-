import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, User, Mail, Lock, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const schema = yup.object().shape({
  full_name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .required("Please enter your full name"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Please confirm your password"),
});

const Register = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const referralCode = searchParams.get("referral_code");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "Enter password", color: "bg-gray-300" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    const levels = [
      { label: "Very Weak", color: "bg-red-500" },
      { label: "Weak", color: "bg-orange-500" },
      { label: "Fair", color: "bg-yellow-500" },
      { label: "Good", color: "bg-green-400" },
      { label: "Strong", color: "bg-green-700" }
    ];
    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  const onSubmit = async (formData) => {
    setLoading(true);
    toast.loading("Creating your account, please wait...", { id: "register" });
    const { confirmPassword, ...payload } = formData;
    if (referralCode) {
      payload.referral_code = referralCode;
    }
    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        let errorMessages = [];
        const fieldErrorMap = {
          full_name: "Full Name",
          email: "Email Address",
          password: "Password"
        };
        if (typeof data === "object") {
          for (const [key, value] of Object.entries(data)) {
            const fieldName = fieldErrorMap[key] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (Array.isArray(value)) {
              value.forEach((msg) => {
                const userFriendlyMsg = `${fieldName}: ${msg}`;
                errorMessages.push(userFriendlyMsg);
                setError(key, { type: "server", message: msg });
              });
            } else if (typeof value === "string") {
              const userFriendlyMsg = `${fieldName}: ${value}`;
              errorMessages.push(userFriendlyMsg);
              setError(key, { type: "server", message: value });
            }
          }
        } else if (typeof data === "string") {
          errorMessages.push(data);
        }
        if (errorMessages.length > 0) {
          errorMessages.forEach((msg, i) => {
            toast.error(msg, { 
              id: `register-error-${i}`,
              duration: 5000,
              icon: <AlertCircle className="text-red-500" />
            });
          });
        } else {
          toast.error("Registration failed. Please check your information and try again.", { 
            id: "register",
            duration: 4000 
          });
        }
        toast.dismiss("register");
        setLoading(false);
        return;
      }
      toast.success("Welcome aboard! Your account has been created successfully.", { 
        id: "register",
        duration: 3000,
        icon: <CheckCircle className="text-green-700" />
      });
      setTimeout(() => {
        toast.dismiss("register");
        toast.loading("Redirecting to login page...", { id: "redirect" });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }, 2000);
    } catch (error) {
      const errorMessage = error.message || "We're experiencing technical difficulties. Please try again.";
      toast.error(errorMessage, { 
        id: "register",
        duration: 5000,
        icon: <AlertCircle className="text-red-500" />
      });
      toast.dismiss("register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2"
      style={{
        background: "linear-gradient(135deg, #e6f4ea 0%, #b7e4c7 50%, #1b4332 100%)",
      }}
    >
      {/* Uniquely styled, bold, and highly visible Back Arrow */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl z-50 font-bold text-lg"
        style={{
          background: "linear-gradient(90deg, #1b4332 70%, #b7e4c7 100%)",
          color: "#fff",
          border: "2px solid #14532d",
          boxShadow: "0 4px 24px 0 #14532d55",
          letterSpacing: "0.03em"
        }}
      >
        <ArrowLeft size={28} style={{ strokeWidth: 3 }} />
        <span style={{ fontWeight: 700, textShadow: "0 2px 8px #14532d55" }}>Back to Home</span>
      </Link>

      <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl space-y-6 sm:space-y-8 md:space-y-10 animate-fade-in">
       

        {/* Header */}
        <div className="text-center transform transition-all duration-300 hover:scale-105">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-pulse">
            Join Liquidity Investments
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-green-700 transition-colors duration-300 hover:text-green-900 max-w-md mx-auto">
            Create your account and start your investment journey with us today
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-green-200 p-4 sm:p-6 md:p-8 lg:p-10 transform transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 mx-auto max-w-3xl">
          
          {/* Welcome Message */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-green-900 mb-2">Create Your Account</h2>
            <p className="text-sm sm:text-base text-green-700">Please fill in your details to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 mb-2 font-semibold text-green-700 text-sm sm:text-base">
                <User className="w-4 h-4 text-green-600" />
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("full_name")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-opacity-30 text-sm sm:text-base transition-all duration-300 ${
                    errors.full_name
                      ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50 shake"
                      : "border-green-300 focus:ring-green-200 focus:border-green-500 bg-green-50 hover:bg-white hover:border-green-400"
                  }`}
                  placeholder="Enter your full name"
                />
                {!errors.full_name && watch("full_name") && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.full_name && (
                <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 mb-2 font-semibold text-green-700 text-sm sm:text-base">
                <Mail className="w-4 h-4 text-green-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-opacity-30 text-sm sm:text-base transition-all duration-300 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50 shake"
                      : "border-green-300 focus:ring-green-200 focus:border-green-500 bg-green-50 hover:bg-white hover:border-green-400"
                  }`}
                  placeholder="Enter your email address"
                />
                {!errors.email && watch("email") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch("email")) && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 mb-2 font-semibold text-green-700 text-sm sm:text-base">
                  <Lock className="w-4 h-4 text-green-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-opacity-30 text-sm sm:text-base transition-all duration-300 ${
                      errors.password
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50 shake"
                        : "border-green-300 focus:ring-green-200 focus:border-green-500 bg-green-50 hover:bg-white hover:border-green-400"
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-green-500 hover:text-green-700 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {watchedPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-green-700">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.strength <= 1 ? 'text-red-500' :
                        passwordStrength.strength <= 2 ? 'text-orange-500' :
                        passwordStrength.strength <= 3 ? 'text-yellow-600' :
                        passwordStrength.strength <= 4 ? 'text-green-400' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 mb-2 font-semibold text-green-700 text-sm sm:text-base">
                  <Lock className="w-4 h-4 text-green-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-opacity-30 text-sm sm:text-base transition-all duration-300 ${
                      errors.confirmPassword
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50 shake"
                        : "border-green-300 focus:ring-green-200 focus:border-green-500 bg-green-50 hover:bg-white hover:border-green-400"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-green-500 hover:text-green-700 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {!errors.confirmPassword && watchedConfirmPassword && watchedPassword === watchedConfirmPassword && (
                    <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || isSubmitting || !isValid}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-green-700 hover:to-emerald-700 hover:-translate-y-1 hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      Create My Account
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline transform hover:scale-105 inline-block"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;