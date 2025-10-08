# Reusable Components Guide

This guide shows you how to use the new reusable components throughout your Roomio application.

## 📦 Available Components

1. **FormInput** - Text/email/number inputs with labels and validation
2. **FormTextArea** - Textarea fields with labels and validation
3. **FormSelect** - Dropdown selects with options
4. **Alert** - Success/error/warning/info messages
5. **LoadingSpinner** - Loading indicators
6. **LoadingButton** - Buttons with loading states
7. **Modal** - Full-screen modals/dialogs
8. **ConfirmDialog** - Confirmation dialogs

---

## 🎯 Usage Examples

### 1. FormInput

**Before (Old Code):**
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Email *
  </label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg..."
    placeholder="Enter email"
    required
  />
</div>
```

**After (New Component):**
```jsx
import FormInput from '../components/common/FormInput';

<FormInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter email"
  required
  error={errors.email}  // Optional error message
/>
```

---

### 2. FormTextArea

**Before:**
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Description
  </label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full p-3 border border-gray-300..."
    rows={4}
  />
</div>
```

**After:**
```jsx
import FormTextArea from '../components/common/FormTextArea';

<FormTextArea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  placeholder="Enter description"
  error={errors.description}
/>
```

---

### 3. FormSelect

**Before:**
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Gender
  </label>
  <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full p-3 border..."
  >
    <option value="">Select...</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select>
</div>
```

**After:**
```jsx
import FormSelect from '../components/common/FormSelect';

<FormSelect
  label="Gender"
  value={gender}
  onChange={(e) => setGender(e.target.value)}
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ]}
  placeholder="Select gender"
  required
  error={errors.gender}
/>
```

---

### 4. Alert

**Before:**
```jsx
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    {error}
  </div>
)}

{success && (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
    {success}
  </div>
)}
```

**After:**
```jsx
import Alert from '../components/common/Alert';

<Alert type="error" message={error} onClose={() => setError('')} />
<Alert type="success" message={success} onClose={() => setSuccess('')} />
<Alert type="warning" message="Please verify your email" />
<Alert type="info" message="Your profile is incomplete" />
```

---

### 5. LoadingSpinner

**Before:**
```jsx
<div className="text-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
</div>
```

**After:**
```jsx
import LoadingSpinner from '../components/common/LoadingSpinner';

<LoadingSpinner />  {/* Default: medium size, centered */}
<LoadingSpinner size="sm" message="Please wait..." />
<LoadingSpinner size="lg" message="Loading rooms..." centered={false} />
```

---

### 6. LoadingButton

**Before:**
```jsx
<button
  disabled={loading}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-60"
>
  {loading ? (
    <>
      <svg className="animate-spin...">...</svg>
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</button>
```

**After:**
```jsx
import LoadingButton from '../components/common/LoadingButton';

<LoadingButton
  loading={submitting}
  loadingText="Submitting..."
  onClick={handleSubmit}
  variant="primary"
>
  Submit
</LoadingButton>

{/* Different variants */}
<LoadingButton variant="danger" loading={deleting}>Delete</LoadingButton>
<LoadingButton variant="success" loading={saving}>Save</LoadingButton>
<LoadingButton variant="secondary" loading={loading}>Cancel</LoadingButton>
```

---

### 7. Modal

**Before:**
```jsx
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold">Modal Title</h3>
        <button onClick={() => setShowModal(false)}>×</button>
      </div>
      <div className="p-6">
        {/* Content */}
      </div>
    </div>
  </div>
)}
```

**After:**
```jsx
import Modal from '../components/common/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Room Details"
  size="lg"
>
  {/* Your content here */}
  <p>Room information goes here...</p>
</Modal>

{/* Different sizes */}
<Modal size="sm">Small modal</Modal>
<Modal size="md">Medium modal</Modal>
<Modal size="lg">Large modal</Modal>
<Modal size="xl">Extra large modal</Modal>
<Modal size="full">Full width modal</Modal>
```

---

### 8. ConfirmDialog

**Before:**
```jsx
{showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
      <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Are you sure you want to delete this room?
      </p>
      <div className="flex gap-3">
        <button onClick={() => setShowConfirm(false)}>Cancel</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  </div>
)}
```

**After:**
```jsx
import ConfirmDialog from '../components/common/ConfirmDialog';

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Confirm Delete"
  message="Are you sure you want to delete this room? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  loading={deleting}
/>

{/* Different variants */}
<ConfirmDialog variant="primary" confirmText="Approve" />
<ConfirmDialog variant="success" confirmText="Publish" />
<ConfirmDialog variant="danger" confirmText="Delete" />
```

---

## 💡 Complete Example: Before & After

### Before (Messy, Repetitive)

```jsx
import React, { useState } from 'react';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    // ... submit logic
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg..."
          rows={4}
        />
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
```

### After (Clean, Reusable)

```jsx
import React, { useState } from 'react';
import FormInput from '../components/common/FormInput';
import FormTextArea from '../components/common/FormTextArea';
import LoadingButton from '../components/common/LoadingButton';
import Alert from '../components/common/Alert';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    // ... submit logic
  };

  return (
    <div>
      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <FormInput
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        required
      />

      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      <FormTextArea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell us about yourself"
        rows={4}
      />

      <LoadingButton
        loading={loading}
        loadingText="Saving..."
        onClick={handleSubmit}
        variant="primary"
      >
        Save Profile
      </LoadingButton>
    </div>
  );
}
```

**Result:** 40+ lines reduced to 20 lines, more maintainable, consistent UI!

---

## 🎨 Customization

All components accept `className` prop for additional styling:

```jsx
<FormInput className="mb-4" />
<Alert className="fixed top-4 right-4" />
<LoadingButton className="w-full" />
```

---

## ✅ Benefits

1. **Consistency** - All forms look the same across the app
2. **Less Code** - Reduce repetitive code by 30-40%
3. **Easier Maintenance** - Fix bugs in one place
4. **Dark Mode** - Built-in dark mode support
5. **Accessibility** - Proper labels and ARIA attributes
6. **Validation** - Built-in error message display

---

## 📚 Next Steps

Start replacing old code with these components in your pages! Focus on:
1. Form pages (ProfileEdit, PostRoom, PostListing, etc.)
2. Admin pages (Users, Listings, etc.)
3. Modal dialogs

Happy coding! 🚀
