
import React, { useState, useEffect } from 'react';

const BadgeNotification = ({ badges, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!badges || badges.length === 0) return;

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentIndex < badges.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsVisible(true);
      } else {
        onClose();
      }
    }, 300);
  };

  if (!badges || badges.length === 0) return null;

  const currentBadge = badges[currentIndex];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-6 min-w-[320px] max-w-[400px] border-2 border-yellow-300">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{currentBadge.icon}</span>
            <div>
              <div className="text-white font-bold text-sm mb-1">
                🎉 NEW BADGE UNLOCKED!
              </div>
              <h3 className="text-white font-bold text-xl">
                {currentBadge.name}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="text-white text-sm mt-2 opacity-90">
          {currentBadge.description}
        </p>
        {badges.length > 1 && (
          <div className="mt-3 flex gap-1 justify-center">
            {badges.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white opacity-40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
