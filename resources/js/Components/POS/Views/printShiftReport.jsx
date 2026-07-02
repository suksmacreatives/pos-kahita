import { useEffect } from "react";

export default function PrintShiftReport({
    data,
    formatRupiah,
    onFinished,
}) {
    useEffect(() => {
        if (!data) return;

        const savedConfig = localStorage.getItem("master_nota_config");

        const notaConfig = savedConfig
            ? JSON.parse(savedConfig)
            : {
                  namaToko: "KAHITA BUSANA",
                  alamatToko: "",
                  telpToko: "",
                  showNamaToko: true,
                  showAlamat: true,
                  showTelp: true,
                  showHeaderTerimakasih: true,
                  showFooterNote: true,
                  teksTerimakasih: "Terima Kasih",
                  teksFooterNote: "",
              };

        const iframe = document.createElement("iframe");

        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";

        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;

        const row = (label, value) => {
            if (Number(value) === 0) return "";

            return `
                <div class="row">
                    <span>${label}</span>
                    <span>${formatRupiah(value)}</span>
                </div>
            `;
        };

        doc.open();

        doc.write(`
<!DOCTYPE html>
<html>

<head>

<style>

@page{
    size:80mm auto;
    margin:4mm;
}

body{
    width:72mm;
    font-family:'Courier New', monospace;
    font-size:11px;
    color:#000;
}

.center{
    text-align:center;
}

.bold{
    font-weight:bold;
}

.title{
    text-align:center;
    font-weight:bold;
    margin:6px 0;
    text-transform:uppercase;
}

.line{
    border-top:1px dashed #000;
    margin:6px 0;
}

.row{
    display:flex;
    justify-content:space-between;
    margin:2px 0;
}

</style>

</head>

<body>

<div class="center">

${notaConfig.showNamaToko ? `<div class="bold">${notaConfig.namaToko}</div>` : ""}

${notaConfig.showAlamat && notaConfig.alamatToko ? `<div>${notaConfig.alamatToko}</div>` : ""}

${notaConfig.showTelp && notaConfig.telpToko ? `<div>${notaConfig.telpToko}</div>` : ""}

</div>

<div class="line"></div>

<div class="title">
REKAP TUTUP KASIR
</div>

<div>Kasir : ${data.kasir}</div>
<div>Buka : ${data.opened_at}</div>
<div>Tutup : ${data.closed_at}</div>

<div class="line"></div>

${row("Modal Awal", data.starting_cash)}

${row("Tunai", data.tunai)}

${row("Transfer", data.transfer)}

${row("QRIS", data.qris)}

${row("Debit", data.debit)}

${row("E-Wallet", data.ewallet)}

${row("VOID", data.void)}

<div class="line"></div>

${row("Total Penjualan", data.total_penjualan)}

${Number(data.total_transaksi) > 0 ? `
<div class="row">
    <span>Total Transaksi</span>
    <span>${data.total_transaksi}</span>
</div>
` : ""}

${Number(data.total_item) > 0 ? `
<div class="row">
    <span>Total Item</span>
    <span>${data.total_item}</span>
</div>
` : ""}

<div class="line"></div>


${row("Cash Seharusnya", data.cash_expected)}

${row("Cash Fisik", data.physical_cash)}

${Number(data.discrepancy) !== 0 ? `

<div class="line"></div>

<div class="row bold">
    <span>SELISIH</span>
    <span>${formatRupiah(data.discrepancy)}</span>
</div>

` : ""}

<div class="line"></div>
${
data.products?.length
?
`
<div class="bold">
PRODUK TERJUAL
</div>

${data.products.map(item => `
<div class="row">
    <span>${item.nama}</span>
    <span>x${item.qty}</span>
</div>
`).join("")}

<div class="line"></div>
`
:
""
}

${
notaConfig.showHeaderTerimakasih
? `<div class="center bold">${notaConfig.teksTerimakasih}</div>`
: ""
}

${
notaConfig.showFooterNote && notaConfig.teksFooterNote
? `<div class="center">${notaConfig.teksFooterNote}</div>`
: ""
}

</body>

</html>
        `);

        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            setTimeout(async () => {

    document.body.removeChild(iframe);

    if (onFinished) {
        onFinished();
    }

    try {

        await fetch(route("pos.logout-after-print"), {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .content,
                "Accept": "application/json",
            },
        });

    } finally {

        window.location.href = "/login";

    }

},1000);
        }, 300);

    }, [data]);

    return null;
}