import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import DarkModeToggle from '../components/common/DarkModeToggle';
import config from '../config/api';
import VerificationForm from '../components/user/VerificationForm';
import VerificationRequiredModal from '../components/common/VerificationRequiredModal';

export default function PostRoom() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    rent: '',
    gender_preference: '',
    role: '',
    conditions: ''
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [canPost, setCanPost] = useState(true);
  const [postingRestrictionReason, setPostingRestrictionReason] = useState('');

  useEffect(() => {
    if (user) {
      checkVerificationStatus();
      checkAccountStatus();
      checkPostingAccess();
    }
  }, [user]);

  // Do NOT auto-block UI; rely on backend response to enforce verification
  useEffect(() => {
    // Keep status indicators only
  }, [user, verificationStatus]);

  const checkAccountStatus = () => {
    // Check if user account is banned, suspended, or inactive
    if (user.status === 'banned' || user.status === 'suspended' || user.status === 'inactive') {
      console.log('User account status blocked:', user.status);
      // UserStatusCheck component will handle showing the full-screen message
      return false;
    }
    return true;
  };

  const checkPostingAccess = () => {
    if (user && user.can_post_rooms === 0) {
      setCanPost(false);
      setPostingRestrictionReason(user.posting_suspended_reason || 'You do not have permission to post rooms');
    } else {
      setCanPost(true);
      setPostingRestrictionReason('');
    }
  };

  const checkVerificationStatus = async () => {
    try {
      // Check user's verification status from the database
      if (user) {
        // First try to get from user object
        setVerificationStatus(user.verification_status || 'unverified');
        setVerificationMessage(user.status_reason || '');

        // Then try to fetch from API for more detailed info
        try {
          const response = await fetch(config.getUrl(config.endpoints.verification.status), {
            method: 'GET',
            credentials: 'include'
          });
          const data = await response.json();

          if (response.ok && data.success) {
            setVerificationStatus(data.status);
            setVerificationMessage(data.message || user.status_reason || '');
          }
        } catch (apiError) {
          console.log('API not available, using user data');
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus('unverified');
    }
  };

  const handleSubmit = async () => {
    // Check posting access FIRST
    if (!canPost) {
      setError(postingRestrictionReason);
      return;
    }

    // Let backend enforce verification; we'll react to 403/VERIFICATION_REQUIRED

    setError("");
    setSubmitting(true);
    setUploadProgress(0);

    if (!user || !form.title.trim() || !form.rent || !form.location.trim() || !form.gender_preference || !form.role) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('rent', form.rent);
      formData.append('gender_preference', form.gender_preference);
      formData.append('role', form.role);
      formData.append('conditions', form.conditions);

      // Upload images
      for (let i = 0; i < images.length; i++) {
        formData.append('images[]', images[i]);
      }

      const response = await fetch(config.getUrl(config.endpoints.rooms.create), {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const ct = response.headers.get('content-type') || '';
      const bodyText = await response.text();
      const data = ct.includes('application/json') ? (() => { try { return JSON.parse(bodyText); } catch { return { error: bodyText }; } })() : { error: bodyText };

      if (response.ok && data.success) {
        alert('Room posted successfully!');
        setForm({
          title: '',
          description: '',
          location: '',
          rent: '',
          gender_preference: '',
          role: '',
          conditions: ''
        });
        setImages([]);
      } else {
        // If verification required, open modal
        if (response.status === 403 && (data.status_code === 'VERIFICATION_REQUIRED' || (data.error||'').toLowerCase().includes('verify'))) {
          setShowVerificationModal(true);
          setVerificationMessage(data.error || 'Verification required');
        } else if (response.status === 403 && data.status_code === 'POSTING_RESTRICTED') {
          setError(data.reason || data.error || 'Posting restricted');
        } else {
          setError(data.error || 'Failed to post room');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">✍️ Post a Room</h2>

          {/* Verification Status Badge */}
          {verificationStatus && (
            <div className="mb-4 text-center">
              {verificationStatus === 'verified' || verificationStatus === 'approved' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  ✓ Verified Account
                </span>
              ) : verificationStatus === 'pending' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  ⏳ Verification Pending
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  🔒 Verification Required
                </span>
              )}
            </div>
          )}

          {error && <div className="text-red-600 mb-2 text-center">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Room Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Rent (₦)"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={form.gender_preference}
                onChange={(e) => setForm({ ...form, gender_preference: e.target.value })}
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Gender Preference</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="any">Any</option>
              </select>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Your Role</option>
                <option value="tenant">Tenant</option>
                <option value="agent">Agent</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>
            <textarea
              placeholder="Room Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border p-2 w-full mb-3 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              rows={3}
            ></textarea>
            {/* Image Upload Fields - 4 Individual Upload Fields */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Upload Room Images (Up to 4 images)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 flex flex-col items-center justify-center relative" style={{ minHeight: '150px' }}>
                    {images[idx] ? (
                      <>
                        <img
                          src={URL.createObjectURL(images[idx])}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-32 object-cover rounded mb-1"
                        />
                        <button
                          onClick={() => {
                            const newImages = [...images];
                            newImages.splice(idx, 1);
                            setImages(newImages);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <span className="text-3xl mb-1">📷</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Image {idx + 1}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              const newImages = [...images];
                              newImages[idx] = e.target.files[0];
                              setImages(newImages);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Any special conditions?"
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              className="border p-2 w-full mb-4 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              rows={2}
            ></textarea>
            {submitting && (
              <div className="w-full mb-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm mt-1 text-blue-700">{uploadProgress}%</div>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-blue-600 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition text-lg font-semibold w-full disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Room"}
            </button>
        </div>
      </div>

      {/* Verification Required Modal */}
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verificationStatus={verificationStatus}
        statusMessage={verificationMessage}
        onVerificationSuccess={() => {
          setShowVerificationModal(false);
          checkVerificationStatus(); // Refresh status
        }}
      />
    </div>
  );
}
