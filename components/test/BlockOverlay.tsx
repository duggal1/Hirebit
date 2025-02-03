"use client";
import { motion } from "framer-motion";
import { AlertTriangleIcon } from "lucide-react";

export function BlockOverlay({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="z-50 fixed inset-0 flex justify-center items-center bg-background/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="border-destructive/20 bg-card/50 shadow-2xl backdrop-blur-sm p-8 border rounded-xl max-w-2xl text-center"
      >
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 w-16 h-16 text-destructive"
        >
          <AlertTriangleIcon className="w-full h-full" />
        </motion.div>
        
        <h1 className="bg-clip-text bg-gradient-to-r from-destructive to-destructive/70 mb-4 font-bold text-3xl text-transparent">
          Integrity Violation Detected
        </h1>
        
        <p className="mb-6 text-muted-foreground text-xl">
          You've changed tabs/windows {count} times. This test requires full focus.
        </p>
        
        <div className="space-y-2">
          <p className="font-medium text-destructive text-lg">
            Warning {count}/3
          </p>
          <p className="text-muted-foreground text-sm">
            Further violations will result in test termination
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}