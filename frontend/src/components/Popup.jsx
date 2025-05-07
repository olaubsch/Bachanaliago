import React from "react";
import ReactDOM from "react-dom";
import styles from "./modules/Popup.module.css"; // We'll create small popup-specific CSS

function Popup({ title, children, onClose }) {
    return ReactDOM.createPortal(
        <div className={styles.popupOverlay} onClick={onClose}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                {title && <h2 className={styles.popupTitle}>{title}</h2>}
                <div className={styles.popupBody}>
                    {children}
                </div>
                <button className={styles.closeButton} onClick={onClose}>
                    Zamknij
                </button>
            </div>
        </div>,
        document.body // <-- bardzo ważne: wrzuca popup na najwyższy poziom DOM
    );
}


export default Popup;
