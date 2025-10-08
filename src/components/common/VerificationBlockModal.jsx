import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Verification Block Modal - 3 States:
 * 1. UNVERIFIED - User must start verification (shows "Verify Now" button, NO CANCEL)
 * 2. PENDING - Verification submitted, waiting for admin approval (NO CANCEL)
 * 3. REJECTED - Verification was rejected, can resubmit (NO CANCEL)
 */
export default function VerificationBlockModal({
  status,
  onStartVerification,
  rejectionReason,
  pageType = 'room' // 'room' or 'listing'
}) {
  const navigate = useNavigate();

  // UNVERIFIED - Must verify to continue
  if (status === 'unverified' || !status) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <svg className="h-10 w-10 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Required
            </h3>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              To post {pageType === 'room' ? 'rooms' : 'listings'}, you must complete identity verification first. This helps keep our community safe.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onStartVerification}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform transition hover:scale-105"
              >
                ✓ Verify Now
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ← Go to Dashboard
              </button>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              💡 Verification usually takes 24-48 hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PENDING - Waiting for admin approval
  if (status === 'pending') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            {/* Animated Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4 animate-pulse">
              <svg className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Pending
            </h3>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your verification request is being reviewed by our admin team. You'll be notified once approved.
            </p>

            {/* Status Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                ⏳ Please wait for admin approval before you can post {pageType === 'room' ? 'rooms' : 'listings'}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Go to Dashboard
            </button>

            {/* Info */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              💡 Usually takes 24-48 hours • Check your email for updates
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED - Verification was rejected
  if (status === 'rejected') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Rejected
            </h3>

            {/* Rejection Reason */}
            {rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Reason:</strong> {rejectionReason}
                </p>
              </div>
            )}

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your verification was not approved. Please review the reason above and submit a new verification request with correct information.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onStartVerification}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform transition hover:scale-105"
              >
                🔄 Submit New Verification
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ← Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUSPENDED - Account suspended
  if (status === 'suspended') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <svg className="h-10 w-10 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Account Suspended
            </h3>

            {/* Suspension Reason */}
            {rejectionReason && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  <strong>Reason:</strong> {rejectionReason}
                </p>
              </div>
            )}

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your posting access has been suspended. Please contact support or submit a new verification request to restore access.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onStartVerification}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform transition hover:scale-105"
              >
                🔄 Resubmit Verification
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ← Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show modal if verified
  return null;
}
