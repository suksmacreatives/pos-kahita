import React, { useEffect, useRef, useState } from 'react';
import {
    X,
    Camera,
    Image as ImageIcon,
    Upload,
    ArrowLeft,
    Loader2,
    ScanBarcode,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode';

export default function BarcodeScannerModal({
    open,
    onClose,
    onScan,
}) {
    // =========================================================
    // REFS
    // =========================================================

    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const scannedRef = useRef(false);

    // =========================================================
    // STATE
    // =========================================================

    const [mode, setMode] = useState('menu');

    const [error, setError] = useState('');

    const [isProcessing, setIsProcessing] =
        useState(false);

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [detectedBarcode, setDetectedBarcode] =
        useState('');

    // =========================================================
    // STOP SCANNER
    // =========================================================

    const stopScanner = async () => {
        console.log('=== STOP HTML5-QRCODE ===');

        if (!scannerRef.current) {
            return;
        }

        try {
            const scanner =
                scannerRef.current;

            const state =
                scanner.getState?.();

            /*
             * 2 = SCANNING
             * 3 = PAUSED
             *
             * Hanya stop kalau scanner memang
             * sedang berjalan.
             */
            if (
                state === 2 ||
                state === 3
            ) {
                await scanner.stop();

                console.log(
                    'HTML5-QRCODE BERHASIL STOP'
                );
            }

            try {
                scanner.clear();
            } catch (clearError) {
                console.warn(
                    'Gagal clear scanner:',
                    clearError
                );
            }
        } catch (err) {
            console.warn(
                'Gagal menghentikan scanner:',
                err
            );
        }

        scannerRef.current = null;
    };

    // =========================================================
    // RESET STATE
    // =========================================================

    const resetState = () => {
        setMode('menu');
        setError('');
        setIsProcessing(false);
        setSelectedImage(null);
        setSelectedFile(null);
        setDetectedBarcode('');

        scannedRef.current = false;
    };

    // =========================================================
    // HANDLE SUCCESS
    // =========================================================

    const handleBarcodeSuccess = async (
        decodedText
    ) => {
        if (scannedRef.current) {
            return;
        }

        scannedRef.current = true;

        const barcode =
            String(decodedText || '').trim();

        if (!barcode) {
            scannedRef.current = false;
            return;
        }

        console.log(
            '================================='
        );

        console.log(
            'BARCODE TERDETEKSI:',
            barcode
        );

        console.log(
            '================================='
        );

        setDetectedBarcode(barcode);
        setIsProcessing(true);

        await stopScanner();

        /*
         * Sedikit delay supaya user sempat
         * melihat status barcode berhasil.
         */
        setTimeout(() => {
            onScan(barcode);
        }, 400);
    };

    // =========================================================
    // START CAMERA SCANNER
    // =========================================================

    const startCameraScanner = async () => {
        console.log(
            '================================='
        );

        console.log(
            '=== START HTML5-QRCODE CAMERA ==='
        );

        console.log(
            '================================='
        );

        setError('');
        setDetectedBarcode('');
        setIsProcessing(false);

        scannedRef.current = false;

        try {
            /*
             * Pastikan scanner lama dihentikan.
             */
            await stopScanner();

            /*
             * Pastikan element scanner sudah ada.
             */
            const readerElement =
                document.getElementById(
                    'barcode-reader'
                );

            if (!readerElement) {
                console.error(
                    'Reader element tidak ditemukan'
                );

                setError(
                    'Elemen kamera belum siap. Silakan coba lagi.'
                );

                return;
            }

            console.log(
                'Reader element ditemukan'
            );

            /*
             * Buat instance baru.
             */
            const scanner =
                new Html5Qrcode(
                    'barcode-reader'
                );

            scannerRef.current =
                scanner;

            console.log(
                'Html5Qrcode berhasil dibuat'
            );

            /*
             * Jalankan kamera belakang.
             */
                await scanner.start(
                    {
                        facingMode: 'environment',
                    },
                {
                    fps: 10,

                    /*
                     * Barcode CODE128 berbentuk
                     * horizontal, jadi area scan
                     * dibuat lebih lebar.
                     */
                    qrbox: {
                        width: 320,
                        height: 140,
                    },

                    aspectRatio:
                        1.777778,

                    /*
                     * Kita fokus pada barcode yang
                     * digunakan Kahita.
                     */
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats
                            .CODE_128,
                    ],
                },
                (decodedText) => {
                    handleBarcodeSuccess(
                        decodedText
                    );
                },
                () => {
                    /*
                     * Error decode setiap frame
                     * sengaja tidak ditampilkan.
                     */
                }
            );

            console.log(
                'KAMERA SCANNER BERHASIL START'
            );
        } catch (err) {
            console.error(
                'HTML5-QRCODE CAMERA ERROR:',
                err
            );

            scannerRef.current = null;

            setError(
                'Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan pada browser.'
            );
        }
    };

    // =========================================================
    // OPEN CAMERA MODE
    // =========================================================

    const handleOpenCamera = () => {
        setError('');
        setDetectedBarcode('');
        setIsProcessing(false);

        scannedRef.current = false;

        setMode('camera');
    };

    // =========================================================
    // OPEN UPLOAD MODE
    // =========================================================

    const handleOpenUpload = () => {
        stopScanner();

        setError('');
        setDetectedBarcode('');
        setIsProcessing(false);

        setSelectedImage(null);
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // =========================================================
    // BACK TO MENU
    // =========================================================

    const handleBackToMenu = async () => {
        await stopScanner();

        setMode('menu');

        setError('');
        setIsProcessing(false);
        setDetectedBarcode('');

        scannedRef.current = false;
    };

    // =========================================================
    // FILE SELECTED
    // =========================================================

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        console.log(
            '================================='
        );

        console.log(
            'FOTO BARCODE DIPILIH'
        );

        console.log(
            'Nama:',
            file.name
        );

        console.log(
            'Tipe:',
            file.type
        );

        console.log(
            'Ukuran:',
            file.size
        );

        console.log(
            '================================='
        );

        /*
         * Validasi file.
         */
        if (!file.type.startsWith('image/')) {
            setError(
                'File yang dipilih bukan gambar.'
            );

            return;
        }

        /*
         * Buat preview.
         */
        const imageUrl =
            URL.createObjectURL(file);

        setSelectedFile(file);
        setSelectedImage(imageUrl);

        setDetectedBarcode('');
        setError('');
        setIsProcessing(false);

        setMode('upload-preview');

        /*
         * Reset input supaya foto yang sama
         * tetap bisa dipilih lagi.
         */
        event.target.value = '';
    };

    // =========================================================
// IMAGE PREPROCESSING
// =========================================================

const createProcessedImage = (
    file,
    options = {}
) => {
    return new Promise((resolve, reject) => {
        const {
            scale = 4,
            grayscale = true,
            threshold = false,
            cropX = 0,
            cropY = 0,
            cropWidth = 1,
            cropHeight = 1,
            rotate = 0,
        } = options;

        const image = new Image();

        const objectUrl =
            URL.createObjectURL(file);

        image.onload = () => {
            try {
                const sourceWidth =
                    image.naturalWidth;

                const sourceHeight =
                    image.naturalHeight;

                const sx =
                    sourceWidth * cropX;

                const sy =
                    sourceHeight * cropY;

                const sw =
                    sourceWidth * cropWidth;

                const sh =
                    sourceHeight * cropHeight;

                const radians =
                    (rotate * Math.PI) / 180;

                const absCos =
                    Math.abs(Math.cos(radians));

                const absSin =
                    Math.abs(Math.sin(radians));

                const outputWidth =
                    Math.ceil(
                        sw * absCos +
                        sh * absSin
                    );

                const outputHeight =
                    Math.ceil(
                        sw * absSin +
                        sh * absCos
                    );

                const canvas =
                    document.createElement(
                        'canvas'
                    );

                canvas.width =
                    Math.round(
                        outputWidth * scale
                    );

                canvas.height =
                    Math.round(
                        outputHeight * scale
                    );

                const context =
                    canvas.getContext(
                        '2d',
                        {
                            willReadFrequently:
                                true,
                        }
                    );

                if (!context) {
                    reject(
                        new Error(
                            'Canvas tidak tersedia.'
                        )
                    );

                    return;
                }

                context.imageSmoothingEnabled =
                    false;

                context.save();

                context.translate(
                    canvas.width / 2,
                    canvas.height / 2
                );

                context.rotate(
                    radians
                );

                context.drawImage(
                    image,
                    sx,
                    sy,
                    sw,
                    sh,
                    -(
                        sw *
                        scale
                    ) / 2,
                    -(
                        sh *
                        scale
                    ) / 2,
                    sw * scale,
                    sh * scale
                );

                context.restore();

                const imageData =
                    context.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                const data =
                    imageData.data;

                for (
                    let i = 0;
                    i < data.length;
                    i += 4
                ) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    let gray =
                        0.299 * r +
                        0.587 * g +
                        0.114 * b;

                    if (grayscale) {
                        if (threshold) {
                            gray =
                                gray < 160
                                    ? 0
                                    : 255;
                        }

                        data[i] =
                            gray;

                        data[i + 1] =
                            gray;

                        data[i + 2] =
                            gray;
                    }
                }

                if (
                    grayscale ||
                    threshold
                ) {
                    context.putImageData(
                        imageData,
                        0,
                        0
                    );
                }

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(
                            objectUrl
                        );

                        if (!blob) {
                            reject(
                                new Error(
                                    'Gagal membuat gambar hasil preprocessing.'
                                )
                            );

                            return;
                        }

                        const processedFile =
                            new File(
                                [
                                    blob,
                                ],
                                `barcode-${Date.now()}.png`,
                                {
                                    type: 'image/png',
                                }
                            );

                        resolve(
                            processedFile
                        );
                    },
                    'image/png'
                );
            } catch (error) {
                URL.revokeObjectURL(
                    objectUrl
                );

                reject(error);
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(
                objectUrl
            );

            reject(
                new Error(
                    'Gambar tidak dapat dimuat.'
                )
            );
        };

        image.src =
            objectUrl;
    });
};


