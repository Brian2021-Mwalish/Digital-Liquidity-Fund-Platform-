// src/features/auth/Login.jsx
import React, { useState } from "react";
import NavigationArrow from "../../components/NavigationArrow";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

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
      localStorage.setItem("jwt", token); // store JWT

      const user = result.user; // extract user object from response
      if (user) {
        localStorage.setItem("client_name", user.full_name || user.username || "");

        // Navigate based on role
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
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="mb-2">
          <NavigationArrow label="Back to Home" to="/" />
        </div>

        <div className="text-center transform transition-all duration-300 hover:scale-105">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            Sign In
          </h2>
          <p className="mt-2 text-gray-600 transition-colors duration-300 hover:text-gray-800">
            Access your Liquidity Investments account
          </p>
        </div>

        <div
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          style={{ minHeight: "350px" }}
        >
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google login failed")}
              useOneTap
              size="large"
            />
          </div>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
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
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
            </div>

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
