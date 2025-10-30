import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = "Loading Your Dashboard...", subMessage = "Please wait while we set things up 🌱" }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Unique Animated Logo */}
      <div className="relative mb-6">
        <motion.div
          className="w-20 h-20 border-4 border-green-600 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-green-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-2 w-16 h-16 bg-green-500 rounded-full opacity-20"
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* App Name / Brand */}
      <motion.h1
        className="text-2xl font-semibold text-green-800 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {message}
      </motion.h1>

      {/* Subtext / Tagline */}
      <motion.p
        className="mt-3 text-sm text-green-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {subMessage}
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
