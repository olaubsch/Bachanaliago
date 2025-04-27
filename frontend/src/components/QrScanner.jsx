import React, { useState, useEffect } from 'react';
import {Html5QrcodeScanner, Html5QrcodeScanType} from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    const qrScannerId = "qr-reader";

    useEffect(() => {
        let html5QrcodeScanner;

        if (isScanning) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                qrScannerId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_CAMERA
                    ],
                },
                false
            );

            const handleSuccess = (decodedText, decodedResult) => {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                setScanResult(decodedText); // Zapisz lokalnie wynik (opcjonalne)
                setIsScanning(false);      // Zatrzymaj stan skanowania w UI

                if (onScanSuccess) {
                    onScanSuccess(decodedText);
                }

                if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2 /* SCANNING */) {
                    html5QrcodeScanner.clear().catch(error => {
                        console.error("Błąd podczas czyszczenia skanera po sukcesie:", error);
                    });
                }
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
    }, [isScanning, onScanSuccess]);

    const handleStartScan = () => {
        setScanResult(null);
        setIsScanning(true);
    };

    const handleStopScan = () => {
        setIsScanning(false);
    };


    return (
        <div className="qr-scanner-container" style={{ textAlign: 'center' }}>
            {!isScanning ? (
                <button onClick={handleStartScan} style={{ cursor: 'pointer' }}>
                    Rozpocznij Skanowanie
                </button>
            ) : (
                <button onClick={handleStopScan} style={{ cursor: 'pointer', marginTop: '10px' }}>
                    Zatrzymaj Skanowanie
                </button>
            )}

            {isScanning && (
                <div id={qrScannerId} style={{width: 'auto'}}>
                </div>
            )}

            {scanResult && !isScanning && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Ostatni zeskanowany kod:</h3>
                    <p style={{ wordBreak: 'break-all' }}>{scanResult}</p>
                </div>
            )}
        </div>
    );
}

export default QrScanner;