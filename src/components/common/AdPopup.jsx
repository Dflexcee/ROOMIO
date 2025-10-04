import React, { useState, useEffect } from 'react';
import config from '../../config/api';

export default function AdPopup() {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    fetchAd();
  }, []);

  useEffect(() => {
    if (!ad || !show) return;

    const displayDuration = parseInt(ad.display_duration) || 5;
    const skipAfter = parseInt(ad.skip_after_seconds) || 3;

    // Set initial countdown
    setCountdown(displayDuration);

    // Show skip button after specified seconds
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, skipAfter * 1000);

    // Auto-close after display duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, displayDuration * 1000);

    // Countdown interval
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(closeTimer);
      clearInterval(countdownInterval);
    };
  }, [ad, show]);

  const fetchAd = async () => {
    try {
      const response = await fetch(config.getUrl('/ads/get-popup.php'), {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.ad) {
        // Check if we should show this ad based on interval
        const lastShown = localStorage.getItem(`ad_last_shown_${data.ad.id}`);
        const intervalHours = parseInt(data.ad.display_interval_hours) || 24;

        if (lastShown) {
          const hoursSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
          if (hoursSinceLastShown < intervalHours) {
            console.log(`Ad ${data.ad.id} shown ${hoursSinceLastShown.toFixed(1)} hours ago, waiting ${intervalHours} hours`);
            return;
          }
        }

        setAd(data.ad);
        // Delay showing popup by 2 seconds for better UX
        setTimeout(() => setShow(true), 2000);

        // Mark ad as shown
        localStorage.setItem(`ad_last_shown_${data.ad.id}`, Date.now().toString());
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
    setShowSkip(false);
  };

  if (!ad || !show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full relative animate-scale-in">
        {/* Skip Button - Shows after skip_after_seconds */}
        {showSkip && (
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-yellow-600 transition shadow-lg z-10 text-sm font-bold"
            aria-label="Skip"
          >
            Skip
          </button>
        )}

        {/* Countdown Timer */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          {countdown}s
        </div>

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