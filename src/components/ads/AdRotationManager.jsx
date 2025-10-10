import React, { useState, useEffect } from 'react';
import config from '../../config/api';
import PopupAd from './PopupAd';

/**
 * Ad Rotation Manager
 * Handles displaying multiple popup ads in sequence
 * Supports 100s of ads with smart rotation
 */
export default function AdRotationManager() {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 0 && !showAd) {
      // Show first ad after component mounts
      const timer = setTimeout(() => {
        setShowAd(true);
      }, 2000); // Wait 2 seconds before showing first ad

      return () => clearTimeout(timer);
    }
  }, [ads]);

  const fetchAds = async () => {
    try {
      // Request up to 10 popup ads (you can adjust this)
      const response = await fetch(config.getUrl('/ads/get-ads.php?type=popup&limit=10'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success && data.ads && data.ads.length > 0) {
        setAds(data.ads);
        console.log(`📢 Ad Rotation: Loaded ${data.ads.length} popup ads`);
      }
    } catch (error) {
      console.error('Error fetching popup ads:', error);
    }
  };

  const handleAdClosed = () => {
    setShowAd(false);

    // If there are more ads in the queue, show the next one
    if (currentAdIndex < ads.length - 1) {
      const nextIndex = currentAdIndex + 1;
      const nextAd = ads[nextIndex];
      const waitTime = (nextAd.display_interval_hours || 0) * 1000; // Convert to milliseconds or use immediate

      setTimeout(() => {
        setCurrentAdIndex(nextIndex);
        setShowAd(true);
        console.log(`📢 Ad Rotation: Showing ad ${nextIndex + 1} of ${ads.length}`);
      }, Math.max(waitTime, 3000)); // Minimum 3 seconds between ads
    }
  };

  if (!showAd || ads.length === 0 || currentAdIndex >= ads.length) {
    return null;
  }

  return (
    <PopupAd
      ad={ads[currentAdIndex]}
      onClose={handleAdClosed}
    />
  );
}
