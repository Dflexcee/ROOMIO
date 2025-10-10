import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import DarkModeToggle from '../components/common/DarkModeToggle';
import config from '../config/api';
import { useCurrency } from '../contexts/CurrencyContext';
import FormInput from '../components/common/FormInput';
import FormTextArea from '../components/common/FormTextArea';
import FormSelect from '../components/common/FormSelect';
import Alert from '../components/common/Alert';
import LoadingButton from '../components/common/LoadingButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditListing() {
  const { currency } = useCurrency();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'land',
    title: '',
    description: '',
    price: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    specifications: ''
  });
  const [images, setImages] = useState([null, null, null, null, null]); // 5 images
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null]);
  const [existingImages, setExistingImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchListingData();
  }, [id]);

  const fetchListingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(config.getUrl(config.endpoints.listings.mine), {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        const listing = data.listings?.find(l => l.id === parseInt(id));
        if (listing) {
          setForm({
            type: listing.type || 'land',
            title: listing.title || '',
            description: listing.description || '',
            price: listing.price || '',
            location: listing.location || '',
            contact_phone: listing.contact_phone || '',
            contact_email: listing.contact_email || '',
            specifications: listing.specifications || ''
          });

          // Load existing images
          if (Array.isArray(listing.images) && listing.images.length > 0) {
            setExistingImages(listing.images);
            const previews = [...listing.images];
            while (previews.length < 5) previews.push(null);
            setImagePreviews(previews.slice(0, 5));
          }
        } else {
          setError('Listing not found');
        }
      } else {
        setError(data.error || 'Failed to fetch listing');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index, file) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Determine final images
      const finalImageUrls = [];

      // Process each slot
      for (let i = 0; i < 5; i++) {
        if (images[i]) {
          // New image uploaded - upload it
          const formData = new FormData();
          formData.append('image', images[i]);

          const uploadResponse = await fetch(config.getUrl('/upload/listing-image.php'), {
            method: 'POST',
            credentials: 'include',
            body: formData
          });

          const uploadData = await uploadResponse.json();
          if (uploadResponse.ok && uploadData.image_url) {
            finalImageUrls.push(uploadData.image_url);
          } else {
            throw new Error(uploadData.error || 'Failed to upload image');
          }
        } else if (imagePreviews[i]) {
          // Existing image (preview is a URL string, not a data URL)
          finalImageUrls.push(imagePreviews[i]);
        }
      }

      // Validate at least 3 images
      if (finalImageUrls.length < 3) {
        setError('Please keep at least 3 images');
        setSubmitting(false);
        return;
      }

      // Update listing
      const listingData = {
        id: parseInt(id),
        ...form,
        images: finalImageUrls
      };

      const response = await fetch(config.getUrl(config.endpoints.listings.update), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(listingData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Listing updated successfully! It has been sent for approval.');

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/my-listings');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update listing');
      }
    } catch (err) {
      setError('Network error. Please try again: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <div className="pt-16">
          <div className="flex-1 flex items-center justify-center p-4">
            <LoadingSpinner size="md" message="Loading listing..." />
          </div>
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
      <div className="pt-16">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">
            ✏️ Edit Listing
          </h2>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} onClose={() => setSuccess('')} />

          <form onSubmit={handleSubmit}>
            {/* Listing Type */}
            <FormSelect
              label="Listing Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'land', label: 'Land' },
                { value: 'house', label: 'House' },
                { value: 'car', label: 'Car' },
                { value: 'other', label: 'Other Property' }
              ]}
              required
              className="mb-4"
            />

            {/* Title */}
            <FormInput
              label="Title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., 3 Bedroom Apartment in Lekki"
              required
              className="mb-4"
            />

            {/* Description */}
            <FormTextArea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe your listing..."
              required
              className="mb-4"
            />

            {/* Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormInput
                label={`Price (${currency.currency_symbol})`}
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Enter price"
                required
              />
              <FormInput
                label="Location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Lekki, Lagos"
                required
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormInput
                label="Contact Phone"
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                required
              />
              <FormInput
                label="Contact Email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                required
              />
            </div>

            {/* Specifications */}
            <FormTextArea
              label="Specifications (Optional)"
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              rows={3}
              placeholder="Additional details, features, etc."
              className="mb-4"
            />

            {/* 5 Image Upload Fields */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Update Images * (Minimum 3 images required)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 flex flex-col items-center justify-center relative"
                    style={{ minHeight: '180px' }}
                  >
                    {imagePreviews[index] ? (
                      <>
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <span className="text-4xl mb-2">📷</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Image {index + 1}
                          {index < 3 && <span className="text-red-500">*</span>}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(index, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * First 3 images are required. You can add up to 5 images total. Maximum 5MB per image.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-600 transition text-lg font-semibold"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={submitting}
                loadingText="Updating..."
                variant="primary"
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 dark:from-blue-700 dark:to-purple-700 text-lg"
              >
                Update Listing
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
