"use client";
import { motion } from "framer-motion";

export function BlockOverlay({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center"
    >
      <div className="text-center max-w-2xl p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold mb-4 text-red-500">
          Integrity Violation Detected
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          You've changed tabs/windows {count} times. This test requires full focus.
        </p>
        <p className="text-lg text-red-400">
          Further violations will result in test termination.
        </p>
      </div>
    </motion.div>
  );
}