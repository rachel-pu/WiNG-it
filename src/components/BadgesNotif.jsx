import { useState, useEffect } from "react";
import "./BadgeNotif.css";

const BadgeNotification = ({ badges, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!badges || badges.length === 0) return;

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
    }, 350);
  };

  if (!badges || badges.length === 0) return null;

  const badge = badges[currentIndex];

  return (
    <div
      className={`badge-container ${isVisible ? "show" : "hide"}`}
    >
      <div className="badge-card">
        <div className="badge-header">
          <div className="badge-info">
            <span className="badge-icon">{badge.icon}</span>
            <div className="badge-text-group">
              <div className="badge-label">🎉 New Badge Unlocked</div>
              <h3 className="badge-title">{badge.name}</h3>
            </div>
          </div>
          <button className="badge-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <p className="badge-description">{badge.description}</p>

        {badges.length > 1 && (
          <div className="badge-dots">
            {badges.map((_, idx) => (
              <div
                key={idx}
                className={`dot ${idx === currentIndex ? "active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeNotification;
