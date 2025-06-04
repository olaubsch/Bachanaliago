import React, { useState, useEffect } from "react";
import CustomButton from "./ui/CustomButton.jsx";
import styles from "./modules/Konami.module.css";
import { useTranslation } from 'react-i18next';

const KonamiPage = ({ onCodeEntered, onClose }) => {
  const [sequence, setSequence] = useState([]);
  const [touchStart, setTouchStart] = useState(null);

  const minSwipeDistance = 30;
  const { t } = useTranslation();

  // Disable pull-to-refresh on mobile
  useEffect(() => {
    const preventPullToRefresh = (e) => e.preventDefault();
    window.addEventListener("touchmove", preventPullToRefresh, { passive: false });
    return () => window.removeEventListener("touchmove", preventPullToRefresh);
  }, []);

  // Handle keyboard input for desktop
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      let action;
      switch (key) {
        case "ArrowUp":
          action = "up";
          break;
        case "ArrowDown":
          action = "down";
          break;
        case "ArrowLeft":
          action = "left";
          break;
        case "ArrowRight":
          action = "right";
          break;
        case "b":
          action = "b";
          break;
        case "a":
          action = "a";
          break;
        default:
          return;
      }
      setSequence((prev) => [...prev, action].slice(-10));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle touch start for swipe detection
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  // Handle touch end for swipe detection (no tap detection)
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      let direction;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }
      setSequence((prev) => [...prev, direction].slice(-10));
    }
    setTouchStart(null);
  };

  // Check for Konami code
  useEffect(() => {
    if (sequence.length >= 10) {
      const last10 = sequence.slice(-10);
      if (last10.join() === ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"].join()) {
        onCodeEntered();
        setSequence([]);
      }
    }
  }, [sequence, onCodeEntered]);

  return (
      <div
          className={styles.containerKonami}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
      >
          <div className={styles.buttons}>
              <button
                  className={styles.redButton}
                  onClick={() => setSequence((prev) => [...prev, "a"].slice(-10))}
              >
                  A
              </button>
              <button
                  className={styles.blueButton}
                  onClick={() => setSequence((prev) => [...prev, "b"].slice(-10))}
              >
                  B
              </button>
          </div>
          <CustomButton
              onClick={onClose}
          >
              {t('close')}
          </CustomButton>
      </div>
  );
};

export default KonamiPage;