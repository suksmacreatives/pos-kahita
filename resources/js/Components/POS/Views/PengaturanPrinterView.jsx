import React, { useState } from 'react';

export default function PengaturanPrinterView() {
    const [printerConfig, setPrinterConfig] = useState({ jenis: 'Thermal 58mm', koneksi: 'Bluetooth' });
    const [isScanning, setIsScanning] = useState(false);
    const [printers, setPrinters] = useState([]);
    const [activePrinter, setActivePrinter] = useState(null);

    const handleScan = () => {
        setIsScanning(true);
        setPrinters([]);
        setTimeout(() => {
            setPrinters([
                { id: 'PRN-5801', name: 'RPP02N (Thermal Bluetooth Kasir)', status: 'Sinyal Kuat' },
                { id: 'ZJ-5809', name: 'Zjiang MP-58R Mobile Printer', status: 'Siap' },
            ]);
            setIsScanning(false);
        }, 1000);
    };

    return (
        <div className="flex-1 bg-[#f4f6f9] p-5 text-xs font-semibold text-gray-600">
            <div className="max-w-2xl bg-white border border-gray-200 rounded-l p-6 shadow-sm space-y-5">

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Ukuran Gulungan Kertas</label>
                        <select value={printerConfig.jenis} onChange={(e) => setPrinterConfig({...printerConfig, jenis: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2 rounded-l font-bold text-gray-800 focus:outline-none">
                            <option>Thermal 58mm</option>
                            <option>Thermal 80mm</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Media Transmisi</label>
                        <select value={printerConfig.koneksi} onChange={(e) => setPrinterConfig({...printerConfig, koneksi: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2 rounded-l font-bold text-gray-800 focus:outline-none">
                            <option>Bluetooth</option>
                            <option>USB / Kabel</option>
                        </select>
                    </div>
                </div>

                <button onClick={handleScan} disabled={isScanning} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-l uppercase text-[11px] transition">
                    {isScanning ? '⏳ Menyeken Mesin Sekitar...' : '🔍 Pindai Printer Terdekat'}
                </button>

                <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Hasil Pemindaian:</span>
                    <div className="border border-gray-100 bg-gray-50 rounded-l divide-y divide-gray-100 overflow-hidden">
                        {printers.map(p => (
                            <div key={p.id} className="p-3 bg-white flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{p.name}</p>
                                    <span className="text-[10px] text-emerald-600 font-bold">● {p.status}</span>
                                </div>
                                <button onClick={() => setActivePrinter(p)} className="bg-gray-100 hover:bg-emerald-600 hover:text-white font-bold px-3 py-1.5 rounded-l transition">
                                    Sambungkan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {activePrinter && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-l flex items-center justify-between">
                        <p className="font-black text-gray-800 text-xs">🟢 Terhubung ke: {activePrinter.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
}