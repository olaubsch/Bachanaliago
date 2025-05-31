import React, { useState, useEffect } from 'react';
import styles from "./modules/QrScanner.module.css";
import {Html5QrcodeScanner, Html5QrcodeScanType} from 'html5-qrcode';
import { useTranslation } from 'react-i18next';

function QrScanner({ taskId, onScanSuccess }) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null); // Opcjonalnie: do wyświetlenia ostatniego wyniku
    const { t } = useTranslation();
    const qrScannerId = "qr-reader"; // ID dla kontenera skanera

    useEffect(() => {
        let html5QrcodeScanner;

        if (isScanning) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                qrScannerId,
                {
                    fps: 10, // Klatki na sekundę
                    qrbox: { width: 250, height: 250 }, // Rozmiar ramki skanowania (opcjonalnie)
                    rememberLastUsedCamera: true, // Spróbuj użyć ostatnio używanej kamery
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_CAMERA
                    ],
                },
                /* verbose= */ false // Ustaw na true dla dodatkowych logów
            );

            const handleSuccess = (decodedText, decodedResult) => {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                setScanResult(decodedText); // Zapisz lokalnie wynik (opcjonalne)
                setIsScanning(false);      // Zatrzymaj stan skanowania w UI

                if (onScanSuccess) {
                    onScanSuccess(decodedText, taskId);
                }

                if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2 /* SCANNING */) {
                    html5QrcodeScanner.clear().catch(error => {
                        console.error("Błąd podczas czyszczenia skanera po sukcesie:", error);
                    });
                }
            };

            const handleError = (errorMessage) => {
                console.error("Błąd skanowania QR:", errorMessage);
                // Opcjonalnie: możesz wyświetlić jakiś komunikat użytkownikowi
            };

            html5QrcodeScanner.render(handleSuccess, handleError);
        }

        return () => {
            if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2 /* SCANNING */) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Błąd podczas czyszczenia skanera w cleanup:", error);
                });
            }
        };
    }, [isScanning, onScanSuccess]); // Zależności useEffect

    const handleStartScan = () => {
        setScanResult(null); // Wyczyść poprzedni wynik przed nowym skanowaniem
        setIsScanning(true);
    };

    const handleStopScan = () => {
        setIsScanning(false);
    };


    return (
        <div className={styles.qrScannerContainer} style={{ textAlign: 'center' }}>
            <button
                onClick={isScanning ? handleStopScan : handleStartScan}
                className={styles.qrButton}
                style={{ borderRadius: !isScanning ? '0.5rem' : '0.5rem 0.5rem 0 0' }}
            >
                {isScanning ? t('stopScanning') : t('startScanning')}
            </button>

            {/* Kontener, w którym biblioteka wyrenderuje podgląd kamery */}
            {isScanning && (
                <div id={qrScannerId} className={styles.scannerContainer}>
                    {/* Podgląd kamery pojawi się tutaj */}
                </div>
            )}


            {/* Opcjonalnie: Wyświetlanie ostatniego zeskanowanego wyniku */}
            {scanResult && !isScanning && (
                <div style={{ marginTop: '20px' }}>
                    <h3>{t('lastScannedCode')}:</h3>
                    <p style={{ wordBreak: 'break-all' }}>{scanResult}</p>
                </div>
            )}
        </div>
    );
}

export default QrScanner;