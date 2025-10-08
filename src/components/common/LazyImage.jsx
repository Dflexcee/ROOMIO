import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component
 *
 * Optimized image loading with Intersection Observer API
 * Only loads images when they enter the viewport
 *
 * Features:
 * - Lazy loading for performance
 * - Blur placeholder while loading
 * - Error handling with fallback
 * - Fade-in animation
 *
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 * @param {string} fallback - Fallback image URL on error
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  fallback = '/default-room.jpg',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, load it
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageSrc(fallback);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${className}`}
      {...props}
    >
      {/* Placeholder skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}
