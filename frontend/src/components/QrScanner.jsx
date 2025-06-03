import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from "./modules/QrScanner.module.css";
import {Html5QrcodeScanner, Html5QrcodeScanType} from 'html5-qrcode';
import { useTranslation } from 'react-i18next';
import CustomButton from "./ui/CustomButton.jsx";

function QrScanner({ taskId, onScanSuccess }) {
    const [showPopup, setShowPopup] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const { t } = useTranslation();
    const qrScannerId = "qr-reader";

    useEffect(() => {
        let html5QrcodeScanner;

        if (showPopup) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                qrScannerId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                },
                false
            );

            const handleSuccess = (decodedText, decodedResult) => {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                setScanResult(decodedText);
                if (onScanSuccess) {
                    onScanSuccess(decodedText, taskId);
                }

                html5QrcodeScanner.clear().catch(err =>
                    console.error("Error clearing after scan:", err)
                );
            };

            const handleError = (errorMessage) => {
                console.warn("QR Scan error:", errorMessage);
            };

            setTimeout(() => {
                html5QrcodeScanner.render(handleSuccess, handleError);
            }, 100);
        }

        return () => {
            if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2) {
                html5QrcodeScanner.clear().catch(error =>
                    console.error("Error in cleanup:", error)
                );
            }
        };
    }, [showPopup]);


    return (
        <>
            <CustomButton width={'100%'} onClick={() => setShowPopup(true)}>
                {t('startScanning')}
            </CustomButton>
            {showPopup && ReactDOM.createPortal(
                <div className={styles.popup_overlay} onClick={() => setShowPopup(false)}>
                    <div className={styles.popup_content} onClick={(e) => e.stopPropagation()}>
                        <div id={qrScannerId} className={styles.scannerContainer} />

                        {scanResult && !showPopup && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <h3>{t('lastScannedCode')}:</h3>
                                <p style={{ wordBreak: 'break-all' }}>{scanResult}</p>
                            </div>
                        )}
                        <div style={{ marginTop: '0.5rem' }}>
                            <CustomButton width={'100%'} onClick={() => setShowPopup(false)}>
                                {t('close')}
                            </CustomButton>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default QrScanner;