import React, { useState, useEffect } from "react";

export default function PengaturanPrinterView() {

    const [printerConfig, setPrinterConfig] = useState({
        jenis: localStorage.getItem("printer_size") || "Thermal 58mm",
        koneksi: localStorage.getItem("printer_connection") || "Bluetooth",
    });

    const [printers, setPrinters] = useState([]);
    const [activePrinter, setActivePrinter] = useState(null);

    const [newPrinter, setNewPrinter] = useState({
        name: "",
        address: "",
    });

    useEffect(() => {
        const savedPrinters =
            JSON.parse(localStorage.getItem("printer_list")) || [];

        const savedActive =
            JSON.parse(localStorage.getItem("active_printer"));

        setPrinters(savedPrinters);

        if (savedActive) {
            setActivePrinter(savedActive);
        }
    }, []);

    const savePrinters = (list) => {
        localStorage.setItem(
            "printer_list",
            JSON.stringify(list)
        );
    };

    const handleSaveConfig = () => {
        localStorage.setItem(
            "printer_size",
            printerConfig.jenis
        );

        localStorage.setItem(
            "printer_connection",
            printerConfig.koneksi
        );

        alert("Pengaturan berhasil disimpan");
    };

    const addPrinter = () => {

        if (!newPrinter.name.trim()) {
            alert("Nama printer wajib diisi");
            return;
        }

        const printer = {
            id: Date.now(),
            name: newPrinter.name,
            address: newPrinter.address,
            connection: printerConfig.koneksi,
        };

        const updated = [...printers, printer];

        setPrinters(updated);
        savePrinters(updated);

        setNewPrinter({
            name: "",
            address: "",
        });
    };

    const removePrinter = (id) => {

        const updated = printers.filter(
            (item) => item.id !== id
        );

        setPrinters(updated);

        savePrinters(updated);

        if (activePrinter?.id === id) {
            localStorage.removeItem("active_printer");
            setActivePrinter(null);
        }
    };

    const selectPrinter = (printer) => {

        setActivePrinter(printer);

        localStorage.setItem(
            "active_printer",
            JSON.stringify(printer)
        );
    };

    const disconnectPrinter = () => {

        localStorage.removeItem("active_printer");

        setActivePrinter(null);
    };

    const testPrint = () => {

        if (!activePrinter) {
            alert("Pilih printer terlebih dahulu");
            return;
        }

        const iframe =
            document.createElement("iframe");

        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";

        document.body.appendChild(iframe);

        const doc =
            iframe.contentWindow.document;

        doc.write(`
            <html>
            <head>
                <style>
                    body{
                        width:${printerConfig.jenis === "Thermal 58mm"
                ? "58mm"
                : "80mm"
            };
                        font-family:monospace;
                        text-align:center;
                        font-size:12px;
                    }

                    h3{
                        margin:0;
                    }
                </style>
            </head>

            <body>

                <h3>KAHITA BUSANA</h3>

                <p>TEST PRINT</p>

                <hr>

                <p>${activePrinter.name}</p>

                <p>${new Date().toLocaleString(
                "id-ID"
            )}</p>

            </body>
            </html>
        `);

        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };

    return (
        <div className="flex-1 bg-[#f7f8fa] p-6 overflow-y-auto">
<div className="max-w-7xl mx-auto space-y-5">

    <h1 className="text-xl font-bold text-slate-800">
        Pengaturan Printer
    </h1>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-xl border border-slate-200 p-5">

            <h3 className="font-semibold text-slate-800 mb-4">
                Printer Aktif
            </h3>

            {activePrinter ? (
                <>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-emerald-600 font-medium">
                            Terhubung
                        </span>
                    </div>

                    <div className="font-semibold text-slate-800">
                        {activePrinter.name}
                    </div>

                    <div className="text-sm text-slate-500">
                        {activePrinter.address}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">

                        <button
                            onClick={testPrint}
                            className="bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg"
                        >
                            Test Print
                        </button>

                        <button
                            onClick={disconnectPrinter}
                            className="border border-slate-300 hover:bg-slate-100 py-2 rounded-lg"
                        >
                            Putuskan
                        </button>

                    </div>
                </>
            ) : (
                <div className="text-slate-400">
                    Belum ada printer aktif
                </div>
            )}

        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">

            <h3 className="font-semibold text-slate-800 mb-4">
                Tambah Printer
            </h3>

            <div className="space-y-3">

                <input
                    placeholder="Nama Printer"
                    value={newPrinter.name}
                    onChange={(e) =>
                        setNewPrinter({
                            ...newPrinter,
                            name: e.target.value
                        })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />

                <input
                    placeholder="MAC Address / IP Address"
                    value={newPrinter.address}
                    onChange={(e) =>
                        setNewPrinter({
                            ...newPrinter,
                            address: e.target.value
                        })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />

                <button
                    onClick={addPrinter}
                    className="w-full bg-slate-800 text-white py-2 rounded-lg"
                >
                    Tambah Printer
                </button>

            </div>

        </div>

    </div>

    <div className="bg-white rounded-xl border border-slate-200 p-5">

        <h3 className="font-semibold text-slate-800 mb-4">
            Daftar Printer
        </h3>

        <div className="space-y-2">

            {printers.map((printer) => (

                <div
                    key={printer.id}
                    className="border border-slate-200 rounded-lg p-4 flex justify-between items-center"
                >

                    <div>
                        <div className="font-medium">
                            {printer.name}
                        </div>

                        <div className="text-sm text-slate-500">
                            {printer.connection}
                        </div>

                        <div className="text-xs text-slate-400">
                            {printer.address}
                        </div>
                    </div>

                    <div className="flex gap-2">

                        <button
                            onClick={() => selectPrinter(printer)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                        >
                            Pilih
                        </button>

                        <button
                            onClick={() => removePrinter(printer.id)}
                            className="border border-red-300 text-red-600 px-4 py-2 rounded-lg"
                        >
                            Hapus
                        </button>

                    </div>

                </div>

            ))}

        </div>

    </div>

    <div className="bg-white rounded-xl border border-slate-200 p-5">

        <h3 className="font-semibold text-slate-800 mb-4">
            Pengaturan Cetak
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

            <select
                value={printerConfig.jenis}
                onChange={(e) =>
                    setPrinterConfig({
                        ...printerConfig,
                        jenis: e.target.value
                    })
                }
                className="border border-slate-200 rounded-lg px-3 py-2"
            >
                <option>Thermal 58mm</option>
                <option>Thermal 80mm</option>
            </select>

            <select
                value={printerConfig.koneksi}
                onChange={(e) =>
                    setPrinterConfig({
                        ...printerConfig,
                        koneksi: e.target.value
                    })
                }
                className="border border-slate-200 rounded-lg px-3 py-2"
            >
                <option>Bluetooth</option>
                <option>USB</option>
                <option>LAN</option>
            </select>

        </div>

        <button
            onClick={handleSaveConfig}
            className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-lg"
        >
            Simpan Pengaturan
        </button>

    </div>

</div>


</div>

    );
}