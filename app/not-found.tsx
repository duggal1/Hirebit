"use client"

import { useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  const [logoLoading, setLogoLoading] = useState(true)

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 overflow-hidden"
        >
          {/* Navigation Bar */}
          <nav className="absolute top-0 left-0 w-full flex justify-between items-center p-4 z-50">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.png"
                    alt="HireBit Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white text-xl font-bold">HireBit</span>
              </div>
            </Link>
          </nav>
   
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4"
        >
          <div className="max-w-4xl w-full relative isolate">
            {/* Background elements */}
            <div
              className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
              aria-hidden="true"
            >
              <div
                className="relative left-1/2 aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-500 to-blue-500 opacity-20"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>

            {/* Main content */}
            <div className="text-center">
              {/* Animated logo with loading state */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-8 relative"
              >
                <div className="relative w-32 h-32">
                  <Image
                    src="/logo.png"
                    alt="HireBit"
                    fill
                    priority
                    className="object-contain hover:scale-105 transition-transform duration-300"
                    onLoadingComplete={() => setLogoLoading(false)}
                  />
                  {logoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <span className="text-white">Loading...</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 404 Text */}
              <motion.h1
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-9xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent mb-8"
              >
                404
              </motion.h1>

              {/* Message */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  The page has vanished into the digital universe.
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  The page you&apos;re looking for has been lost in the void.
                </p>
              </motion.div>

              {/* Action button */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <a
                  href="/"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl font-semibold text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group"
                >
                  <span>Return Home</span>
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </motion.div>
            </div>

            {/* Floating particles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full"
                  style={{
                    width: Math.random() * 20 + 10 + 'px',
                    height: Math.random() * 20 + 10 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  
  )
}
