import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/api.js';

export default function VerificationForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    account_type: 'tenant',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    profile_picture: null,
    government_id_type: '',
    government_id_number: '',
    government_id_image: null,
    nin: '',
    school_id_type: '',
    school_id_number: '',
    school_id_image: null,
    school_name: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadFile = async (file, type) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', user.id);
    formData.append('type', type);
    
    const response = await fetch(config.getUrl(config.endpoints.upload.avatar), {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.image_url;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.full_name || !formData.phone) {
        throw new Error('Full name and phone are required');
      }

      if (formData.account_type === 'student') {
        if (!formData.school_id_type || !formData.school_id_number || !formData.school_id_image) {
          throw new Error('School ID information is required for students');
        }
      } else {
        if (!formData.government_id_type || !formData.government_id_number || !formData.government_id_image) {
          throw new Error('Government ID information is required');
        }
        if (!formData.nin) {
          throw new Error('NIN is required');
        }
      }

      setUploading(true);

      // Upload files
      const uploads = {};
      if (formData.profile_picture) {
        uploads.profile_picture = await uploadFile(formData.profile_picture, 'profile');
      }
      if (formData.government_id_image) {
        uploads.government_id_image = await uploadFile(formData.government_id_image, 'government_id');
      }
      if (formData.school_id_image) {
        uploads.school_id_image = await uploadFile(formData.school_id_image, 'school_id');
      }

      setUploading(false);

      // Prepare data without file objects
      const submitData = {
        account_type: formData.account_type,
        full_name: formData.full_name,
        phone: formData.phone,
        government_id_type: formData.government_id_type,
        government_id_number: formData.government_id_number,
        nin: formData.nin,
        school_id_type: formData.school_id_type,
        school_id_number: formData.school_id_number,
        school_name: formData.school_name,
        ...uploads // Add uploaded image URLs
      };

      // Submit verification request
      const response = await fetch(config.getUrl(config.endpoints.verification.submit), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server error: Invalid response format. Please check the console for details.');
      }

      const data = await response.json();

      if (response.ok) {
        alert('Verification request submitted successfully! You will be notified once reviewed.');
        onSuccess && onSuccess();
      } else {
        throw new Error(data.error || 'Failed to submit verification request');
      }
    } catch (error) {
      console.error('Verification submission error:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const isStudent = formData.account_type === 'student';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔐 Account Verification</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Why Verification is Required</h3>
            <p className="text-blue-700 text-sm">
              To ensure the safety and authenticity of our platform, all users must be verified before posting listings. 
              This helps prevent fraud and builds trust in our community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type *
              </label>
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="tenant">Tenant</option>
                <option value="student">Student</option>
                <option value="landlord">Landlord</option>
                <option value="agent">Agent</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+234-123-456-7890"
                required
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clear Profile Picture *
              </label>
              <input
                type="file"
                name="profile_picture"
                onChange={handleInputChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must match your ID and be clear</p>
            </div>

            {!isStudent ? (
              <>
                {/* Government ID Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID Type *
                  </label>
                  <select
                    name="government_id_type"
                    value={formData.government_id_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="national_id">National ID</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="passport">Passport</option>
                    <option value="voters_card">Voter's Card</option>
                  </select>
                </div>

                {/* Government ID Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID Number *
                  </label>
                  <input
                    type="text"
                    name="government_id_number"
                    value={formData.government_id_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Government ID Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID Image *
                  </label>
                  <input
                    type="file"
                    name="government_id_image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* NIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIN (National Identification Number) *
                  </label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345678901"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* School Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* School ID Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School ID Type *
                  </label>
                  <select
                    name="school_id_type"
                    value={formData.school_id_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="student_id">Student ID</option>
                    <option value="admission_letter">Admission Letter</option>
                    <option value="school_certificate">School Certificate</option>
                  </select>
                </div>

                {/* School ID Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School ID Number *
                  </label>
                  <input
                    type="text"
                    name="school_id_number"
                    value={formData.school_id_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* School ID Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School ID Image *
                  </label>
                  <input
                    type="file"
                    name="school_id_image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
