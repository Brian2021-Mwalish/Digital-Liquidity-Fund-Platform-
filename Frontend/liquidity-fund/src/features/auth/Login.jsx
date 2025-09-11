// src/features/auth/Login.jsx
import React, { useState, useEffect } from "react";
import NavigationArrow from "../../components/NavigationArrow";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Eye, EyeOff, Shield, Sparkles, Info, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff, User, Lock, Mail } from "lucide-react";
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [emailValidationStatus, setEmailValidationStatus] = useState('');
  const [formTouched, setFormTouched] = useState({ email: false, password: false });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Email validation effect
  useEffect(() => {
    if (watchedEmail && formTouched.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(watchedEmail)) {
        setEmailValidationStatus('valid');
      } else {
        setEmailValidationStatus('invalid');
      }
    } else {
      setEmailValidationStatus('');
    }
  }, [watchedEmail, formTouched.email]);

  // Password strength calculation
  useEffect(() => {
    if (watchedPassword && formTouched.password) {
      let strength = 0;
      if (watchedPassword.length >= 8) strength += 1;
      if (/[a-z]/.test(watchedPassword)) strength += 1;
      if (/[A-Z]/.test(watchedPassword)) strength += 1;
      if (/[0-9]/.test(watchedPassword)) strength += 1;
      if (/[^A-Za-z0-9]/.test(watchedPassword)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchedPassword, formTouched.password]);

  // Rate limiting countdown
  useEffect(() => {
    let interval;
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleKeyPress = (e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
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
            type === "success"
              ? toast.success(`${key.toUpperCase()}: ${msg}`)
              : toast.error(`${key.toUpperCase()}: ${msg}`)
          );
        } else {
          type === "success"
            ? toast.success(`${key.toUpperCase()}: ${value}`)
            : toast.error(`${key.toUpperCase()}: ${value}`);
        }
      });
    }
  };

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
      localStorage.setItem("client_name", user.full_name || user.username || "");

      if (user.is_superuser) {
        navigate("/admin-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (error) {
      toast.error("Profile fetch failed: " + error.message);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("profile");
    }
  };

  const onSubmit = async (data) => {
    if (!isOnline) {
      toast.error("No internet connection. Please check your network and try again.");
      return;
    }

    if (loginAttempts >= 5 && timeRemaining > 0) {
      toast.error(`Too many login attempts. Please wait ${timeRemaining} seconds.`);
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
        setLoginAttempts(prev => prev + 1);
        
        if (loginAttempts >= 4) {
          setTimeRemaining(30); // 30 second cooldown
          toast.error("Too many failed attempts. Please wait 30 seconds before trying again.");
          return;
        }

        if (result.detail) {
          toast.error(result.detail);
        } else if (typeof result === "object") {
          Object.entries(result).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((msg) => toast.error(`${key.toUpperCase()}: ${msg}`));
            } else {
              toast.error(`${key.toUpperCase()}: ${value}`);
            }
          });
        } else {
          toast.error("Login failed. Please try again.");
        }
        return;
      }

      setLoginAttempts(0); // Reset attempts on successful login
      toast.success("Login successful ✅");
      await handleLoginNavigation(result.access, result.refresh);
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!isOnline) {
      toast.error("No internet connection. Please check your network and try again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/google-login/", {
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
      await handleLoginNavigation(result.access, result.refresh);
    } catch (error) {
      toast.error("SERVER ERROR: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Connection Status Indicator */}
      <div className={`fixed top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        {isOnline ? 'Online' : 'Offline'}
      </div>

      <div
        className={`w-full max-w-sm sm:max-w-md lg:max-w-2xl space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-700 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
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

        {/* Login Attempts Warning */}
        {loginAttempts >= 3 && timeRemaining === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-800">
            <AlertCircle size={16} />
            <p className="text-sm">
              {loginAttempts}/5 login attempts used. Account will be temporarily locked after 5 failed attempts.
            </p>
          </div>
        )}

        {/* Rate Limit Warning */}
        {timeRemaining > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800">
            <XCircle size={16} />
            <p className="text-sm">
              Too many failed attempts. Please wait {timeRemaining} seconds before trying again.
            </p>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 min-h-[420px] sm:min-h-[450px]">
          {/* Google Login Section */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed")}
                useOneTap
                size="large"
                width="100%"
              />
              {!isOnline && (
                <div className="absolute inset-0 bg-gray-200/80 rounded flex items-center justify-center">
                  <span className="text-sm text-gray-600">Offline - Google login unavailable</span>
                </div>
              )}
            </div>
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
              {/* Email Field */}
              <div className="group w-full sm:w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-1">
                  <Mail size={14} />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register("email")}
                    onFocus={() => setFormTouched(prev => ({ ...prev, email: true }))}
                    className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm transition-all duration-300 ${
                      errors.email
                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                        : emailValidationStatus === 'valid'
                        ? "border-green-400 focus:ring-green-300 bg-green-50"
                        : emailValidationStatus === 'invalid'
                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                        : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                    }`}
                    placeholder="Enter your email"
                  />
                  {/* Email validation icon */}
                  {emailValidationStatus && (
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      {emailValidationStatus === 'valid' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1 animate-pulse flex items-center gap-1">
                  <XCircle size={12} />
                  {errors.email.message}
                </p>}
                {emailValidationStatus === 'valid' && !errors.email && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Email format is valid
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group w-full sm:w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-1">
                  <Lock size={14} />
                  Password
                  <button
                    type="button"
                    onClick={() => setShowPasswordHints(!showPasswordHints)}
                    className="ml-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Info size={12} />
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    onFocus={() => setFormTouched(prev => ({ ...prev, password: true }))}
                    onKeyDown={handleKeyPress}
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

                {/* Caps Lock Warning */}
                {capsLockOn && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Caps Lock is ON
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formTouched.password && watchedPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength:</span>
                      <span className="text-xs font-medium">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            passwordStrength >= level ? getPasswordStrengthColor() : 'bg-gray-200'
                          } transition-colors duration-300`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Password Hints */}
                {showPasswordHints && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center gap-1">
                        {watchedPassword?.length >= 8 ? <CheckCircle size={10} className="text-green-500" /> : <XCircle size={10} className="text-red-500" />}
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-1">
                        {/[a-z]/.test(watchedPassword || '') ? <CheckCircle size={10} className="text-green-500" /> : <XCircle size={10} className="text-red-500" />}
                        One lowercase letter
                      </li>
                      <li className="flex items-center gap-1">
                        {/[A-Z]/.test(watchedPassword || '') ? <CheckCircle size={10} className="text-green-500" /> : <XCircle size={10} className="text-red-500" />}
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-1">
                        {/[0-9]/.test(watchedPassword || '') ? <CheckCircle size={10} className="text-green-500" /> : <XCircle size={10} className="text-red-500" />}
                        One number
                      </li>
                      <li className="flex items-center gap-1">
                        {/[^A-Za-z0-9]/.test(watchedPassword || '') ? <CheckCircle size={10} className="text-green-500" /> : <XCircle size={10} className="text-red-500" />}
                        One special character
                      </li>
                    </ul>
                  </div>
                )}

                {errors.password && <p className="text-xs text-red-500 mt-1 animate-pulse flex items-center gap-1">
                  <XCircle size={12} />
                  {errors.password.message}
                </p>}

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
              disabled={isSubmitting || !isOnline || (timeRemaining > 0)}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : timeRemaining > 0 ? (
                  <>
                    <AlertCircle size={16} />
                    Wait {timeRemaining}s
                  </>
                ) : !isOnline ? (
                  <>
                    <WifiOff size={16} />
                    Offline
                  </>
                ) : (
                  <>
                    <User size={16} />
                    Sign In
                  </>
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