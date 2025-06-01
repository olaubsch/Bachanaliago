import React from 'react';
import styles from './uiModules/ToggleSwitch.module.css'; // adjust the path as needed

const ToggleSwitch = ({
                          leftLabel = "Left",
                          rightLabel = "Right",
                          isLeftActive,
                          onToggle
                      }) => {
    return (
        <div className={styles.toggleContainer}>
            <div
                className={`${styles.toggleButton} ${isLeftActive ? styles.active : ""}`}
                onClick={() => onToggle(true)}
            >
                {leftLabel}
            </div>
            <div
                className={`${styles.toggleButton} ${!isLeftActive ? styles.active : ""}`}
                onClick={() => onToggle(false)}
            >
                {rightLabel}
            </div>
        </div>
    );
};

export default ToggleSwitch;
