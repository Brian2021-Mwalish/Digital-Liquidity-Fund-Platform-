import React, { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:8000/api";

const KYCForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    id_number: '',
    date_of_birth: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Simulate navigation back to dashboard
  const handleBackClick = () => {
    console.log('Navigate to dashboard');
  };

  // Fetch profile info and KYC info from backend
  useEffect(() => {
    const fetchProfileAndKYC = async () => {
      setFetching(true);
      setError(null);
      try {
        const token = localStorage.getItem("access");
        
        // Fetch profile
        const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!profileRes.ok) throw new Error('Failed to fetch profile.');
        const profile = await profileRes.json();

        // Fetch KYC
        const kycRes = await fetch(`${API_BASE_URL}/kyc/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        let kyc = {};
        if (kycRes.ok) {
          kyc = await kycRes.json();
        }

        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone_number || '',
          id_number: kyc.national_id || '',
          date_of_birth: kyc.date_of_birth || '',
          address: kyc.address || '',
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setFetching(false);
      }
    };
    fetchProfileAndKYC();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const token = localStorage.getItem("access");
      
      // Update Profile info (full_name, email, phone)
      const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone,
        }),
      });
      if (!profileRes.ok) throw new Error('Failed to update profile.');

      // Update KYC info
      const kycRes = await fetch(`${API_BASE_URL}/kyc/`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          national_id: formData.id_number,   // ✅ rename here
          date_of_birth: formData.date_of_birth,
          address: formData.address,
        }),
      });
      if (!kycRes.ok) throw new Error('Failed to update KYC profile.');

      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-emerald-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 animate-spin"></div>
          </div>
          <p className="text-green-700 font-medium animate-pulse">Loading KYC profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 py-4 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-200/40 to-green-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-green-200/30 to-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-green-100/30 to-emerald-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-16 left-16 w-3 h-3 bg-green-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-32 right-24 w-2 h-2 bg-green-500 rounded-full animate-float delay-700 opacity-70"></div>
        <div className="absolute bottom-24 left-1/4 w-4 h-4 bg-green-300 rounded-full animate-float delay-1000 opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-green-200/30 p-6 transform transition-all duration-700 hover:shadow-2xl animate-slide-up">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg font-semibold hover:bg-green-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>

            <div className="text-center">
              <div className="inline-block p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 mb-2 shadow-lg">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                KYC Profile
              </h2>
              <p className="text-gray-600 font-medium">Complete your identity verification</p>
            </div>

            <div className="w-20"></div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-center">
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold text-center">
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Profile updated successfully!</span>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Row */}
            <div className="bg-green-50/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <div className="p-1 rounded-full bg-green-200">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('full_name')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-green-300 shadow-sm ${
                        focusedField === 'full_name' ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-green-25'
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {focusedField === 'full_name' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-green-300 shadow-sm ${
                        focusedField === 'email' ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-green-25'
                      }`}
                      placeholder="Enter your email address"
                      required
                    />
                    {focusedField === 'email' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-green-300 shadow-sm ${
                        focusedField === 'phone' ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-green-25'
                      }`}
                      placeholder="07xxxxxxxx"
                      required
                    />
                    {focusedField === 'phone' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('date_of_birth')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-green-300 shadow-sm ${
                        focusedField === 'date_of_birth' ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-green-25'
                      }`}
                      required
                    />
                    {focusedField === 'date_of_birth' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Identity & Address Row */}
            <div className="bg-green-50/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <div className="p-1 rounded-full bg-green-200">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h8v16z"/>
                  </svg>
                </div>
                Identity & Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">National ID / Passport</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('id_number')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-green-300 shadow-sm ${
                        focusedField === 'id_number' ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-green-25'
                      }`}
                      placeholder="ID or Passport Number"
                      required
                    />
                    {focusedField === 'id_number' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Residential Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-green-300 shadow-sm ${
                        focusedField === 'address' ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-green-25'
                      }`}
                      placeholder="Your residential address"
                      required
                    />
                    {focusedField === 'address' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-500 hover:from-green-700 hover:to-green-800 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="relative w-5 h-5">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                      </div>
                      <span className="animate-pulse">Updating Profile...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="group-hover:rotate-12 transition-transform duration-300">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Save Profile</span>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform duration-300">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center gap-3 text-green-700">
              <div className="p-2 rounded-full bg-green-200 shadow-sm">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <div>
                <span className="font-bold">Your information is secure and encrypted</span>
                <p className="text-sm text-green-600">Protected with bank-level security standards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        
        .hover\\:bg-green-25:hover {
          background-color: rgba(34, 197, 94, 0.025);
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default KYCForm;