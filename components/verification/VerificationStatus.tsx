import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../ui/card';

interface VerificationStatusProps {
  verification: {
    isVerified: boolean;
    message: string;
    score: number;
  };
}

export function VerificationStatus({ verification }: VerificationStatusProps) {
  if (!verification) {
    return (
      <Card className="p-4 bg-black/40 backdrop-blur-xl border-zinc-800/50">
        <div className="flex items-center space-x-4">
          <div className="animate-pulse w-6 h-6 bg-zinc-700 rounded-full" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-200">Verification Pending</h3>
            <p className="text-zinc-400 text-sm">Analyzing portfolio data...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-4 bg-black/40 backdrop-blur-xl border-zinc-800/50">
        <div className="flex items-center space-x-4">
          {verification.isVerified ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-500" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-200">
              {verification.isVerified ? 'Verified Portfolio' : 'Verification Status'}
            </h3>
            <p className="text-zinc-400 text-sm">{verification.message}</p>
            <div className="mt-2">
              <div className="bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${verification.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${
                    verification.score >= 80 
                      ? 'bg-emerald-500' 
                      : verification.score >= 60 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Portfolio Score: {verification.score}/100
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}