// =========================================================
// TRY HTML5-QRCODE ON IMAGE
// =========================================================

const tryDecodeFile = async (
    file,
    label
) => {
    console.log(
        `=== COBA DECODE: ${label} ===`
    );

    const element =
        document.getElementById(
            'barcode-image-reader'
        );

    if (!element) {
        throw new Error(
            'Element barcode-image-reader tidak ditemukan.'
        );
    }

    /*
     * Bersihkan container terlebih dahulu.
     */
    element.innerHTML = '';

    const scanner =
        new Html5Qrcode(
            'barcode-image-reader'
        );

    scannerRef.current =
        scanner;

    try {
        const decodedText =
            await scanner.scanFile(
                file,
                false
            );

        console.log(
            `BERHASIL DECODE [${label}]:`,
            decodedText
        );

        return decodedText;
    } finally {
        try {
            scanner.clear();
        } catch (clearError) {
            console.warn(
                `Gagal clear scanner [${label}]:`,
                clearError
            );
        }

        if (
            scannerRef.current ===
            scanner
        ) {
            scannerRef.current = null;
        }
    }
};


// =========================================================
// DECODE IMAGE
// =========================================================

const decodeImage = async () => {
    if (!selectedFile) {
        setError(
            'Silakan pilih foto barcode terlebih dahulu.'
        );

        return;
    }

    console.log(
        '================================='
    );

    console.log(
        '=== HTML5-QRCODE SMART IMAGE SCAN ==='
    );

    console.log(
        'File:',
        selectedFile.name
    );

    console.log(
        'Ukuran:',
        selectedFile.size
    );

    console.log(
        'Tipe:',
        selectedFile.type
    );

    console.log(
        '================================='
    );

    setIsProcessing(true);
    setError('');
    setDetectedBarcode('');

    scannedRef.current = false;

    try {
        let decodedText = null;

        // =====================================================
        // 1. COBA FILE ASLI
        // =====================================================

        try {
            decodedText =
                await tryDecodeFile(
                    selectedFile,
                    'ORIGINAL'
                );
        } catch (error) {
            console.warn(
                'ORIGINAL gagal:',
                error
            );
        }

        // =====================================================
        // 2. AREA YANG AKAN DIPINDAI
        // =====================================================

        const scanAreas = [
            {
                name: 'FULL',
                x: 0,
                y: 0,
                width: 1,
                height: 1,
            },

            {
                name: 'TOP',
                x: 0,
                y: 0,
                width: 1,
                height: 0.55,
            },

            {
                name: 'MIDDLE',
                x: 0,
                y: 0.22,
                width: 1,
                height: 0.56,
            },

            {
                name: 'BOTTOM',
                x: 0,
                y: 0.45,
                width: 1,
                height: 0.55,
            },

            {
                name: 'LEFT',
                x: 0,
                y: 0.15,
                width: 0.65,
                height: 0.7,
            },

            {
                name: 'RIGHT',
                x: 0.35,
                y: 0.15,
                width: 0.65,
                height: 0.7,
            },
        ];

        // =====================================================
        // 3. VARIASI PEMROSESAN
        // =====================================================

        const processingModes = [
            {
                name: 'UPSCALE',
                scale: 3,
                grayscale: false,
                threshold: false,
                rotate: 0,
            },

            {
                name: 'UPSCALE GRAYSCALE',
                scale: 4,
                grayscale: true,
                threshold: false,
                rotate: 0,
            },

            {
                name: 'UPSCALE THRESHOLD',
                scale: 4,
                grayscale: true,
                threshold: true,
                rotate: 0,
            },

            {
                name: 'ROTATE MINUS 5',
                scale: 4,
                grayscale: true,
                threshold: false,
                rotate: -5,
            },

            {
                name: 'ROTATE PLUS 5',
                scale: 4,
                grayscale: true,
                threshold: false,
                rotate: 5,
            },
        ];

        // =====================================================
        // 4. SCAN SETIAP AREA
        // =====================================================

        for (
            let areaIndex = 0;
            areaIndex <
            scanAreas.length;
            areaIndex++
        ) {
            const area =
                scanAreas[areaIndex];

            console.log(
                `=== AREA ${area.name} ===`
            );

            for (
                let modeIndex = 0;
                modeIndex <
                processingModes.length;
                modeIndex++
            ) {
                const mode =
                    processingModes[
                        modeIndex
                    ];

                if (decodedText) {
                    break;
                }

                const label =
                    `${area.name} + ${mode.name}`;

                console.log(
                    `=== PROSES ${label} ===`
                );

                try {
                    const processedFile =
                        await createProcessedImage(
                            selectedFile,
                            {
                                scale:
                                    mode.scale,

                                grayscale:
                                    mode.grayscale,

                                threshold:
                                    mode.threshold,

                                cropX:
                                    area.x,

                                cropY:
                                    area.y,

                                cropWidth:
                                    area.width,

                                cropHeight:
                                    area.height,

                                rotate:
                                    mode.rotate,
                            }
                        );

                    decodedText =
                        await tryDecodeFile(
                            processedFile,
                            label
                        );

                    if (
                        decodedText
                    ) {
                        console.log(
                            '================================='
                        );

                        console.log(
                            'BARCODE BERHASIL DITEMUKAN'
                        );

                        console.log(
                            'MODE:',
                            label
                        );

                        console.log(
                            'BARCODE:',
                            decodedText
                        );

                        console.log(
                            '================================='
                        );

                        break;
                    }
                } catch (error) {
                    console.warn(
                        `${label} gagal:`,
                        error
                    );
                }
            }

            if (decodedText) {
                break;
            }
        }

        // =====================================================
        // 5. HASIL BERHASIL
        // =====================================================

        if (decodedText) {
            scannedRef.current =
                true;

            setDetectedBarcode(
                decodedText
            );

            setIsProcessing(
                false
            );

            setTimeout(() => {
                onScan(
                    decodedText
                );
            }, 500);

            return;
        }

        // =====================================================
        // 6. SEMUA GAGAL
        // =====================================================

        console.warn(
            '================================='
        );

        console.warn(
            'SEMUA METODE SCAN GAGAL'
        );

        console.warn(
            '================================='
        );

        setIsProcessing(
            false
        );

        setError(
            'Barcode belum berhasil dibaca. Coba gunakan foto yang lebih dekat dan pastikan garis barcode terlihat jelas.'
        );
    } catch (error) {
        console.error(
            'SMART IMAGE SCAN ERROR:',
            error
        );

        setIsProcessing(
            false
        );

        setError(
            'Foto tidak dapat diproses. Silakan gunakan foto lain.'
        );
    } finally {
        scannerRef.current =
            null;

        const element =
            document.getElementById(
                'barcode-image-reader'
            );

        if (element) {
            element.innerHTML =
                '';
        }
    }
};

    // =========================================================
    // CHOOSE ANOTHER PHOTO
    // =========================================================

    const handleChooseAnotherPhoto = () => {
        setError('');
        setDetectedBarcode('');
        setIsProcessing(false);

        setSelectedImage(null);
        setSelectedFile(null);

        scannedRef.current = false;

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // =========================================================
    // CAMERA RETRY
    // =========================================================

    const handleRetryCamera = async () => {
        setError('');
        setDetectedBarcode('');
        setIsProcessing(false);

        scannedRef.current = false;

        await stopScanner();

        setTimeout(() => {
            startCameraScanner();
        }, 300);
    };

    // =========================================================
    // EFFECT: START CAMERA
    // =========================================================

    useEffect(() => {
        if (!open) {
            return;
        }

        if (mode !== 'camera') {
            return;
        }

        /*
         * Tunggu sampai DOM benar-benar
         * memiliki #barcode-reader.
         */
        const timer = setTimeout(() => {
            startCameraScanner();
        }, 250);

        return () => {
            clearTimeout(timer);
        };
    }, [open, mode]);

    // =========================================================
    // EFFECT: CLOSE / CLEANUP
    // =========================================================

    useEffect(() => {
        if (!open) {
            stopScanner();

            resetState();

            return;
        }

        return () => {
            stopScanner();
        };
    }, [open]);

    // =========================================================
    // NOT OPEN
    // =========================================================

    if (!open) {
        return null;
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">

                    <div className="flex items-center gap-3">

                        {mode !== 'menu' ? (
                            <button
                                type="button"
                                onClick={
                                    handleBackToMenu
                                }
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#009664]/10 text-[#009664] flex items-center justify-center">
                                <ScanBarcode className="w-5 h-5" />
                            </div>
                        )}

                        <div>

                            <h3 className="font-black text-slate-800">
                                {mode === 'menu' &&
                                    'Scan Barcode'}

                                {mode === 'camera' &&
                                    'Scan dengan Kamera'}

                                {mode ===
                                    'upload-preview' &&
                                    'Upload Foto Barcode'}
                            </h3>

                            <p className="text-xs text-slate-400 mt-0.5">

                                {mode === 'menu' &&
                                    'Pilih metode scan barcode'}

                                {mode === 'camera' &&
                                    'Arahkan kamera ke barcode'}

                                {mode ===
                                    'upload-preview' &&
                                    'Gunakan foto yang berisi barcode'}

                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            await stopScanner();
                            onClose();
                        }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>

                {/* =================================================
                    MENU
                ================================================= */}

                {mode === 'menu' && (
                    <div className="p-5">

                        <div className="mb-5">

                            <p className="text-sm font-semibold text-slate-700">
                                Pilih metode scan
                            </p>

                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Gunakan kamera secara langsung
                                atau upload foto barcode jika
                                barcode sulit terbaca.
                            </p>

                        </div>

                        <div className="space-y-3">

                            {/* CAMERA */}

                            <button
                                type="button"
                                onClick={
                                    handleOpenCamera
                                }
                                className="w-full text-left group"
                            >

                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-[#009664]/40 hover:bg-[#009664]/5 transition">

                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#009664]/10 text-[#009664] flex items-center justify-center group-hover:bg-[#009664]/15 transition">

                                        <Camera className="w-6 h-6" />

                                    </div>

                                    <div className="flex-1 min-w-0">

                                        <div className="font-bold text-slate-800">
                                            Scan dengan Kamera
                                        </div>

                                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Arahkan kamera langsung
                                            ke barcode produk.
                                        </div>

                                    </div>

                                    <div className="text-slate-300 group-hover:text-[#009664] transition text-lg">
                                        →
                                    </div>

                                </div>

                            </button>

                            {/* UPLOAD */}

                            <button
                                type="button"
                                onClick={
                                    handleOpenUpload
                                }
                                className="w-full text-left group"
                            >

                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-[#009664]/40 hover:bg-[#009664]/5 transition">

                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-[#009664]/10 group-hover:text-[#009664] transition">

                                        <ImageIcon className="w-6 h-6" />

                                    </div>

                                    <div className="flex-1 min-w-0">

                                        <div className="font-bold text-slate-800">
                                            Upload Foto Barcode
                                        </div>

                                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Pilih foto barcode dari
                                            komputer atau perangkat.
                                        </div>

                                    </div>

                                    <div className="text-slate-300 group-hover:text-[#009664] transition text-lg">
                                        →
                                    </div>

                                </div>

                            </button>

                        </div>

                        <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">

                            <ScanBarcode className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />

                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Untuk hasil terbaik, pastikan
                                barcode terlihat penuh, fokus,
                                dan memiliki pencahayaan yang cukup.
                            </p>

                        </div>

                    </div>
                )}

                {/* =================================================
                    CAMERA
                ================================================= */}

                {mode === 'camera' && (
                    <div>

                        <div className="relative bg-black">

                            {/* HTML5 QRCODE CONTAINER */}

                            <div
                                id="barcode-reader"
                                className="w-full overflow-hidden bg-black"
                            />

                            {/* SCAN FRAME */}

                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                                <div className="relative w-[320px] h-[140px]">

                                    {/* TOP LEFT */}

                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00d48a] rounded-tl-xl" />

                                    {/* TOP RIGHT */}

                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00d48a] rounded-tr-xl" />

                                    {/* BOTTOM LEFT */}

                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00d48a] rounded-bl-xl" />

                                    {/* BOTTOM RIGHT */}

                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00d48a] rounded-br-xl" />

                                    {!detectedBarcode &&
                                        !error && (
                                            <div className="absolute left-3 right-3 top-1/2 h-[2px] bg-[#00d48a] shadow-[0_0_10px_#00d48a] animate-pulse" />
                                        )}

                                </div>

                            </div>

                            {/* DETECTED */}

                            {detectedBarcode && (
                                <div className="absolute left-4 right-4 bottom-4">

                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/95 backdrop-blur shadow-xl">

                                        <CheckCircle2 className="w-5 h-5 text-[#009664] shrink-0" />

                                        <div className="min-w-0">

                                            <div className="text-[10px] uppercase tracking-wide font-bold text-[#009664]">
                                                Barcode ditemukan
                                            </div>

                                            <div className="text-sm font-mono font-bold text-slate-800 truncate">
                                                {detectedBarcode}
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* CAMERA FOOTER */}

                        <div className="px-5 py-5">

                            {error ? (
                                <div>

                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">

                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />

                                        <div>

                                            <div className="text-sm font-bold text-red-600">
                                                Kamera bermasalah
                                            </div>

                                            <p className="text-xs text-red-500/80 mt-1 leading-relaxed">
                                                {error}
                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            handleRetryCamera
                                        }
                                        className="w-full mt-3 h-11 rounded-xl bg-[#009664] text-white text-sm font-bold hover:bg-[#007f54] transition flex items-center justify-center gap-2"
                                    >

                                        <RefreshCw className="w-4 h-4" />

                                        Coba Lagi

                                    </button>

                                </div>
                            ) : detectedBarcode ? (
                                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#009664]">

                                    <CheckCircle2 className="w-4 h-4" />

                                    Barcode berhasil dibaca

                                </div>
                            ) : (
                                <div className="text-center">

                                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">

                                        <Loader2 className="w-4 h-4 animate-spin text-[#009664]" />

                                        Mencari barcode...

                                    </div>

                                    <p className="text-xs text-slate-400 mt-2">
                                        Posisikan barcode di dalam
                                        kotak scan.
                                    </p>

                                </div>
                            )}

                        </div>

                    </div>
                )}

                {/* =================================================
                    UPLOAD PREVIEW
                ================================================= */}

                {mode === 'upload-preview' && (
                    <div>

                        {/* IMAGE PREVIEW */}

                        <div className="relative bg-slate-100 min-h-[280px] max-h-[380px] flex items-center justify-center p-4 overflow-hidden">

                            {selectedImage ? (
                                <div className="relative max-w-full max-h-[350px]">

                                    <img
                                        src={
                                            selectedImage
                                        }
                                        alt="Preview barcode"
                                        className="max-w-full max-h-[350px] object-contain rounded-xl shadow-sm"
                                    />

                                    {isProcessing && (
                                        <div className="absolute inset-0 rounded-xl bg-black/45 flex items-center justify-center">

                                            <div className="bg-white rounded-2xl px-5 py-4 shadow-xl text-center">

                                                <Loader2 className="w-7 h-7 mx-auto text-[#009664] animate-spin" />

                                                <div className="text-sm font-bold text-slate-800 mt-2">
                                                    Mencari barcode...
                                                </div>

                                                <div className="text-xs text-slate-400 mt-1">
                                                    Sedang membaca foto
                                                </div>

                                            </div>

                                        </div>
                                    )}

                                    {detectedBarcode && (
                                        <div className="absolute left-3 right-3 bottom-3">

                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/95 backdrop-blur shadow-xl">

                                                <CheckCircle2 className="w-5 h-5 text-[#009664] shrink-0" />

                                                <div className="min-w-0">

                                                    <div className="text-[10px] uppercase tracking-wide font-bold text-[#009664]">
                                                        Barcode ditemukan
                                                    </div>

                                                    <div className="text-sm font-mono font-bold text-slate-800 truncate">
                                                        {detectedBarcode}
                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="text-center">

                                    <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />

                                    <p className="text-sm text-slate-400 mt-3">
                                        Belum ada foto
                                    </p>

                                </div>
                            )}

                        </div>

                        {/* FOOTER */}

                        <div className="px-5 py-5">

                            {error && (
                                <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">

                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />

                                    <div>

                                        <div className="text-sm font-bold text-red-600">
                                            Barcode tidak ditemukan
                                        </div>

                                        <p className="text-xs text-red-500/80 mt-1 leading-relaxed">
                                            {error}
                                        </p>

                                    </div>

                                </div>
                            )}

                            <div className="space-y-2">

                                {/* SCAN PHOTO */}

                                <button
                                    type="button"
                                    onClick={
                                        decodeImage
                                    }
                                    disabled={
                                        !selectedFile ||
                                        isProcessing ||
                                        !!detectedBarcode
                                    }
                                    className="w-full h-11 rounded-xl bg-[#009664] text-white text-sm font-bold hover:bg-[#007f54] disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                                >

                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />

                                            Memproses Foto...
                                        </>
                                    ) : detectedBarcode ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />

                                            Barcode Ditemukan
                                        </>
                                    ) : (
                                        <>
                                            <ScanBarcode className="w-4 h-4" />

                                            Scan Foto
                                        </>
                                    )}

                                </button>

                                {/* SECONDARY ACTIONS */}

                                <div className="grid grid-cols-2 gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            handleChooseAnotherPhoto
                                        }
                                        disabled={
                                            isProcessing
                                        }
                                        className="h-10 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                    >

                                        <Upload className="w-4 h-4" />

                                        Foto Lain

                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleOpenCamera
                                        }
                                        disabled={
                                            isProcessing
                                        }
                                        className="h-10 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                    >

                                        <Camera className="w-4 h-4" />

                                        Kamera

                                    </button>

                                </div>

                            </div>

                            {/* INFO */}

                            <div className="mt-4 flex items-start gap-2">

                                <ScanBarcode className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />

                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Gunakan foto dengan barcode
                                    yang terlihat penuh, fokus,
                                    tidak miring berlebihan, dan
                                    memiliki pencahayaan yang cukup.
                                </p>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    HIDDEN IMAGE SCANNER
                ================================================= */}

                <div
                    id="barcode-image-reader"
                    className="hidden"
                />

                {/* =================================================
                    HIDDEN FILE INPUT
                ================================================= */}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={
                        handleFileChange
                    }
                />

            </div>

        </div>
    );
}