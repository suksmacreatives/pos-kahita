import { useEffect, useRef } from "react";

export default function PrintShiftReport({
    data,
    formatRupiah,
    onFinished,
}) {
    const alreadyPrinted = useRef(false);

    useEffect(() => {
        if (!data) return;

        if (alreadyPrinted.current) return;

        alreadyPrinted.current = true;

        const printToOripos = async () => {
            try {
                console.log("=================================");
                console.log("MULAI PRINT TUTUP KASIR (VIA BACKEND)");
                console.log("Data:", data);
                console.log("=================================");

                const row = (label, value, options = {}) => {
                    const numberValue = Number(value || 0);

                    if (
                        numberValue === 0 &&
                        options.showZero !== true
                    ) {
                        return null;
                    }

                    return textRow(
                        label,
                        formatRupiah(numberValue),
                        options.bold === true
                    );
                };

                const content = [];
                // =====================================================
                // FORMAT BARIS 80MM
                // Area aman printer 80mm
                // =====================================================

                const printWidth = 42;

                const textRow = (label, value, bold = false) => {
                    const left = String(label || "");
                    const right = String(value || "");

                    // Batasi panjang label
                    const maxLeft = 24;

                    const safeLeft = left.substring(0, maxLeft);

                    // Jarak antara label dan nominal
                    const spaces = Math.max(
                        1,
                        printWidth - safeLeft.length - right.length
                    );

                    const line =
                        safeLeft +
                        " ".repeat(spaces) +
                        right;

                    return {
                        type: "text",
                        text: line,
                        ...(bold ? { bold: true } : {}),
                    };
                };

                // Spasi vertikal kecil
                const space = (lines = 1) => ({
                    type: "feed",
                    lines,
                });

                const savedConfig =
                    localStorage.getItem(
                        "master_nota_config"
                    );

                const notaConfig = savedConfig
                    ? JSON.parse(savedConfig)
                    : {
                        namaToko:
                            "KAHITA BUSANA",

                        alamatToko: "",

                        telpToko: "",

                        showNamaToko: true,

                        showAlamat: true,

                        showTelp: true,

                        showHeaderTerimakasih: true,

                        showFooterNote: true,

                        teksTerimakasih:
                            "Terima Kasih",

                        teksFooterNote: "",
                    };

                // Nama toko
                if (
                    notaConfig.showNamaToko &&
                    notaConfig.namaToko
                ) {
                    content.push({
                        type: "text",
                        text: notaConfig.namaToko,
                        align: "center",
                        bold: true,
                    });
                }

                // Alamat
                if (
                    notaConfig.showAlamat &&
                    notaConfig.alamatToko
                ) {
                    content.push({
                        type: "text",
                        text: notaConfig.alamatToko,
                        align: "center",
                    });
                }

                // Telepon
                if (
                    notaConfig.showTelp &&
                    notaConfig.telpToko
                ) {
                    content.push({
                        type: "text",
                        text: notaConfig.telpToko,
                        align: "center",
                    });
                }

                content.push({
                    type: "divider",
                });

                // -----------------------------------------------------
                // JUDUL
                // -----------------------------------------------------

                content.push({
                    type: "text",
                    text: "REKAP TUTUP KASIR",
                    align: "center",
                    bold: true,
                });

                // -----------------------------------------------------
                // INFORMASI SHIFT
                // -----------------------------------------------------

                content.push({
                    type: "text",
                    text: `Kasir : ${data.kasir || "-"}`,
                });

                content.push({
                    type: "text",
                    text: `Buka  : ${data.opened_at || "-"}`,
                });

                content.push({
                    type: "text",
                    text: `Tutup : ${data.closed_at || "-"}`,
                });

                content.push({
                    type: "divider",
                });

                const modalAwal = row(
                    "Modal Awal",
                    data.starting_cash
                );

                if (modalAwal) {
                    content.push(modalAwal);
                }

                const tunai = row(
                    "Tunai",
                    data.tunai
                );

                if (tunai) {
                    content.push(tunai);
                }

                const transfer = row(
                    "Transfer",
                    data.transfer
                );

                if (transfer) {
                    content.push(transfer);
                }

                const qris = row(
                    "QRIS",
                    data.qris
                );

                if (qris) {
                    content.push(qris);
                }

                const debit = row(
                    "Debit",
                    data.debit
                );

                if (debit) {
                    content.push(debit);
                }
                
                const kredit = row(
                    "Kredit",
                    data.kredit
                );

                if (kredit) {
                    content.push(kredit);
                }

                const ewallet = row(
                    "E-Wallet",
                    data.ewallet
                );

                if (ewallet) {
                    content.push(ewallet);
                }

                const voidRow = row(
                    "VOID",
                    data.void
                );

                if (voidRow) {
                    content.push(voidRow);
                }

                content.push({
                    type: "divider",
                });

                // -----------------------------------------------------
                // TOTAL PENJUALAN
                // -----------------------------------------------------

                const totalPenjualan = row(
                    "Total Penjualan",
                    data.total_penjualan,
                    {
                        bold: true,
                    }
                );

                if (totalPenjualan) {
                    content.push(totalPenjualan);
                }

                // Total transaksi
                if (
                    Number(data.total_transaksi || 0) > 0
                ) {
                    content.push(
                        textRow(
                            "Total Transaksi",
                            String(data.total_transaksi)
                        )
                    );
                }

                // Total item
                if (
                    Number(data.total_item || 0) > 0
                ) {
                    content.push(
                        textRow(
                            "Total Item",
                            String(data.total_item)
                        )
                    );
                }

                content.push({
                    type: "divider",
                });

                const cashExpected = row(
                    "Cash Seharusnya",
                    data.cash_expected
                );

                if (cashExpected) {
                    content.push(cashExpected);
                }

                const physicalCash = row(
                    "Cash Fisik",
                    data.physical_cash
                );

                if (physicalCash) {
                    content.push(physicalCash);
                }
                if (
                    Number(data.discrepancy || 0) !== 0
                ) {
                    content.push({
                        type: "divider",
                    });

                    content.push(
                        textRow(
                            "SELISIH",
                            formatRupiah(data.discrepancy),
                            true
                        )
                    );
                }
                if (
                    Array.isArray(data.products) &&
                    data.products.length > 0
                ) {
                    content.push({
                        type: "divider",
                    });

                    content.push({
                        type: "text",
                        text: "PRODUK TERJUAL",
                        align: "center",
                        bold: true,
                    });

                    data.products.forEach((item) => {
                        const nama =
                            item.nama ||
                            "Produk";

                        const qty =
                            `x${item.qty || 0}`;

                        content.push(
                            textRow(nama, qty)
                        );
                    });
                }
                content.push({
                    type: "divider",
                });

                if (
                    notaConfig.showHeaderTerimakasih
                ) {
                    content.push({
                        type: "text",
                        text:
                            notaConfig.teksTerimakasih ||
                            "Terima Kasih",
                        align: "center",
                        bold: true,
                    });
                }

                if (
                    notaConfig.showFooterNote &&
                    notaConfig.teksFooterNote
                ) {
                    content.push({
                        type: "text",
                        text:
                            notaConfig.teksFooterNote,
                        align: "center",
                    });
                }

                // Feed sebelum potong kertas
                content.push({
                    type: "feed",
                    lines: 3,
                });

                // =====================================================
                // 4. KIRIM KE BACKEND PROXY (MENGATASI MIXED CONTENT DI ANDROID)
                // =====================================================

                console.log(
                    "Mengirim data ke backend proxy..."
                );

                // KIRIM LANGSUNG KE PRINTER LOKAL (CLEANTER)
const response = await fetch("http://localhost:9100/print", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        cut: true,
        content: content,
    }),
});

if (!response.ok) {
    throw new Error("Gagal mencetak rekap tutup kasir (Status: " + response.status + ")");
}

console.log("✅ STRUK TUTUP KASIR BERHASIL DICETAK");

if (onFinished) {
    onFinished();
}

// LOGOUT SETELAH PRINT BERHASIL
try {
    await fetch(route("pos.logout-after-print"), {
        method: "POST",
        headers: {
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
            Accept: "application/json",
        },
    });
} finally {
    window.location.href = "/login";
}

           } catch (error) {
    console.error("PRINT / LOGOUT ERROR:", error);
    alreadyPrinted.current = false;
    
    // Abaikan alert error cetak/logout, langsung arahkan ke login secara paksa agar kasir tetap aman
    if (onFinished) {
        onFinished();
    }
    window.location.href = "/login";
}
        };

        printToOripos();

    }, [data, formatRupiah, onFinished]);

    return null;
}