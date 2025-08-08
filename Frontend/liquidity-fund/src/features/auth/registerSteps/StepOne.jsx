import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Set your backend URL here (change if your backend runs on a different port)
const API_BASE = 'http://localhost:8000';

const StepOne = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Prefill form if data is saved in localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('registerData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear field error on change
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSubmitSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/api/user/register/step-one/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const backendErrors = {};
        for (const key in errorData) {
          backendErrors[key] = Array.isArray(errorData[key])
            ? errorData[key][0]
            : errorData[key];
        }
        setErrors(backendErrors);
        setLoading(false);
        return;
      }

      const data = await response.json();

      localStorage.setItem('registerData', JSON.stringify(formData));
      localStorage.setItem('userId', data.user_id || '');

      setSubmitSuccess(true);

      setTimeout(() => {
        navigate('/register/step-two');
      }, 1000);

    } catch (error) {
      setErrors({ general: 'Network error, please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-green-800 px-4">
      <form
        onSubmit={handleNext}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border-t-4 border-yellow-500"
        noValidate
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
          Step 1: Basic Info
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Let’s start your journey into secure and smart investments.
        </p>

        {errors.general && (
          <div className="mb-4 text-red-600 bg-red-100 p-3 rounded text-center">
            {errors.general}
          </div>
        )}

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
              errors.fullName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-600'
            }`}
            placeholder="e.g., John Doe"
            disabled={loading}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-600'
            }`}
            placeholder="e.g., john@example.com"
            disabled={loading}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-600'
            }`}
            placeholder="••••••••"
            disabled={loading}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md shadow-md text-white transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            'Next Step →'
          )}
        </button>

        {submitSuccess && (
          <p className="mt-4 text-green-700 text-center font-semibold">
            Step 1 data saved successfully!
          </p>
        )}
      </form>
    </div>
  );
};

export default StepOne;
