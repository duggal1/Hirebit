import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';

interface ErrorProps {
  error: Error | null;
}

const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-black/95 min-h-screen backdrop-blur-xl">
      <div className="space-y-8 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 blur-3xl" />
        
        {/* Modern animated loading spinner with multiple layers */}
        <div className="flex items-center justify-center h-48 relative">
          <div className="absolute h-32 w-32 bg-violet-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
            <div className="absolute inset-0 h-16 w-16 animate-ping opacity-20 bg-violet-500 rounded-full" />
          </div>
        </div>

        {/* Ultra-modern skeleton content with glass morphism */}
        <div className="space-y-6 relative backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
          {/* Title skeleton */}
          <div className="h-10 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 rounded-xl animate-pulse" />

          {/* Content skeletons with smooth transitions */}
          <div className="space-y-4">
            {[0.9, 0.7, 0.8, 0.75].map((width, i) => (
              <div
                key={i}
                className="h-4 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 rounded-full animate-pulse transition-all duration-500 ease-in-out hover:shadow-lg hover:shadow-violet-500/10"
                style={{ width: `${width * 100}%` }}
              />
            ))}
          </div>

          {/* Modern card skeletons with advanced hover effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[1, 2].map((i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:scale-110 opacity-0 group-hover:opacity-100" />
                <div className="relative h-40 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl transition-all duration-300 
                  backdrop-blur-xl border border-white/10
                  group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-violet-500/20
                  overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<ErrorProps> = ({ error }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-black/95 min-h-screen backdrop-blur-xl">
      <div className="relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-orange-500/10 blur-3xl" />
        
        <Alert className="relative animate-in slide-in-from-top-2 duration-500 
          backdrop-blur-xl bg-gray-900/80 border border-red-500/20 
          shadow-lg shadow-red-500/10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-20" />
          <div className="relative flex items-start space-x-4">
            <div className="relative mt-1">
              <AlertCircle className="h-6 w-6 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
              <div className="absolute inset-0 animate-ping opacity-20 text-red-500" />
            </div>
            <div className="flex-1 space-y-2">
              <AlertTitle className="text-xl font-medium tracking-tight text-white/90">
                Something went wrong
              </AlertTitle>
              <AlertDescription className="text-base text-gray-400/90 leading-relaxed">
                {error?.message || 'An unexpected error occurred. Please try again later.'}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export { LoadingSkeleton, ErrorDisplay };