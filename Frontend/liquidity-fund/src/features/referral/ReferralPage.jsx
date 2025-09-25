// src/features/referral/ReferralPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ReferralPage = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem("access");

  // Fetch referral code + history
  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch referral code
      const codeRes = await fetch(`${API_BASE_URL}/api/referrals/code/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (codeRes.ok) {
        const codeData = await codeRes.json();
        setReferralCode(codeData.referral_code);
      }

      // Fetch referral history (who this user referred)
      const historyRes = await fetch(`${API_BASE_URL}/api/referrals/history/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setReferrals(historyData.referrals || []);
      }

      // Fetch referrer info (who referred this user)
      const refByRes = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (refByRes.ok) {
        const profileData = await refByRes.json();
        if (profileData.referred_by) {
          setReferrer(profileData.referred_by);
        }
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReferralData();
  }, [token]);

  // Copy referral link
  const copyToClipboard = () => {
  const link = `${window.location.origin}/referral/${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-green-700 font-medium">Loading referrals...</span>
        </div>
      </div>
    );
  }

  const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.reward || 0), 0);
  const completedReferrals = referrals.filter(ref => ref.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Referrer Info */}
        {referrer && (
          <div className="bg-white border-2 border-green-200 rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">You were referred by:</h2>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-green-700">{referrer.full_name}</span>
              <span className="text-gray-600">({referrer.email})</span>
            </div>
          </div>
        )}
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/client-dashboard"
            className="inline-flex items-center px-4 py-2 bg-white text-green-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-green-200 hover:bg-green-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-green-800">Referral Program</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Referrals</p>
                <p className="text-3xl font-bold">{referrals.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">{completedReferrals}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold">{totalEarnings} KES</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-white border-2 border-green-200 rounded-3xl shadow-xl p-8 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your Referral Code</h2>
            <p className="text-gray-600">Invite friends and earn rewards when they join!</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-4 rounded-2xl border-2 border-green-300">
              <span className="text-2xl font-mono font-bold text-green-800">
                {referralCode || "N/A"}
              </span>
            </div>
            
            <button
              onClick={copyToClipboard}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
              }`}
            >
              {copied ? "Copied! ✓" : "Copy Referral Link"}
            </button>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white border-2 border-green-200 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Referral History
          </h2>
          {/* Show who referred you */}
          {referrer && (
            <div className="mb-6 text-green-700 font-medium">
              <span>You were referred by: {referrer.full_name} ({referrer.email})</span>
            </div>
          )}
          {/* Show who you referred */}
          {referrals.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-green-100">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">Referred User</th>
                    <th className="p-4 text-left font-semibold">Email</th>
                    <th className="p-4 text-left font-semibold">Date Referred</th>
                    <th className="p-4 text-center font-semibold">Status</th>
                    <th className="p-4 text-right font-semibold">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref, index) => (
                    <tr key={index} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">
                        {ref.referred_name || "Anonymous User"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {ref.referred_email}
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(ref.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            ref.status === "completed"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-green-700 font-bold text-lg">
                          {ref.reward || 0} KES
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No referrals yet</h3>
              <p className="text-gray-500">Start sharing your referral code to earn rewards!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;