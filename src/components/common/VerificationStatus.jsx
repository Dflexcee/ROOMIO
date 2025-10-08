import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import config from '../../config/api';

export default function VerificationStatus({ user, onRefresh }) {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
      // Poll every 5 seconds to check for status updates
      const interval = setInterval(fetchVerificationStatus, 5000);
      return () => clearInterval(interval);
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
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (!user?.is_verified || !verificationData) {
      return {
        icon: FaClock,
        color: 'yellow',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        iconColor: 'text-yellow-600',
        title: 'Verification Required',
        message: 'You need to verify your account to post rooms and listings.',
        action: 'Verify Now',
        actionUrl: '/verification'
      };
    }

    if (verificationData.status === 'pending') {
      return {
        icon: FaClock,
        color: 'blue',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200',
        iconColor: 'text-blue-600',
        title: 'Verification Pending',
        message: 'Your verification is under review. Admin will approve soon.',
        action: null
      };
    }

    if (verificationData.status === 'approved') {
      return {
        icon: FaCheckCircle,
        color: 'green',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-200',
        iconColor: 'text-green-600',
        title: 'Verified Account',
        message: 'Your account is verified! You can post rooms and listings.',
        action: null
      };
    }

    if (verificationData.status === 'rejected') {
      return {
        icon: FaTimesCircle,
        color: 'red',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
        iconColor: 'text-red-600',
        title: 'Verification Rejected',
        message: verificationData.admin_message || 'Your verification was rejected. Please submit again with correct information.',
        action: 'Resubmit',
        actionUrl: '/verification'
      };
    }

    if (verificationData.status === 'suspended') {
      return {
        icon: FaBan,
        color: 'orange',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        textColor: 'text-orange-800 dark:text-orange-200',
        iconColor: 'text-orange-600',
        title: 'Account Suspended',
        message: verificationData.admin_message || 'Your account has been suspended. Please contact support or resubmit verification.',
        action: 'Resubmit Verification',
        actionUrl: '/verification'
      };
    }

    return null;
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <StatusIcon className={`${statusConfig.iconColor} text-2xl mt-1 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className={`${statusConfig.textColor} font-bold text-lg mb-1`}>
            {statusConfig.title}
          </h3>
          <p className={`${statusConfig.textColor} text-sm mb-3`}>
            {statusConfig.message}
          </p>
          {statusConfig.action && (
            <button
              onClick={() => navigate(statusConfig.actionUrl)}
              className={`px-4 py-2 bg-${statusConfig.color}-600 hover:bg-${statusConfig.color}-700 text-white rounded-lg text-sm font-semibold transition-colors`}
            >
              {statusConfig.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
