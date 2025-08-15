import React, { useState, useEffect } from 'react';

const KYCForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idNumber: '',
    dob: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        setError(null);
        // Replace this with your real DRF user API endpoint
        const res = await fetch('/api/user/accounts/me/', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch user.');
        const data = await res.json();
        setFormData(formData => ({
          ...formData,
          name: data.name || '',
          email: data.email || '',
          idNumber: data.id_number || '',
          dob: data.dob || '',
          phone: data.phone || '',
          address: data.address || '',
        }));
      } catch (e) {
        setError(e.message);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    let toSend = {
      name: formData.name,
      email: formData.email,
      id_number: formData.idNumber,
      dob: formData.dob,
      phone: formData.phone,
      address: formData.address,
    };
    if (formData.password) toSend.password = formData.password;

    try {
      // Replace with your real backend endpoint
      const res = await fetch('/api/user/accounts/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toSend)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.detail || Object.values(errData).flat().join(' ') || 'Error updating profile.'
        );
      }
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center text-blue-700 font-medium py-10">Loading profile...</div>;

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">Profile Information</h2>
        <p className="mt-2 text-gray-600">Update your details below</p>
      </div>
      {error && <div className="mb-4 text-center text-sm text-red-500 font-medium">{error}</div>}
      {success && <div className="mb-4 text-center text-green-600 font-semibold">Profile updated successfully.</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="Full Name"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="Email Address"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="07xxxxxxxx"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">National ID / Passport</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="ID or Passport Number"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Residential Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="Your address"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Change Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="New password (optional)"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
              placeholder="Repeat new password"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-1 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            ) : (
              "Save Profile"
            )}
          </div>
        </button>
      </form>
    </div>
  );
};

export default KYCForm;
