import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import Navbar from '../components/common/Navbar';
import DarkModeToggle from '../components/common/DarkModeToggle';
import config from '../config/api';
import VerificationBlockModal from '../components/common/VerificationBlockModal';
import VerificationFormNew from '../components/user/VerificationFormNew';
import FormInput from '../components/common/FormInput';
import FormTextArea from '../components/common/FormTextArea';
import FormSelect from '../components/common/FormSelect';
import Alert from '../components/common/Alert';
import LoadingButton from '../components/common/LoadingButton';

export default function PostRoom() {
  const { user } = useAuth();
  const { currency } = useCurrency();
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
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  useEffect(() => {
    if (user) {
      checkVerificationAndAccess();
    }
  }, [user]);

  const checkVerificationAndAccess = async () => {
    if (!user) return;

    // Admins and managers bypass verification
    if (user.role === 'admin' || user.role === 'manager') {
      setIsBlocked(false);
      return;
    }

    try {
      // Fetch user data to get verification status
      const response = await fetch(config.getUrl(config.endpoints.auth.me), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;

        // Block if not verified OR can't post rooms
        const userIsVerified = userData.is_verified === 1 && userData.verification_status === 'verified';

        if (!userIsVerified || userData.can_post_rooms === 0) {
          setIsBlocked(true);

          // Determine verification status
          const status = userData.verification_status || 'pending';
          setVerificationStatus(status);

          // Fetch verification details to get admin message
          try {
            const verifyResponse = await fetch(config.getUrl('/verification/status.php'), {
              credentials: 'include'
            });
            const verifyData = await verifyResponse.json();
            if (verifyData.success && verifyData.verification) {
              // Set status from verification data (more accurate)
              setVerificationStatus(verifyData.verification.status || status);

              // Get admin message if exists
              if (verifyData.verification.admin_message) {
                setRejectionReason(verifyData.verification.admin_message);
              }
            }
          } catch (err) {
            console.error('Error fetching verification details:', err);
          }
        } else {
          setIsBlocked(false);
        }
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      // Default to blocking if we can't verify
      setIsBlocked(true);
      setVerificationStatus(user.verification_status || 'pending');
    }
  };

  const handleStartVerification = () => {
    setShowVerificationForm(true);
  };

  const handleVerificationSubmitted = () => {
    setShowVerificationForm(false);
    setVerificationStatus('pending');
    checkVerificationAndAccess();
  };

  const handleSubmit = async () => {
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
        setError(data.error || 'Failed to post room');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Show blocking modal if user is not verified
  if (isBlocked && !showVerificationForm) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <VerificationBlockModal
          status={verificationStatus}
          onStartVerification={handleStartVerification}
          rejectionReason={rejectionReason}
          pageType="room"
        />
      </div>
    );
  }

  // Show verification form when user clicks "Verify Now"
  if (showVerificationForm) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <VerificationFormNew onSuccess={handleVerificationSubmitted} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">✍️ Post a Room</h2>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormInput
                type="text"
                placeholder="Room Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <FormInput
                type="number"
                placeholder={`Rent (${currency.currency_symbol})`}
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <FormSelect
                value={form.gender_preference}
                onChange={(e) => setForm({ ...form, gender_preference: e.target.value })}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'any', label: 'Any' }
                ]}
                placeholder="Gender Preference"
              />
              <FormSelect
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={[
                  { value: 'tenant', label: 'Tenant' },
                  { value: 'agent', label: 'Agent' },
                  { value: 'landlord', label: 'Landlord' }
                ]}
                placeholder="Your Role"
              />
            </div>
            <FormTextArea
              placeholder="Room Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mb-3"
              rows={3}
            />
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
            <FormTextArea
              placeholder="Any special conditions?"
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              className="mb-4"
              rows={2}
            />
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
            <LoadingButton
              onClick={handleSubmit}
              loading={submitting}
              loadingText="Submitting..."
              variant="primary"
              className="bg-gradient-to-r from-green-500 to-blue-600 dark:from-blue-700 dark:to-purple-700 w-full text-lg"
            >
              Submit Room
            </LoadingButton>
        </div>
      </div>
    </div>
  );
}
