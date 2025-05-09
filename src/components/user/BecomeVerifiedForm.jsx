import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

export default function BecomeVerifiedForm({ userId, onSuccess }) {
  const [role, setRole] = useState("landlord");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current verification status
    const checkVerificationStatus = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('verification_status')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setVerificationStatus(data.verification_status);
      }
    };

    checkVerificationStatus();
  }, [userId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }

      setFile(selectedFile);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload an ID image");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Upload file to Supabase Storage
      const filename = `verification-${userId}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("user-ids")
        .upload(filename, file);

      if (uploadError) throw new Error("Failed to upload ID image");

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("user-ids")
        .getPublicUrl(filename);

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          account_type: role,
          verification_status: "pending",
          verification_id_url: publicUrl.publicUrl,
          verification_submitted_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) throw new Error("Failed to update profile");

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setVerificationStatus("pending");
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show verification status if pending or approved
  if (verificationStatus === "pending" || verificationStatus === "approved") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
        <div className="text-center">
          {verificationStatus === "pending" ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Pending</h2>
              <p className="text-gray-600 mb-4">
                Your verification request is being reviewed. This usually takes 1-2 business days.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">What happens next?</span>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Our team will review your submitted ID</li>
                    <li>You'll receive an email notification once verified</li>
                    <li>You can start posting rooms after verification</li>
                  </ul>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Approved!</h2>
              <p className="text-gray-600 mb-4">
                Your account has been verified. You can now post rooms and access all features.
              </p>
            </>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your verification request has been submitted successfully. Our team will review your ID and get back to you within 1-2 business days.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">What happens next?</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Our team will review your submitted ID</li>
                <li>You'll receive an email notification once verified</li>
                <li>You can start posting rooms after verification</li>
              </ul>
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show the form if no verification status or not pending/approved
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Become a Verified Poster</h2>
        <p className="text-gray-600 mt-2">
          Upload your government-issued ID to verify your identity
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Your Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="landlord">Landlord</option>
            <option value="agent">Agent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Government ID
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="ID Preview"
                    className="mx-auto h-32 w-auto object-contain"
                  />
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${loading || !file 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit for Verification'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your verification request will be reviewed by our team. This usually takes 1-2 business days.
        </p>
      </div>
    </div>
  );
} 