import React, { useState } from 'react';

export default function ViewDetailsModal({ 
  isOpen, 
  onClose, 
  data, 
  onSave, 
  title,
  fields,
  isEditable = false
}) {
  const [editedData, setEditedData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    await onSave(editedData);
    setIsEditing(false);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const renderImageGallery = (images) => {
    if (!images || images.length === 0) {
      return <div className="text-gray-500">No images available</div>;
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square cursor-pointer group"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image}
                alt={`Room image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderField = (field) => {
    const value = getNestedValue(editedData, field.key);
    
    if (field.type === 'images') {
      return renderImageGallery(value);
    }
    
    if (!isEditing) {
      if (Array.isArray(value)) {
        return <div className="text-gray-600">{value.join(', ')}</div>;
      }
      if (typeof value === 'boolean') {
        return <div className="text-gray-600">{value ? 'Yes' : 'No'}</div>;
      }
      if (typeof value === 'object' && value !== null) {
        return <div className="text-gray-600">{JSON.stringify(value, null, 2)}</div>;
      }
      return <div className="text-gray-600">{value || 'N/A'}</div>;
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            disabled={field.disabled}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full p-2 border rounded"
            disabled={field.disabled}
          />
        );
      case 'boolean':
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => handleChange(field.key, e.target.value === 'true')}
            className="w-full p-2 border rounded"
            disabled={field.disabled}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full p-2 border rounded"
            disabled={field.disabled}
          >
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full p-2 border rounded"
            disabled={field.disabled}
          />
        );
    }
  };

  const renderSection = (title, fields) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key} className={field.fullWidth ? "col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );

  // Group fields by section
  const listingFields = fields.filter(f => !f.key.startsWith('users.'));
  const userFields = fields.filter(f => f.key.startsWith('users.'));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderSection('Listing Information', listingFields)}
            {renderSection('Poster Information', userFields)}
          </div>

          {isEditable && (
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setEditedData(data);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Details
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Full size preview"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
} 