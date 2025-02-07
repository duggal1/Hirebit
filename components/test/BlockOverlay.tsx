"use client";

import { motion } from "framer-motion";
import { AlertTriangleIcon, ShieldAlert } from "lucide-react";

interface CheatAttempt {
  timestamp: number;
  type: 'tab_switch' | 'window_blur' | 'devtools' | 'copy_paste' | 'fullscreen_exit';
  details?: string;
}

const violationMessages = {
  tab_switch: "Switching tabs or windows",
  window_blur: "Opening multiple windows",
  devtools: "Using developer tools",
  copy_paste: "Attempting to copy or paste",
  fullscreen_exit: "Exiting fullscreen mode"
};

export function BlockOverlay({ 
  count, 
  attempts 
}: { 
  count: number;
  attempts: CheatAttempt[];
}) {
  const latestAttempt = attempts[attempts.length - 1];

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
        className="border-destructive/20 bg-card/50 shadow-2xl backdrop-blur-sm p-8 border rounded-xl max-w-2xl"
      >
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 w-16 h-16 text-destructive flex items-center justify-center"
        >
          <ShieldAlert className="w-full h-full" />
        </motion.div>
        
        <h1 className="bg-clip-text bg-gradient-to-r from-destructive to-destructive/70 mb-4 font-bold text-3xl text-transparent text-center">
          Test Integrity Violation
        </h1>
        
        <div className="mb-6 space-y-4">
          <p className="text-muted-foreground text-xl text-center">
            {latestAttempt && violationMessages[latestAttempt.type]}
          </p>
          
          <div className="bg-destructive/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-destructive">
              Recent Violations:
            </h3>
            <ul className="space-y-2 text-sm">
              {attempts.slice(-3).map((attempt, i) => (
                <li key={i} className="text-muted-foreground">
                  {new Date(attempt.timestamp).toLocaleTimeString()}: {violationMessages[attempt.type]}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="space-y-2 text-center">
          <p className="font-medium text-destructive text-lg">
            Warning {count}/3
          </p>
          <p className="text-muted-foreground text-sm">
            Your test will be terminated after 3 violations
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}