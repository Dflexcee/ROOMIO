import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import DarkModeToggle from '../components/common/DarkModeToggle';
import VerificationFormNew from '../components/user/VerificationFormNew';
import VerificationStatus from '../components/common/VerificationStatus';
import { useAuth } from '../contexts/AuthContext';
import config from '../config/api';

export default function Verification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(config.getUrl('/verification/status.php'), {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVerificationData(data.verification);
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmitted = () => {
    setSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  if (!user) {
    navigate('/signup-login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="pt-16">
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-100 dark:border-gray-800">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-blue-700 dark:text-pink-400">
            Account Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete your verification to post rooms and listings on Roomio
          </p>

          {/* Show current verification status */}
          <VerificationStatus user={user} />

          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 text-center mt-6">
              <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                Verification Submitted!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                Your verification is under review. Admin will approve it soon.
                <br />
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Only show form if not pending or approved */}
              {(!verificationData || verificationData.status === 'rejected' || verificationData.status === 'suspended' || !verificationData.status) && (
                <div className="mt-6">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {verificationData?.status === 'rejected' || verificationData?.status === 'suspended' ? 'Resubmit Verification' : 'Submit Verification'}
                    </h2>
                    <VerificationFormNew onSuccess={handleVerificationSubmitted} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
