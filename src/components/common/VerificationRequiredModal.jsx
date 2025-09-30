import React from 'react';
import VerificationForm from '../user/VerificationForm';

/**
 * Reusable Modal for Verification Required Messages
 *
 * Shows different messages based on verification status:
 * - unverified: Prompts user to start verification
 * - pending: Shows "waiting for admin approval" message
 * - rejected: Shows rejection reason and allows resubmit
 * - suspended: Shows suspension message with contact support
 *
 * Usage:
 * <VerificationRequiredModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   verificationStatus="unverified"
 *   statusMessage="Your verification was rejected because..."
 *   onVerificationSuccess={() => { handleSuccess(); }}
 * />
 */
export default function VerificationRequiredModal({
  isOpen,
  onClose,
  verificationStatus = 'unverified',
  statusMessage = '',
  onVerificationSuccess
}) {
  const [showVerificationForm, setShowVerificationForm] = React.useState(false);

  if (!isOpen) return null;

  // If verification form is shown, render it
  if (showVerificationForm) {
    return (
      <VerificationForm
        onSuccess={() => {
          setShowVerificationForm(false);
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        }}
        onCancel={() => {
          setShowVerificationForm(false);
          onClose();
        }}
      />
    );
  }

  // Render appropriate message based on status
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in border border-blue-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 text-center">
          🔐 Verification Required
        </h2>

        {/* Content based on status */}
        {verificationStatus === 'pending' && (
          <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 text-lg">
              ⏳ Verification Pending
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-base mb-3">
              Your verification request is being reviewed by our admin team. You'll be notified once it's approved.
            </p>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              <strong>Expected approval time:</strong> Within 48 hours
            </p>
            {statusMessage && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  <strong>Admin Message:</strong> {statusMessage}
                </p>
              </div>
            )}
          </div>
        )}

        {verificationStatus === 'suspended' && (
          <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 text-lg">
              ⏸️ Verification Suspended
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-base mb-3">
              Your verification has been suspended. Please contact our support team for assistance.
            </p>
            {statusMessage && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  <strong>Reason:</strong> {statusMessage}
                </p>
              </div>
            )}
            <div className="mt-4">
              <a
                href="mailto:support@roomio.com"
                className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold transition"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 text-lg">
              ❌ Verification Rejected
            </h3>
            <p className="text-red-700 dark:text-red-400 text-base mb-3">
              Your verification request was rejected. Please review the requirements and submit a new request.
            </p>
            {statusMessage && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  <strong>Reason:</strong> {statusMessage}
                </p>
              </div>
            )}
            <button
              onClick={() => setShowVerificationForm(true)}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
            >
              Submit New Verification Request
            </button>
          </div>
        )}

        {verificationStatus === 'unverified' && (
          <>
            <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 text-lg">
                🔒 Verification Required to Post
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-base mb-4">
                To post listings on our platform, you must complete the verification process. This helps ensure the safety and authenticity of our community.
              </p>

              <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 text-base">
                  📋 What You'll Need:
                </h4>
                <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>For Students:</strong> School ID, Admission Letter, or School Certificate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>For Others:</strong> Government ID (National ID, Driver's License, Passport, or Voter's Card)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>For All:</strong> Clear profile picture, active phone number, NIN (except students)</span>
                  </li>
                </ul>
              </div>

              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 text-base">
                  ✅ Benefits of Verification:
                </h4>
                <ul className="text-green-700 dark:text-green-400 text-sm space-y-1">
                  <li>• Post unlimited listings</li>
                  <li>• Build trust with potential tenants/landlords</li>
                  <li>• Access to premium features</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowVerificationForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                Start Verification Process
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-semibold transition"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}

        {/* Close button for non-unverified states */}
        {verificationStatus !== 'unverified' && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-semibold transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}