import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

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
    window.location.href = '/dashboard';
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
          id_number: kyc.id_number || '',
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
      // Update KYC info
      const res = await fetch(`${API_BASE_URL}/kyc/`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_number: formData.id_number,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
        }),
      });
      if (!res.ok) throw new Error('Failed to update KYC profile.');

      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to update KYC profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-cyan-500 animate-spin animate-reverse delay-300"></div>
          </div>
          <p className="text-violet-700 font-medium text-lg animate-pulse">Loading your KYC profile...</p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-100/20 to-cyan-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-3/4 mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-12 transform transition-all duration-700 hover:shadow-3xl hover:bg-white/85">
          {/* Back button with enhanced styling */}
                 <Link
                    to="/client-dashboard"
                    className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2 rounded-xl shadow-lg font-semibold text-base hover:bg-blue-700 transition"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                    Dashboard
                  </Link>

          {/* Header with floating animation */}
          <div className="text-center mb-12 transform transition-all duration-1000">
            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 mb-6 animate-bounce shadow-lg">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-pulse mb-4">
              KYC Profile
            </h2>
            <p className="text-gray-600 text-lg font-medium">Complete your identity verification</p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-violet-500 to-cyan-500 mx-auto rounded-full animate-pulse"></div>
          </div>

          {/* Enhanced error and success messages */}
          {error && (
            <div className="mb-8 p-6 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 font-medium text-center transform transition-all duration-500 animate-shake">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-red-200">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                </div>
                <span className="text-lg">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-semibold text-center transform transition-all duration-500 animate-bounce">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-emerald-200">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <span className="text-lg">KYC profile updated successfully!</span>
              </div>
            </div>
          )}

          <div onSubmit={handleSubmit} className="space-y-8">
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group transform transition-all duration-300 hover:scale-105">
                <label className="block mb-4 font-bold text-gray-700 text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors duration-300">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    Full Name
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    disabled
                    className="w-full px-6 py-4 border-2 rounded-2xl bg-gray-50 text-gray-500 font-medium transition-all duration-300 focus:ring-4 focus:ring-violet-200 focus:border-violet-400 shadow-sm"
                    placeholder="Full Name"
                  />
                  <div className="absolute top-3 right-4 text-gray-400 animate-pulse">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group transform transition-all duration-300 hover:scale-105">
                <label className="block mb-4 font-bold text-gray-700 text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-6 py-4 border-2 rounded-2xl bg-gray-50 text-gray-500 font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 shadow-sm"
                    placeholder="Email Address"
                  />
                  <div className="absolute top-3 right-4 text-gray-400 animate-pulse">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group transform transition-all duration-300 hover:scale-105">
                <label className="block mb-4 font-bold text-gray-700 text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors duration-300">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                      </svg>
                    </div>
                    Date of Birth
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('date_of_birth')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-6 py-4 border-2 rounded-2xl font-medium transition-all duration-300 focus:ring-4 focus:ring-violet-200 focus:border-violet-400 focus:scale-105 hover:border-violet-300 shadow-sm ${
                      focusedField === 'date_of_birth' ? 'bg-violet-50 border-violet-400' : 'bg-white hover:bg-violet-25'
                    }`}
                  />
                  {focusedField === 'date_of_birth' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full animate-ping"></div>
                  )}
                </div>
              </div>

              <div className="group transform transition-all duration-300 hover:scale-105">
                <label className="block mb-4 font-bold text-gray-700 text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-cyan-100 group-hover:bg-cyan-200 transition-colors duration-300">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    Phone Number
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    disabled
                    className="w-full px-6 py-4 border-2 rounded-2xl bg-gray-50 text-gray-500 font-medium transition-all duration-300 focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 shadow-sm"
                    placeholder="07xxxxxxxx"
                  />
                  <div className="absolute top-3 right-4 text-gray-400 animate-pulse">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group transform transition-all duration-300 hover:scale-105">
                <label className="block mb-4 font-bold text-gray-700 text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-cyan-100 group-hover:bg-cyan-200 transition-colors duration-300">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h8v16z"/>
                      </svg>
                    </div>
                    National ID / Passport
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('id_number')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-6 py-4 border-2 rounded-2xl font-medium transition-all duration-300 focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 focus:scale-105 hover:border-cyan-300 shadow-sm ${
                      focusedField === 'id_number' ? 'bg-cyan-50 border-cyan-400' : 'bg-white hover:bg-cyan-25'
                    }`}
                    placeholder="ID or Passport Number"
                  />
                  {focusedField === 'id_number' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full animate-ping"></div>
                  )}
                </div>
              </div>

              <div className="group transform transition-all duration-300 hover:scale-105">
                <label className="block mb-4 font-bold text-gray-700 text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                    </div>
                    Residential Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-6 py-4 border-2 rounded-2xl font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 focus:scale-105 hover:border-blue-300 shadow-sm ${
                      focusedField === 'address' ? 'bg-blue-50 border-blue-400' : 'bg-white hover:bg-blue-25'
                    }`}
                    placeholder="Your residential address"
                  />
                  {focusedField === 'address' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced submit button */}
            <div className="pt-8">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 text-white py-6 rounded-2xl font-bold text-lg transition-all duration-500 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-700 hover:-translate-y-2 hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="relative w-6 h-6">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                      </div>
                      <span className="animate-pulse">Updating Profile...</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="group-hover:rotate-12 transition-transform duration-300">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Save KYC Profile</span>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="group-hover:translate-x-2 transition-transform duration-300">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Security note with enhanced animation */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50 border-2 border-violet-200/50 transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center gap-4 text-violet-700">
              <div className="p-3 rounded-full bg-gradient-to-r from-violet-200 to-cyan-200 animate-pulse shadow-md">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg">Your information is secure and encrypted</span>
                <p className="text-sm text-gray-600 mt-1">Protected with bank-level security standards</p>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full animate-pulse"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-violet-300 to-cyan-300 rounded-full"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .hover\\:bg-violet-25:hover {
          background-color: rgba(139, 92, 246, 0.025);
        }
        
        .hover\\:bg-blue-25:hover {
          background-color: rgba(59, 130, 246, 0.025);
        }
        
        .hover\\:bg-cyan-25:hover {
          background-color: rgba(6, 182, 212, 0.025);
        }
      `}</style>
    </div>
  );
};

export default KYCForm;