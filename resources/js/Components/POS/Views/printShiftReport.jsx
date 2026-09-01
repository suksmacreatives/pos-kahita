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

                const printWidth = 32;

                const textRow = (label, value, bold = false) => {
                    const left = String(label || "");
                    const right = String(value || "");
                    const maxLeft = 19;
                    const safeLeft = left.substring(0, maxLeft);
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

                content.push({
                    type: "feed",
                    lines: 1,
                });

                const paymentMethods = [
                    ["Tunai", data.tunai],
                    ["QRIS", data.qris],
                    ["Debit", data.debit],
                    ["Transfer", data.transfer],
                ];

                paymentMethods.forEach(([label, value]) => {

                    const nominal = Number(value || 0);

                    if (nominal > 0) {
                        content.push(
                            textRow(
                                label,
                                formatRupiah(nominal)
                            )
                        );
                    }

                });

                content.push({
                    type: "divider",
                });

                const totalPenjualan = Number(
                    data.total_penjualan || 0
                );

                content.push(
                    textRow(
                        "TOTAL PENJUALAN",
                        formatRupiah(totalPenjualan),
                        true
                    )
                );

                content.push({
                    type: "divider",
                });

                const startingCash = Number(
                    data.starting_cash || 0
                );

                const tunaiPenjualan = Number(
                    data.tunai || 0
                );

                const cashSeharusnya =
                    startingCash +
                    tunaiPenjualan;

                content.push(
                    textRow(
                        "Cash Seharusnya",
                        formatRupiah(cashSeharusnya),
                        true
                    )
                );

                const pemasukan = Number(
                    data.pemasukan ??
                    data.cash_in ??
                    data.total_pemasukan ??
                    0
                );

                const pengeluaran = Number(
                    data.pengeluaran ??
                    data.cash_out ??
                    data.total_pengeluaran ??
                    0
                );
                // Pemasukan hanya tampil jika ada
                if (pemasukan > 0) {

                    content.push(
                        textRow(
                            "Pemasukan",
                            formatRupiah(pemasukan)
                        )
                    );

                }
                // Pengeluaran hanya tampil jika ada
                if (pengeluaran > 0) {

                    content.push(
                        textRow(
                            "Pengeluaran",
                            formatRupiah(pengeluaran)
                        )
                    );

                }

                const cashAktualSistem =
                    cashSeharusnya +
                    pemasukan -
                    pengeluaran;

                content.push({
                    type: "divider",
                });

                content.push(
                    textRow(
                        "Cash Aktual Sistem",
                        formatRupiah(cashAktualSistem),
                        true
                    )
                );

                const cashFisik = Number(
                    data.physical_cash || 0
                );

                content.push(
                    textRow(
                        "Cash Fisik",
                        formatRupiah(cashFisik),
                        true
                    )
                );

                const discrepancy =
                    cashFisik -
                    cashAktualSistem;

                if (discrepancy !== 0) {

                    content.push({
                        type: "divider",
                    });

                    const selisihLabel =
                        discrepancy > 0
                            ? "SELISIH LEBIH"
                            : "SELISIH KURANG";

                    content.push(
                        textRow(
                            selisihLabel,
                            formatRupiah(Math.abs(discrepancy)),
                            true
                        )
                    );

                }

                content.push({
                    type: "divider",
                });

                if (Number(data.total_transaksi || 0) > 0) {

                    content.push(
                        textRow(
                            "Total Transaksi",
                            String(data.total_transaksi)
                        )
                    );

                }

                if (Number(data.total_item || 0) > 0) {

                    content.push(
                        textRow(
                            "Total Item",
                            String(data.total_item)
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
                            item.name ||
                            "Produk";

                        const qty =
                            Number(item.qty || item.quantity || 0);

                        content.push(
                            textRow(
                                nama,
                                `x${qty}`
                            )
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