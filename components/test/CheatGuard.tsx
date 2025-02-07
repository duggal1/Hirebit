"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { BlockOverlay } from "./BlockOverlay";
import { CopyPasteGuard } from './copy-paste-guard';
import { detectBrowserDevTools } from './devtools-detector';

// Define CheatGuardProps interface
interface CheatGuardProps {
  /** Callback when violation occurs - receives violation count */
  onViolation: (count: number) => Promise<void>;
  /** Callback to terminate the test */
  onTestTerminate: () => void;
  /** Optional maximum violations before auto-termination */
  maxViolations?: number;
  /** Optional custom violation thresholds in milliseconds */
  thresholds?: {
    tabSwitch?: number;
    devToolsCheck?: number;
  };
}

interface CheatAttempt {
  timestamp: number;
  type: 'tab_switch' | 'window_blur' | 'devtools' | 'copy_paste' | 'fullscreen_exit';
  details?: string;
}

export function CheatGuard({ 
  onViolation, 
  onTestTerminate,
  maxViolations = 3,
  thresholds = {
    tabSwitch: 1000,
    devToolsCheck: 1000
  }
}: CheatGuardProps) {

  {
  const [violations, setViolations] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastFocusTime, setLastFocusTime] = useState(Date.now());
  const [cheatAttempts, setCheatAttempts] = useState<CheatAttempt[]>([]);

  const logViolation = useCallback((type: CheatAttempt['type'], details?: string) => {
    setCheatAttempts(prev => [...prev, {
      timestamp: Date.now(),
      type,
      details
    }]);
  }, []);

  const handleViolation = useCallback(async (type: CheatAttempt['type'], details?: string) => {
    const newCount = violations + 1;
    setViolations(newCount);
    setShowOverlay(true);
    logViolation(type, details);

    if (newCount >= 3) {
      await onViolation(newCount);
      onTestTerminate();
      return;
    }

    toast.warning(`Warning ${newCount}/3`, {
      description: 'Test integrity violation detected. Further attempts will terminate the test.',
      duration: 5000,
      action: {
        label: 'I understand',
        onClick: () => setShowOverlay(false),
      },
    });
  }, [violations, onViolation, onTestTerminate, logViolation]);




  useEffect(() => {
    let violationTimeout: number | null = null;
    const copyPasteGuard = new CopyPasteGuard((event) => {
      handleViolation('copy_paste', `Attempted ${event.type}`);
    });

    const detectCheating = async () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime;

      if (timeSinceLastFocus > thresholds.tabSwitch) {
        handleViolation('tab_switch');
      }
    };

    // Single DevTools Detection
    const devToolsInterval = setInterval(() => {
      if (detectBrowserDevTools()) {
        handleViolation('devtools', 'DevTools detected');
      }
    }, thresholds.devToolsCheck);

    // Copy-Paste Prevention
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy_paste', 'Attempted to copy/paste');
    };

    // Screen Capture Prevention - Fixed version
    const preventCapture = () => {
      if (!document.fullscreenElement && document.documentElement.clientWidth > 0) {
        handleViolation('fullscreen_exit', 'Exited fullscreen');
        // Try to re-enter fullscreen
        document.documentElement.requestFullscreen().catch(error => {
          console.error('Failed to re-enter fullscreen:', error);
        });
      }
    };

    // Multiple Windows Detection
    const checkMultipleWindows = () => {
      const windowCount = localStorage.getItem('test_window_count');
      const count = windowCount ? parseInt(windowCount) + 1 : 1;
      localStorage.setItem('test_window_count', count.toString());

      if (count > 1) {
        handleViolation('window_blur', 'Multiple windows detected');
      }
    };

    // Event Listeners
    document.addEventListener('visibilitychange', detectCheating);
    window.addEventListener('blur', detectCheating);
    window.addEventListener('focus', () => setLastFocusTime(Date.now()));
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('fullscreenchange', preventCapture); // Changed from webkitfullscreenchange
    window.addEventListener('load', checkMultipleWindows);

    // Initialize fullscreen on component mount
    const initializeFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.error('Failed to initialize fullscreen:', error);
        handleViolation('fullscreen_exit', 'Failed to enter fullscreen mode');
      }
    };

    initializeFullscreen();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', detectCheating);
      window.removeEventListener('blur', detectCheating);
      window.removeEventListener('focus', () => setLastFocusTime(Date.now()));
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('fullscreenchange', preventCapture);
      window.removeEventListener('load', checkMultipleWindows);
      clearInterval(devToolsInterval);
      if (violationTimeout) clearTimeout(violationTimeout);
      copyPasteGuard.cleanup();
      
      // Clean up localStorage on unmount
      localStorage.removeItem('test_window_count');
    };
  }, [handleViolation, lastFocusTime, thresholds]);

  return (
    <>
      {showOverlay && (
        <BlockOverlay 
          count={violations} 
          attempts={cheatAttempts}
        />
      )}
    </>
  );
  }
}