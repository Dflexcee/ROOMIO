import React, { useState, useEffect } from 'react';
import config from '../../config/api';
import { toAbsoluteImageUrl } from '../../utils/urlHelper';

/**
 * Popup Ad Component
 * Shows popup ads with skip button after specified seconds
 * Can be used standalone or with AdRotationManager
 */
export default function PopupAd({ ad: propAd, onClose }) {
  const [ad, setAd] = useState(propAd || null);
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (propAd) {
      setAd(propAd);
      setCountdown(propAd.skip_after_seconds || 3);
      setCanSkip(propAd.skip_after_seconds === 0);
    } else {
      fetchPopupAd();
    }
  }, [propAd]);

  useEffect(() => {
    if (ad && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          setCanSkip(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, ad]);

  const fetchPopupAd = async () => {
    try {
      const response = await fetch(config.getUrl('/ads/get-ads.php?type=popup'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success && data.ads && data.ads.length > 0) {
        const popupAd = data.ads[0];
        setAd(popupAd);
        setCountdown(popupAd.skip_after_seconds || 3);
        setCanSkip(popupAd.skip_after_seconds === 0);
      }
    } catch (error) {
      console.error('Error fetching popup ad:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    console.log('🖱️ POPUP AD CLICKED! Ad ID:', ad.id, 'Title:', ad.title);

    // ALWAYS track click, even if no target_link
    try {
      console.log('📊 Tracking popup click for ad:', ad.id);
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
      console.log('📈 Popup click tracking response:', data);

      if (data.success) {
        console.log('✅ Popup click tracked successfully for ad #' + ad.id);
      } else {
        console.error('❌ Popup click tracking failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error tracking popup ad click:', error);
    }

    // Open link if exists
    if (ad.target_link) {
      console.log('🔗 Opening link:', ad.target_link);
      window.open(ad.target_link, '_blank');
    } else {
      console.log('ℹ️ No target link for this ad');
    }
  };

  const handleSkip = () => {
    setDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  if (!ad || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Skip Button */}
        {canSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Skip Ad
          </button>
        )}

        {/* Countdown Timer */}
        {!canSkip && countdown > 0 && (
          <div className="absolute top-4 right-4 z-10 bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Skip in {countdown}s
          </div>
        )}

        {/* Ad Content - ENTIRE POPUP IS CLICKABLE */}
        <div
          className="cursor-pointer hover:opacity-95 transition-opacity active:scale-[0.99]"
          onClick={handleClick}
          title="Click to view ad"
        >
          {/* Image */}
          {ad.image_url && (
            <div className="relative">
              <img
                src={toAbsoluteImageUrl(ad.image_url)}
                alt={ad.title}
                className="w-full h-64 sm:h-80 object-cover"
                onError={(e) => {
                  e.target.src = '/default-ad.jpg';
                  e.target.onerror = null;
                }}
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}

          {/* Text Content */}
          <div className={`p-6 ${!ad.image_url ? 'py-16' : ''}`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {ad.title}
            </h2>
            {ad.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                {ad.description}
              </p>
            )}
            {ad.target_link && (
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                  Learn More
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ad Label */}
        <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          Advertisement
        </div>
      </div>
    </div>
  );
}
