import React, { useState, useEffect } from 'react';

export default function UserStatusMessage({ userStatus, statusReason, statusChangedAt }) {
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 hours in seconds

  useEffect(() => {
    if (userStatus === 'suspended') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [userStatus]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (userStatus === 'banned') {
    return (
      <div className="fixed inset-0 bg-red-600 text-white flex items-center justify-center z-50">
        <div className="text-center max-w-2xl px-6">
          <h1 className="text-4xl font-bold mb-4">🚫 Account Banned</h1>
          <p className="text-xl mb-4">Your account has been banned and cannot be accessed.</p>
          {statusReason && (
            <div className="bg-red-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Reason for Ban:</h3>
              <p className="text-red-100">{statusReason}</p>
            </div>
          )}
          {statusChangedAt && (
            <p className="text-sm text-red-200 mb-4">
              Banned on: {new Date(statusChangedAt).toLocaleString()}
            </p>
          )}
          <p className="text-lg">Contact support for more information.</p>
        </div>
      </div>
    );
  }

  if (userStatus === 'suspended') {
    return (
      <div className="fixed inset-0 bg-yellow-500 text-white flex items-center justify-center z-50">
        <div className="text-center max-w-2xl px-6">
          <h1 className="text-4xl font-bold mb-4">⏰ Account Suspended</h1>
          <p className="text-xl mb-4">Your account has been suspended temporarily.</p>
          {statusReason && (
            <div className="bg-yellow-600 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Reason for Suspension:</h3>
              <p className="text-yellow-100">{statusReason}</p>
            </div>
          )}
          {statusChangedAt && (
            <p className="text-sm text-yellow-200 mb-4">
              Suspended on: {new Date(statusChangedAt).toLocaleString()}
            </p>
          )}
          <p className="text-lg mb-2">Your account will be restored in:</p>
          <div className="text-6xl font-bold mt-4 text-yellow-200">
            {formatTime(timeLeft)}
          </div>
          <p className="text-lg mt-4">Please wait for the countdown to complete.</p>
        </div>
      </div>
    );
  }

  if (userStatus === 'inactive') {
    return (
      <div className="fixed inset-0 bg-gray-600 text-white flex items-center justify-center z-50">
        <div className="text-center max-w-2xl px-6">
          <h1 className="text-4xl font-bold mb-4">⏸️ Account Deactivated</h1>
          <p className="text-xl mb-4">Your account has been deactivated and cannot be accessed.</p>
          {statusReason && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Reason for Deactivation:</h3>
              <p className="text-gray-100">{statusReason}</p>
            </div>
          )}
          {statusChangedAt && (
            <p className="text-sm text-gray-200 mb-4">
              Deactivated on: {new Date(statusChangedAt).toLocaleString()}
            </p>
          )}
          <p className="text-lg">Contact support to reactivate your account.</p>
        </div>
      </div>
    );
  }

  return null;
}
