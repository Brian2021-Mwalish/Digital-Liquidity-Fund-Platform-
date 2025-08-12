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
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 px-4">
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-xl p-8 w-full max-w-xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Liquidity Investments Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email & Password - Horizontal Alignment */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-white mb-1 text-sm">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white/10 text-white"
                placeholder="Email"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div className="w-1/2">
              <label className="block text-white mb-1 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-2 py-1 pr-8 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white/10 text-white"
                  placeholder="Password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1.5 text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full flex items-center justify-center bg-white text-gray-800 py-2 rounded-lg shadow hover:bg-gray-100 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm text-white/80 mt-4">
          <Link to="/forgot-password" className="hover:underline">
            Forgot Password?
          </Link>
          <Link to="/register" className="hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
