import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CustomButton from "./CustomButton.jsx";
import styles from '../ui/uiModules/Alert.module.css';

function Alert({ message, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
    };

    useEffect(() => {
        if (isClosing) {
            const timeout = setTimeout(() => {
                onClose();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isClosing, onClose]);

    return (
        <div className={styles.backdrop}>
            <div className={`${styles.popup_content} ${isClosing ? styles.hide : ''}`}>
                <div className={styles.content}>{message}</div>
                <CustomButton variant={"small"} onClick={handleClose}>OK</CustomButton>
            </div>
        </div>
    );
}

export function showAlert(message) {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleClose = () => {
        root.unmount();
        document.body.removeChild(container);
    };

    root.render(<Alert message={message} onClose={handleClose} />);
}
