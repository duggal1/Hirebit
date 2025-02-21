import { isVerified } from '@/src/services/githubVerification';
import { verifyPortfolio } from '@/src/services/isverificationportfoliio';
import { validateLinkedInProfile } from '@/src/services/linkdln';
import { PortfolioInsights } from '@/src/services/portfolioService';
import { useState, useEffect } from 'react';

interface VerificationStatusProps {
  linkedinUrl: string;
  githubData: GithubUserData;
  portfolioData: PortfolioInsights;
  onVerificationComplete: (isVerified: boolean) => void;
  applyUrl: string;
}

const VerificationStatus = ({ 
  linkedinUrl, 
  githubData, 
  portfolioData,
  onVerificationComplete,
  applyUrl 
}: VerificationStatusProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    linkedin: false,
    github: false,
    portfolio: false
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyAll = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        // Run verifications
        const [linkedinResult, githubResult, portfolioResult] = await Promise.all([
          validateLinkedInProfile(linkedinUrl),
          isVerified(githubData), // Using correct import name
          verifyPortfolio(portfolioData)
        ]);

        const newStatus = {
          linkedin: linkedinResult.isValid && linkedinResult.profileExists,
          github: githubResult.isVerified,
          portfolio: portfolioResult.isVerified
        };

        setVerificationStatus(newStatus);
        onVerificationComplete(Object.values(newStatus).every(status => status));

      } catch (error) {
        console.error('Verification failed:', error);
        setErrorMessage('Verification process failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (linkedinUrl && githubData && portfolioData) {
      verifyAll();
    }
  }, [linkedinUrl, githubData, portfolioData, onVerificationComplete]);

  return (
    <div className="max-w-md mx-auto mt-4 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Profile Verification Status</h3>
      
      {/* Status Indicators */}
      <div className="space-y-3 mb-4">
        {Object.entries(verificationStatus).map(([key, status]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="capitalize">{key}</span>
            <span className="text-sm text-gray-500">
              {status ? '✓ Verified' : '× Pending verification'}
            </span>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center text-gray-600">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2" />
          <p>Verifying profiles...</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-500 text-sm mb-4">
          {errorMessage}
        </div>
      )}

      {/* Apply Button */}
      {!isLoading && (
        <a
          href={applyUrl}
          className={`block w-full text-center py-2 px-4 rounded-md transition-all ${
            Object.values(verificationStatus).every(v => v)
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!Object.values(verificationStatus).every(v => v)) {
              e.preventDefault();
            }
          }}
        >
          {Object.values(verificationStatus).every(v => v)
            ? 'Apply Now'
            : 'Complete Verification to Apply'}
        </a>
      )}
    </div>
  );
};

export default VerificationStatus;