import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StepTwo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phoneNumber: '',
  });

  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('registerData');
    if (!stored) {
      navigate('/register/step-one'); // redirect if step 1 not complete
    } else {
      setSavedData(JSON.parse(stored));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhone = (phone) => {
    return /^(\+254|254|0)?7\d{8}$/.test(phone);
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phoneNumber)) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    const confirmPayment = window.confirm(
      `We will initiate a payment of KES 100 to Till Number 123456 from this number:\n\n${formData.phoneNumber}\n\nDo you want to proceed?`
    );

    if (!confirmPayment) return;

    const completeData = {
      ...savedData,
      ...formData,
    };

    localStorage.setItem('registerData', JSON.stringify(completeData));

    // Simulate payment trigger here (real integration would call backend or STK push)

    navigate('/register/step-three');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleNext} className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Step 2: Mobile Payment</h2>

        <p className="mb-4 text-sm text-gray-700">
          Please enter your M-Pesa phone number. A prompt to pay <strong>KES 100</strong> to Till Number <strong>123456</strong> will appear automatically.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g., 0712345678"
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Pay & Continue
        </button>
      </form>
    </div>
  );
};

export default StepTwo;
