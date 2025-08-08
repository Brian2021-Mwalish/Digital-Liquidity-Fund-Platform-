import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StepTwo = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!mobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User ID missing. Please restart registration.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/user/register/step-two/${userId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: mobileNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.mobile_number
            ? errorData.mobile_number[0]
            : errorData.detail || "Failed to save mobile number."
        );
        setLoading(false);
        return;
      }

      setSuccessMessage("Mobile number saved successfully! Redirecting...");
      
      // Delay for user to see message before navigation
      setTimeout(() => {
        navigate("/register/step-three");
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 relative">
      {/* Back arrow */}
      <div
        className="absolute top-6 left-6 cursor-pointer hover:scale-110 transition-transform"
        onClick={() => navigate("/register/step-one")}
        title="Back to Step 1"
      >
        <ArrowLeft size={28} className="text-green-800" />
      </div>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Enter Mobile Number</h2>
        <p className="text-gray-600 mb-6 text-sm">
          We’ll send a payment prompt to your phone for KES 100. Once payment is successful,
          you’ll be redirected automatically.
        </p>

        <input
          type="tel"
          placeholder="e.g. 071100000"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
          disabled={loading}
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {successMessage && (
          <p className="text-green-700 text-sm mb-4 font-semibold">{successMessage}</p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <span className="flex justify-center items-center gap-2">
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
              Processing...
            </span>
          ) : (
            "Pay Now"
          )}
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
