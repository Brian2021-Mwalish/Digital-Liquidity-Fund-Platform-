import React, { useState } from "react";
import NavigationArrow from "../../components/NavigationArrow";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

// Validation Schema
const schema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (formData) => {
    setLoading(true);
    toast.loading("Creating your account...", { id: "register" });

    const { confirmPassword, ...payload } = formData;

    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ Collect and display all errors
        let errorMessages = [];

        if (typeof data === "object") {
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              errorMessages.push(...value);
              setError(key, { type: "server", message: value.join(" ") });
            } else if (typeof value === "string") {
              errorMessages.push(value);
              setError(key, { type: "server", message: value });
            }
          }
        } else if (typeof data === "string") {
          errorMessages.push(data);
        }

        if (errorMessages.length > 0) {
          // show each error separately
          errorMessages.forEach((msg, i) => {
            toast.error(msg, { id: `register-error-${i}` });
          });
        } else {
          toast.error("Registration failed", { id: "register" });
        }

        return;
      }

      toast.success("Account created successfully! Redirecting to login...", { id: "register" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(error.message || "Something went wrong", { id: "register" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Google signup failed");
      }

      toast.success("Google signup successful!");
      if (result.token || result.access) {
        localStorage.setItem("jwt", result.token || result.access);
        if (result.name) localStorage.setItem("client_name", result.name);
        navigate(result.is_superuser === 1 ? "/admin-dashboard" : "/client-dashboard");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="mb-2">
          <NavigationArrow label="Back to Home" to="/" />
        </div>

        <div className="text-center transform transition-all duration-300 hover:scale-105">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 transition-colors duration-300 hover:text-gray-800">
            Join Liquidity Investments today
          </p>
        </div>

        <div
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          style={{ minHeight: "400px" }}
        >
          {/* Google Sign Up */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSignUp}
              onError={() => toast.error("Google signup failed")}
              useOneTap
              size="large"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 transition-colors duration-300 hover:text-gray-700">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex gap-4">
              <div className="group w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("full_name")}
                  className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${
                    errors.full_name
                      ? "border-red-400 focus:ring-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  }`}
                  placeholder="Full name"
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
                )}
              </div>
              <div className="group w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Email Address
                </label>
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
            </div>

            <div className="flex gap-4">
              <div className="group w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Password
                </label>
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

              <div className="group w-1/2">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={`w-full px-2 py-1 pr-8 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${
                      errors.confirmPassword
                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                        : "border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-blue-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
              </div>
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
