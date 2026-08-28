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
                console.log("MULAI PRINT TUTUP KASIR");
                console.log("Data:", data);
                console.log("=================================");

                const healthResponse = await fetch(
                    "http://localhost:9100/health"
                );

                if (!healthResponse.ok) {
                    throw new Error(
                        "Cleanter tidak dapat dihubungi."
                    );
                }

                const health = await healthResponse.json();

                console.log("Cleanter health:", health);

                if (!health?.printer?.connected) {
                    throw new Error(
                        "Printer ORIPOS tidak terhubung."
                    );
                }
                const row = (label, value, options = {}) => {
                    const numberValue = Number(value || 0);
                    if (
                        numberValue === 0 &&
                        options.showZero !== true
                    ) {
                        return null;
                    }

                    return {
                        type: "row",
                        left: label,
                        right: formatRupiah(numberValue),
                        ...(options.bold
                            ? { bold: true }
                            : {}),
                    };
                };

                const content = [];

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
                    content.push({
                        type: "row",
                        left: "Total Transaksi",
                        right: String(
                            data.total_transaksi
                        ),
                    });
                }

                // Total item
                if (
                    Number(data.total_item || 0) > 0
                ) {
                    content.push({
                        type: "row",
                        left: "Total Item",
                        right: String(
                            data.total_item
                        ),
                    });
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

                    content.push({
                        type: "row",
                        left: "SELISIH",
                        right: formatRupiah(
                            data.discrepancy
                        ),
                        bold: true,
                    });
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

                    data.products.forEach(
                        (item) => {
                            content.push({
                                type: "row",

                                left:
                                    item.nama ||
                                    "Produk",

                                right:
                                    `x${item.qty || 0}`,
                            });
                        }
                    );
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
                // 4. KIRIM LANGSUNG KE CLEANter
                // =====================================================

                console.log(
                    "Mengirim data ke ORIPOS..."
                );

                const response = await fetch(
                    "http://localhost:9100/print",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            cut: true,
                            content: content,
                        }),
                    }
                );

                const result =
                    await response.json();

                console.log(
                    "Hasil print:",
                    result
                );

                // =====================================================
                // 5. JIKA GAGAL
                // =====================================================

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        result?.fix ||
                        "Printer gagal mencetak."
                    );
                }

                // =====================================================
                // 6. PRINT BERHASIL
                // =====================================================

                console.log(
                    "================================="
                );

                console.log(
                    "STRUK BERHASIL DICETAK"
                );

                console.log(
                    "================================="
                );

                if (onFinished) {
                    onFinished();
                }

                // =====================================================
                // 7. LOGOUT SETELAH PRINT
                // =====================================================

                try {
                    await fetch(
                        route(
                            "pos.logout-after-print"
                        ),
                        {
                            method: "POST",

                            headers: {
                                "X-CSRF-TOKEN":
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]'
                                        )
                                        .content,

                                Accept:
                                    "application/json",
                            },
                        }
                    );
                } finally {
                    window.location.href =
                        "/login";
                }

            } catch (error) {

                console.error(
                    "================================="
                );

                console.error(
                    "PRINT ERROR:",
                    error
                );

                console.error(
                    "================================="
                );

                // Izinkan mencoba lagi
                alreadyPrinted.current = false;

                alert(
                    "Gagal mencetak struk.\n\n" +
                    error.message +
                    "\n\n" +
                    "Pastikan:\n" +
                    "• ORIPOS menyala\n" +
                    "• Bluetooth aktif\n" +
                    "• Printer terhubung\n" +
                    "• Cleanter aktif"
                );
            }
        };

        printToOripos();

    }, [data, formatRupiah, onFinished]);

    // Tidak menampilkan apa-apa
    return null;
}