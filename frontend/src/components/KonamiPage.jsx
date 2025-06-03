import React, { useState, useEffect } from "react";

const KonamiPage = ({ onCodeEntered, onClose }) => {
  const [sequence, setSequence] = useState([]);
  const [touchStart, setTouchStart] = useState(null);

  const minSwipeDistance = 30;

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
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        position: "relative",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
        }}
        onClick={onClose}
      >
        Close
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <button
          style={{
            fontSize: "24px",
            padding: "10px 20px",
            margin: "0 10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
          onClick={() => setSequence((prev) => [...prev, "a"].slice(-10))}
        >
          A
        </button>
        <button
          style={{
            fontSize: "24px",
            padding: "10px 20px",
            margin: "0 10px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
          onClick={() => setSequence((prev) => [...prev, "b"].slice(-10))}
        >
          B
        </button>
      </div>
    </div>
  );
};

export default KonamiPage;