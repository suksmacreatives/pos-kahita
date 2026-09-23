import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScannerModal({
    open,
    onClose,
    onScan,
}) {
    const scannerRef = useRef(null);
    const isScanningRef = useRef(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;

        let mounted = true;

        const startScanner = async () => {
            setError('');

            try {
                const scanner = new Html5Qrcode('barcode-reader');

                scannerRef.current = scanner;
                isScanningRef.current = true;

                await scanner.start(
                    {
                        facingMode: 'environment',
                    },
                    {
                        fps: 10,
                        qrbox: {
                            width: 280,
                            height: 140,
                        },
                        aspectRatio: 1.777778,
                    },
                    async (decodedText) => {
                        if (!mounted || !isScanningRef.current) {
                            return;
                        }

                        isScanningRef.current = false;

                        try {
                            await scanner.stop();
                        } catch (e) {
                            console.warn(
                                'Scanner stop:',
                                e
                            );
                        }

                        scanner.clear();

                        scannerRef.current = null;

                        onScan(decodedText);
                    },
                    () => {
                        // Error scan frame diabaikan.
                        // Jangan tampilkan error setiap frame.
                    }
                );
            } catch (err) {
                console.error(
                    'Barcode scanner error:',
                    err
                );

                if (mounted) {
                    setError(
                        'Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan.'
                    );
                }
            }
        };

        const timer = setTimeout(() => {
            startScanner();
        }, 150);

        return () => {
            mounted = false;
            clearTimeout(timer);

            const scanner = scannerRef.current;

            if (scanner) {
                scanner.stop()
                    .catch(() => {})
                    .finally(() => {
                        try {
                            scanner.clear();
                        } catch (e) {}

                        scannerRef.current = null;
                        isScanningRef.current = false;
                    });
            }
        };
    }, [open, onScan]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-[#009664]/10 text-[#009664] flex items-center justify-center">
                            <Camera className="w-5 h-5" />
                        </div>

                        <div>
                            <h3 className="font-black text-slate-800">
                                Scan Barcode
                            </h3>

                            <p className="text-xs text-slate-400 mt-0.5">
                                Arahkan kamera ke barcode produk
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>


                {/* CAMERA */}
                <div className="relative bg-black">

                    <div
                        id="barcode-reader"
                        className="w-full"
                    />

                    {/* SCAN FRAME */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                        <div className="relative w-[280px] h-[140px] border-2 border-[#00b879] rounded-xl">

                            {/* CORNER */}
                            <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-[#00d48a] rounded-tl-lg" />

                            <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-[#00d48a] rounded-tr-lg" />

                            <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-[#00d48a] rounded-bl-lg" />

                            <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-[#00d48a] rounded-br-lg" />

                            {/* SCAN LINE */}
                            <div className="absolute left-2 right-2 top-1/2 h-[2px] bg-[#00d48a] shadow-[0_0_8px_#00d48a]" />

                        </div>

                    </div>

                </div>


                {/* FOOTER */}
                <div className="px-5 py-5">

                    {error ? (
                        <div className="text-center">

                            <div className="text-sm font-semibold text-red-500">
                                {error}
                            </div>

                            <p className="text-xs text-slate-400 mt-2">
                                Izinkan akses kamera pada browser,
                                kemudian coba lagi.
                            </p>

                        </div>
                    ) : (
                        <div className="text-center">

                            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">

                                <Loader2 className="w-4 h-4 animate-spin text-[#009664]" />

                                Mencari barcode...

                            </div>

                            <p className="text-xs text-slate-400 mt-2">
                                Pastikan barcode berada di dalam kotak
                                scan.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}