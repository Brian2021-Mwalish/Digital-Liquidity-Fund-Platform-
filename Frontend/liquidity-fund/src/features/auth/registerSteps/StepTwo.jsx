import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react"; // Back arrow icon

export default function StepTwo({ onNext, onBack }) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Send only mobile number to backend
      const res = await fetch("http://localhost:8000/api/payment/initiate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber }),
      });

      if (!res.ok) {
        throw new Error("Payment initiation failed");
      }

      const data = await res.json();
      if (data.status === "success") {
        setSuccess(true);

        // Redirect to step 3 after short delay
        setTimeout(() => {
          onNext();
        }, 1500);
      } else {
        throw new Error(data.message || "Payment could not be completed");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-900 to-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md relative"
        initial={{ y: 30 }}
        animate={{ y: 0 }}
      >
        {/* Back Arrow */}
        <button
          type="button"
          onClick={onBack}
          className="absolute -top-4 -left-4 bg-green-700 text-white p-2 rounded-full hover:bg-green-800 transition shadow-md"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
        </button>

        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
          Payment Confirmation
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your mobile number to receive the payment prompt.
        </p>

        <form onSubmit={handlePayment} className="space-y-4">
          <input
            type="tel"
            placeholder="e.g. 0712345678"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">Payment successful! Redirecting...</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold p-3 rounded-lg hover:bg-green-800 transition"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
