import React, { useState, useEffect } from 'react';
import config from '../../config/api';

/**
 * Banner Ad Component
 * Displays banner ads at the top or bottom of pages
 */
export default function BannerAd({ position = 'top' }) {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchBannerAd();
  }, []);

  const fetchBannerAd = async () => {
    try {
      const response = await fetch(config.getUrl('/ads/get-ads.php?type=banner'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success && data.ads && data.ads.length > 0) {
        setAd(data.ads[0]); // Show first banner ad
      }
    } catch (error) {
      console.error('Error fetching banner ad:', error);
    }
  };

  const handleClick = async () => {
    if (ad && ad.target_link) {
      // Track click
      try {
        await fetch(config.getUrl('/ads/track-click.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ad_id: ad.id })
        });
      } catch (error) {
        console.error('Error tracking ad click:', error);
      }

      // Open link
      window.open(ad.target_link, '_blank');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!ad || dismissed) return null;

  return (
    <div className={`relative w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 ${position === 'bottom' ? 'border-t' : 'border-b'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Ad Content */}
          <div
            className="flex-1 flex items-center gap-4 cursor-pointer"
            onClick={handleClick}
          >
            {ad.image_url && (
              <img
                src={ad.image_url.startsWith('http') ? ad.image_url : `http://localhost${ad.image_url}`}
                alt={ad.title}
                className="h-12 w-12 object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {ad.title}
              </h3>
              {ad.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {ad.description}
                </p>
              )}
            </div>
            {ad.target_link && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Learn More →
              </span>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            aria-label="Dismiss ad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
