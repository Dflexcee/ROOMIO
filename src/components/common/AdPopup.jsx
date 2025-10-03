import React, { useState, useEffect } from 'react';
import config from '../../config/api';

export default function AdPopup() {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchAd();
  }, []);

  const fetchAd = async () => {
    try {
      const response = await fetch(config.getUrl('/ads/get-popup.php'), {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.ad) {
        setAd(data.ad);
        // Delay showing popup by 2 seconds for better UX
        setTimeout(() => setShow(true), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch ad:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    // Track click
    try {
      await fetch(config.getUrl('/ads/track-click.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ad_id: ad.id })
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }

    // Open link if exists
    if (ad.target_link) {
      window.open(ad.target_link, '_blank', 'noopener,noreferrer');
    }

    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!ad || !show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition shadow-lg z-10 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>

        {/* Ad Image */}
        <div
          className="cursor-pointer"
          onClick={handleClick}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
        </div>

        {/* Ad Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {ad.title}
          </h3>
          {ad.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {ad.description}
            </p>
          )}

          {ad.target_link && (
            <button
              onClick={handleClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
            >
              Learn More →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}