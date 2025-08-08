import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StepThree = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
  });

  const [showWelcome, setShowWelcome] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('registerData');
    if (!stored) {
      navigate('/register/step-one');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.idNumber || !formData.dateOfBirth || !formData.address) {
      alert('Please fill in all required fields.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User ID missing. Please restart registration.');
      return;
    }

    // Combine data from Step 1 (stored) + Step 3 inputs
    const existingData = JSON.parse(localStorage.getItem('registerData'));
    const finalData = {
      ...existingData,
      ...formData,
      user_id: userId,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/register/step-three/${userId}/`, {
        method: 'PUT', // or PATCH, depending on your backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.detail || 'KYC submission failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.removeItem('registerData');
      localStorage.removeItem('userId');

      setShowWelcome(true);

      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100 px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-4">Welcome to Liquidity Funding!</h2>
          <p className="text-gray-700 text-lg">Thank you for completing your KYC. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Step 3: KYC Form</h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ID Number / Passport</label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit KYC'}
        </button>
      </form>
    </div>
  );
};

export default StepThree;
