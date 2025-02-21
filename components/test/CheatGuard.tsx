"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { BlockOverlay } from "./BlockOverlay";
import { CopyPasteGuard } from "./copy-paste-guard";
import { useRouter } from "next/navigation";

interface CheatGuardProps {
  onViolation: (count: number) => Promise<void>;
  onTestTerminate: () => void;
  maxViolations?: number;
}

export interface CheatAttempt {
  timestamp: number;
  type: 'tab_switch' | 'devtools' | 'copy_paste';
  details?: string;
}

export function CheatGuard({ 
  onViolation, 
  onTestTerminate,
  maxViolations = 3
}: CheatGuardProps) {
  const router = useRouter();
  const [violations, setViolations] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [cheatAttempts, setCheatAttempts] = useState<CheatAttempt[]>([]);

  const handleViolation = useCallback(async (type: CheatAttempt['type'], details?: string) => {
    const newCount = violations + 1;
    setViolations(newCount);
    setShowOverlay(true);
    
    setCheatAttempts(prev => [...prev, {
      timestamp: Date.now(),
      type,
      details
    }]);

    if (newCount >= maxViolations) {
      await onViolation(newCount);
      onTestTerminate();
      router.push('/');
      return;
    }

    toast.warning(`Warning ${newCount}/${maxViolations}`, {
      description: 'Please stay in the test window',
      duration: Infinity,
      action: {
        label: 'Continue Test',
        onClick: () => setShowOverlay(false),
      },
    });
  }, [violations, maxViolations, onViolation, onTestTerminate, router]);

  useEffect(() => {
    const detectTabSwitch = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('tab_switch', 'Switched away from test');
      }
    };

    const detectDevTools = () => {
      if (window.outerWidth - window.innerWidth > 160) {
        handleViolation('devtools', 'DevTools detected');
      }
    };

    // Initialize copy-paste guard
    const copyPasteGuard = new CopyPasteGuard(() => {
      handleViolation('copy_paste', 'Attempted copy/paste');
    });

    document.addEventListener('visibilitychange', detectTabSwitch);
    window.addEventListener('resize', detectDevTools);

    return () => {
      document.removeEventListener('visibilitychange', detectTabSwitch);
      window.removeEventListener('resize', detectDevTools);
      copyPasteGuard.cleanup();
    };
  }, [handleViolation]);

  return showOverlay ? (
    <BlockOverlay 
      count={violations} 
      attempts={cheatAttempts}
    />
  ) : null;
}