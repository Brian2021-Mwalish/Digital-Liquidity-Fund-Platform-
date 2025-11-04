import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../lib/api";

const KYCForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    date_of_birth: "",
    address: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleBackClick = () => {
    navigate("/client-dashboard");
  };

  const getToken = () => {
    return (
      localStorage.getItem("access") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  useEffect(() => {
    const fetchProfileAndKYC = async () => {
      setFetching(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) throw new Error("You are not logged in. Please log in again.");

        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        if (!profileRes.ok) throw new Error("Failed to load user profile.");
        const profile = await profileRes.json();

        const kycRes = await fetch(`${API_BASE_URL}/api/kyc/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let kyc = {};
        if (kycRes.ok) {
          kyc = await kycRes.json();
        }

        setFormData({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone_number || "",
          id_number: kyc.national_id || "",
          date_of_birth: kyc.date_of_birth || "",
          address: kyc.address || "",
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setFetching(false);
      }
    };

    fetchProfileAndKYC();
  }, []);

  const validateField = (name, value) => {
    let errorMsg = "";
    
    switch(name) {
      case "full_name":
        if (!value.trim()) errorMsg = "Full name is required";
        else if (value.trim().length < 2) errorMsg = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) errorMsg = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Invalid email format";
        break;
      case "phone":
        if (value && !/^[\d\s+()-]+$/.test(value)) errorMsg = "Invalid phone format";
        break;
      case "id_number":
        if (value && value.length < 5) errorMsg = "ID number seems too short";
        break;
      case "date_of_birth":
        if (value) {
          const age = new Date().getFullYear() - new Date(value).getFullYear();
          if (age < 18) errorMsg = "You must be at least 18 years old";
          else if (age > 120) errorMsg = "Invalid date of birth";
        }
        break;
    }
    
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const errorMsg = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
    
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) errors[key] = errorMsg;
    });
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("You are not logged in.");

      const profileRes = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone,
        }),
      });

      if (profileRes.status === 401) throw new Error("Session expired. Please log in again.");
      if (!profileRes.ok) throw new Error("Failed to update profile.");

      const kycRes = await fetch(`${API_BASE_URL}/api/kyc/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          national_id: formData.id_number,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
        }),
      });

      if (kycRes.status === 401) throw new Error("Session expired. Please log in again.");
      if (!kycRes.ok) throw new Error("Failed to update KYC details.");

      setSuccess(true);
      setFieldErrors({});
    } catch (e) {
      setError(e.message || "Error updating KYC details.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 p-4 animate-in fade-in duration-500">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin"></div>
          </div>
          <p className="text-green-400 text-lg font-semibold animate-pulse">
            Loading your KYC profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 animate-in slide-in-from-top-4 duration-500 delay-200">
          <button
            type="button"
            onClick={handleBackClick}
            className="inline-flex items-center text-green-400 hover:text-green-300 font-medium transition-all mb-4 group hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 md:p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shrink-0 animate-pulse">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white animate-in slide-in-from-left-4 duration-500 delay-300">KYC Verification</h1>
                  <p className="text-green-400 text-sm sm:text-base mt-1 animate-in slide-in-from-left-4 duration-500 delay-400">Know Your Customer Identity Verification</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm animate-in slide-in-from-right-4 duration-500 delay-500">
                <div className="flex items-center space-x-1 bg-green-100/10 text-green-400 px-3 py-1.5 rounded-full border border-green-400/20">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <div className="shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Why do we need this information?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                KYC (Know Your Customer) verification helps us comply with financial regulations, prevent fraud, 
                and ensure the security of your account. Your information is encrypted and stored securely according 
                to industry standards and data protection laws.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 flex items-start">
              <svg className="w-5 h-5 text-destructive mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-destructive font-medium text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success/10 border-l-4 border-success rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 flex items-start">
              <svg className="w-5 h-5 text-success mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-success font-semibold text-sm sm:text-base">KYC details updated successfully!</p>
                <p className="text-success/80 text-sm mt-0.5">Your information has been securely saved.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-green-50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-green-400/30 overflow-hidden hover:border-green-400/50 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 md:px-8 py-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Personal Information</h2>
                  <span className="text-xs text-green-200 bg-green-600/20 px-2 py-1 rounded-full">Editable</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
                <div className="space-y-5 sm:space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Full Legal Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={`w-full border-2 ${fieldErrors.full_name ? 'border-destructive focus:border-destructive' : 'border-input focus:border-green-500'} focus:ring-4 focus:ring-green-500/10 rounded-lg px-4 py-3 transition-all outline-none text-foreground bg-background placeholder:text-muted-foreground`}
                      placeholder="John Doe Smith"
                      required
                    />
                    {fieldErrors.full_name && (
                      <p className="mt-1.5 text-sm text-destructive flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.full_name}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        className={`w-full border-2 ${fieldErrors.email ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'} focus:ring-4 focus:ring-primary/10 rounded-lg px-4 py-3 transition-all outline-none text-foreground bg-background placeholder:text-muted-foreground`}
                        placeholder="john@example.com"
                        required
                      />
                      {fieldErrors.email && (
                        <p className="mt-1.5 text-sm text-destructive flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full border-2 ${fieldErrors.phone ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'} focus:ring-4 focus:ring-primary/10 rounded-lg px-4 py-3 transition-all outline-none text-foreground bg-background placeholder:text-muted-foreground`}
                        placeholder="+1 (555) 000-0000"
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1.5 text-sm text-destructive flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ID Number & DOB */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        National ID / Passport Number
                      </label>
                      <input
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleChange}
                        className={`w-full border-2 ${fieldErrors.id_number ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'} focus:ring-4 focus:ring-primary/10 rounded-lg px-4 py-3 transition-all outline-none text-foreground bg-background placeholder:text-muted-foreground`}
                        placeholder="Enter ID or passport number"
                      />
                      {fieldErrors.id_number && (
                        <p className="mt-1.5 text-sm text-destructive flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.id_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        className={`w-full border-2 ${fieldErrors.date_of_birth ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'} focus:ring-4 focus:ring-primary/10 rounded-lg px-4 py-3 transition-all outline-none text-foreground bg-background`}
                      />
                      {fieldErrors.date_of_birth && (
                        <p className="mt-1.5 text-sm text-destructive flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.date_of_birth}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Residential Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full border-2 ${fieldErrors.address ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'} focus:ring-4 focus:ring-primary/10 rounded-lg px-4 py-3 transition-all outline-none text-foreground bg-background placeholder:text-muted-foreground resize-none`}
                      placeholder="Street address, apartment/unit number, city, postal code"
                    />
                    {fieldErrors.address && (
                      <p className="mt-1.5 text-sm text-destructive flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="sm:order-1 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="sm:order-2 flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save KYC Information
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Security Info */}
            <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-5">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Data Security</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  256-bit SSL encryption
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  GDPR compliant storage
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No data sold to third parties
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Regular security audits
                </li>
              </ul>
            </div>

            {/* Verification Benefits */}
            <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-5">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Verification Benefits</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Higher transaction limits
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Enhanced account security
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Access to premium features
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority customer support
                </li>
              </ul>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-5">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <h3 className="font-semibold text-foreground">Need Help?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                If you have questions about the KYC process, our support team is here to assist you.
              </p>
              <a href="/support" className="inline-flex items-center text-sm font-semibold text-primary hover:text-accent transition-colors">
                Contact Support
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>All information is encrypted and securely stored</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;