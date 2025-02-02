"use client";


import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlockOverlay } from "./BlockOverlay";
//import { BlockOverlay } from "./BlockOverlay";

export function CheatGuard({ onViolation }: { 
  onViolation: (count: number) => Promise<void> 
}) {
  const [violations, setViolations] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let lastFocusTime = Date.now();

    const detectCheating = async () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime;
      
      // Only count violation if focus was lost for more than 2 seconds
      if (timeSinceLastFocus > 2000) {
        const newCount = violations + 1;
        setViolations(newCount);
        lastFocusTime = now;

        if (newCount >= 3) {
          await onViolation(newCount);
          return;
        }

        toast.warning(`Warning ${newCount}/3`, {
          description: 'Focus on the test! Further violations may reset your progress',
          duration: 5000,
          action: {
            label: 'I understand',
            onClick: () => {},
          },
        });
      }

      // Force fullscreen
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (error) {
          console.error('Fullscreen error:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        detectCheating();
      }
    };

    const handleBlur = () => {
      detectCheating();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
     // clearTimeout(timeout);
    };
  }, [violations, onViolation]);

  return violations > 0 ? <BlockOverlay count={violations} /> : null;
}