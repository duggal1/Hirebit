"use client";


import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlockOverlay } from "./BlockOverlay";
//import { BlockOverlay } from "./BlockOverlay";

export function CheatGuard({ onViolation }: { 
  onViolation: (count: number) => Promise<void> 
}) {
  const [violations, setViolations] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastFocusTime, setLastFocusTime] = useState(Date.now());

  useEffect(() => {
    let violationTimeout: NodeJS.Timeout;

    const detectCheating = async () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime;
      
      if (timeSinceLastFocus > 2000) {
        const newCount = violations + 1;
        setViolations(newCount);
        setShowOverlay(true);
        setLastFocusTime(now);

        // Auto-hide overlay after 5 seconds
        clearTimeout(violationTimeout);
        violationTimeout = setTimeout(() => {
          setShowOverlay(false);
        }, 5000);

        if (newCount >= 3) {
          await onViolation(newCount);
          return;
        }

        toast.warning(`Warning ${newCount}/3`, {
          description: 'Focus on the test! Further violations may reset your progress',
          duration: 5000,
          action: {
            label: 'I understand',
            onClick: () => setShowOverlay(false),
          },
        });
      }

      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        detectCheating();
      } else {
        setLastFocusTime(Date.now());
      }
    };

    const handleBlur = () => {
      detectCheating();
    };

    const handleFocus = () => {
      setLastFocusTime(Date.now());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearTimeout(violationTimeout);
    };
  }, [violations, lastFocusTime, onViolation]);

  return showOverlay ? <BlockOverlay count={violations} /> : null;
}