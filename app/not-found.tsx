"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  const [logoLoading, setLogoLoading] = useState(true);

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Subtle blue gradient accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-40" />
      </div>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="HireBit Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-white text-xl font-bold">HireBit</span>
        </Link>
      </nav>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated Logo with loading state */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <Image
            src="/logo.png"
            alt="HireBit"
            fill
            className="object-contain"
            onLoadingComplete={() => setLogoLoading(false)}
          />
          {logoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="text-white">Loading...</span>
            </div>
          )}
        </div>

        {/* 404 Text */}
        <motion.h1
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-9xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            The page has vanished into the digital universe.
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            The page you're looking for has been lost in the void.
          </p>
        </motion.div>

        {/* Return Home Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/main"
            className="inline-flex items-center px-8 py-4 bg-blue-800 rounded-2xl font-semibold text-white hover:bg-blue-700 transition-all duration-300"
          >
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
