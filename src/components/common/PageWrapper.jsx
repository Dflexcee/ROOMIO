import React from 'react';

export default function PageWrapper({ children, fullWidth = false }) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'p-8 max-w-7xl mx-auto'}`}>
      {children}
    </div>
  );
} 