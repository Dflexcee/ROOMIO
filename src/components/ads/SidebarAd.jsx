import React, { useState, useEffect } from 'react';
import config from '../../config/api';
import { toAbsoluteImageUrl } from '../../utils/urlHelper';

/**
 * Sidebar Ad Component
 * Displays sidebar ads with click tracking
 */
export default function SidebarAd({ position = 'right' }) {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchSidebarAd();
  }, []);

  const fetchSidebarAd = async () => {
    try {
      const response = await fetch(config.getUrl('/ads/get-ads.php?type=sidebar'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success && data.ads && data.ads.length > 0) {
        setAd(data.ads[0]);
      }
    } catch (error) {
      console.error('Error fetching sidebar ad:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    console.log('🖱️ SIDEBAR AD CLICKED! Ad ID:', ad.id, 'Title:', ad.title);

    // ALWAYS track click
    try {
      console.log('📊 Tracking sidebar click for ad:', ad.id);
      const response = await fetch(config.getUrl('/ads/track-click.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ad_id: ad.id })
      });

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('📈 Sidebar click tracking response:', data);

      if (data.success) {
        console.log('✅ Sidebar click tracked successfully for ad #' + ad.id);
      } else {
        console.error('❌ Sidebar click tracking failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error tracking sidebar ad click:', error);
    }

    // Open link if exists
    if (ad.target_link) {
      console.log('🔗 Opening link:', ad.target_link);
      window.open(ad.target_link, '_blank');
    } else {
      console.log('ℹ️ No target link for this ad');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!ad || dismissed) return null;

  return (
    <div className={`sticky top-20 w-full max-w-xs ${position === 'left' ? 'mr-4' : 'ml-4'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 bg-white dark:bg-gray-800 rounded-full shadow"
          aria-label="Dismiss ad"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Ad Content - Clickable */}
        <div
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleClick}
        >
          {/* Image */}
          {ad.image_url && (
            <img
              src={toAbsoluteImageUrl(ad.image_url)}
              alt={ad.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Text Content */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {ad.description}
              </p>
            )}
            {ad.target_link && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
                <span>Learn More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Ad Label */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Advertisement</p>
        </div>
      </div>
    </div>
  );
}
