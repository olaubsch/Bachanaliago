import React, { useState, useEffect } from 'react';
import {Html5QrcodeScanner, Html5QrcodeScanType} from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null); // Opcjonalnie: do wyświetlenia ostatniego wyniku

    const qrScannerId = "qr-reader"; // ID dla kontenera skanera

    useEffect(() => {
        let html5QrcodeScanner;

        if (isScanning) {
            // Inicjalizacja skanera tylko gdy isScanning === true
            html5QrcodeScanner = new Html5QrcodeScanner(
                qrScannerId,
                {
                    fps: 10, // Klatki na sekundę
                    qrbox: { width: 250, height: 250 }, // Rozmiar ramki skanowania (opcjonalnie)
                    // Pamiętaj, aby żądanie uprawnień do kamery odbyło się w bezpiecznym kontekście (HTTPS lub localhost)
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

                // Wywołaj funkcję zwrotną przekazaną przez rodzica
                if (onScanSuccess) {
                    onScanSuccess(decodedText);
                }

                // Ważne: Wyczyszczenie skanera PO sukcesie
                if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2 /* SCANNING */) {
                    html5QrcodeScanner.clear().catch(error => {
                        console.error("Błąd podczas czyszczenia skanera po sukcesie:", error);
                    });
                }
            };

            const handleError = (errorMessage) => {
                // Możesz tu obsłużyć błędy, np. brak kamery, brak uprawnień
                // console.warn(`QR error = ${errorMessage}`); // Odkomentuj dla debugowania
            };

            // Rozpocznij renderowanie i skanowanie
            html5QrcodeScanner.render(handleSuccess, handleError);

        }

        // Funkcja czyszcząca useEffect - wywoływana gdy isScanning zmienia się na false lub komponent jest odmontowywany
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
        // Funkcja czyszcząca w useEffect zajmie się zatrzymaniem kamery
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

            {/* Kontener, w którym biblioteka wyrenderuje podgląd kamery */}
            {isScanning && (
                <div id={qrScannerId} style={{ width: 'auto' }}>
                    {/* Podgląd kamery pojawi się tutaj */}
                </div>
            )}


            {/* Opcjonalnie: Wyświetlanie ostatniego zeskanowanego wyniku */}
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