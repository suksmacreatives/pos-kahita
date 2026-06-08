import { addDays, subDays, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';

export const OUTLETS = ['denpasar', 'jakarta', 'bandung', 'surabaya'];
export const METODE_BAYAR = ['cash', 'qris', 'transfer', 'debit', 'kredit'];
const ALASAN_VOID = ['Salah input harga', 'Pelanggan batal beli', 'Pembayaran gagal', 'Stok tidak tersedia', 'Permintaan pelanggan'];
const ALASAN_REFUND = ['Produk cacat/rusak', 'Ukuran tidak sesuai', 'Warna tidak sesuai', 'Produk tidak seperti deskripsi'];
const KATEGORI = ['Atasan', 'Bawahan', 'Dress', 'Aksesoris'];
const PRODUK_NAMES = ['Kemeja Rayon', 'Celana Kulot', 'Dress Midi', 'Blouse Korea', 'Rok Plisket', 'Tunik', 'Cardigan Rajut', 'Scarf'];

// Helpers for data generation
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateId = (prefix) => `${prefix}-${format(new Date(), 'yyyyMMdd')}-${randomInt(1000, 9999)}`;

const generateItems = (count) => {
    return Array.from({ length: count }).map(() => {
        const qty = randomInt(1, 3);
        const harga_beli = randomInt(50, 150) * 1000;
        const harga_jual = harga_beli + randomInt(20, 100) * 1000;
        return {
            produk_id: `PRD-${randomInt(100, 999)}`,
            nama_produk: randomItem(PRODUK_NAMES),
            kategori: randomItem(KATEGORI),
            ukuran: randomItem(['S', 'M', 'L', 'XL', 'All Size']),
            warna: randomItem(['Hitam', 'Putih', 'Navy', 'Mocca', 'Sage']),
            qty,
            harga_jual,
            harga_beli,
            subtotal: qty * harga_jual
        };
    });
};

const now = new Date();

export const transaksiHarian = Array.from({ length: 200 }).map((_, i) => {
    const items = generateItems(randomInt(1, 4));
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const diskon = randomInt(0, 1) === 1 ? randomInt(1, 5) * 10000 : 0;
    const total = subtotal - diskon;
    
    return {
        id: `TRX-${format(subDays(now, randomInt(0, 90)), 'yyyyMMdd')}-${randomInt(1000, 9999)}`,
        tanggal: subDays(now, randomInt(0, 90)).toISOString(),
        outlet_id: randomItem(OUTLETS),
        outlet_nama: randomItem(['Denpasar', 'Jakarta', 'Bandung', 'Surabaya']),
        kasir_nama: randomItem(['Budi', 'Siti', 'Agus', 'Lina', 'Dewi']),
        items,
        subtotal,
        diskon,
        total,
        metode_bayar: randomItem(METODE_BAYAR),
        status: 'selesai',
        catatan: ''
    };
});

export const transaksiVoid = Array.from({ length: 15 }).map(() => {
    const items = generateItems(randomInt(1, 3));
    const total_void = items.reduce((sum, item) => sum + item.subtotal, 0);
    return {
        id: generateId('VOID'),
        nomor_transaksi: generateId('TRX'),
        tanggal_transaksi: subDays(now, randomInt(1, 30)).toISOString(),
        tanggal_void: subDays(now, randomInt(0, 10)).toISOString(),
        outlet_id: randomItem(OUTLETS),
        outlet_nama: randomItem(['Denpasar', 'Jakarta', 'Bandung', 'Surabaya']),
        kasir_nama: randomItem(['Budi', 'Siti']),
        supervisor_nama: randomItem(['Hendra', 'Dian']),
        alasan_void: randomItem(ALASAN_VOID),
        items,
        total_void,
        status: 'approved'
    };
});

export const transaksiRefund = Array.from({ length: 10 }).map(() => {
    const items = generateItems(randomInt(1, 2));
    const total_refund = items.reduce((sum, item) => sum + item.subtotal, 0);
    return {
        id: generateId('RFD'),
        nomor_refund: generateId('RFD'),
        nomor_transaksi_asal: generateId('TRX'),
        tanggal_transaksi_asal: subDays(now, randomInt(1, 40)).toISOString(),
        tanggal_refund: subDays(now, randomInt(0, 5)).toISOString(),
        outlet_id: randomItem(OUTLETS),
        outlet_nama: randomItem(['Denpasar', 'Jakarta', 'Bandung', 'Surabaya']),
        kasir_nama: randomItem(['Budi', 'Siti']),
        pelanggan_nama: randomItem(['Joko', 'Rina', 'Andi', 'Sari']),
        items_refund: items.map(item => ({ ...item, total_refund: item.subtotal })),
        alasan_refund: randomItem(ALASAN_REFUND),
        total_refund,
        metode_refund: randomItem(['cash', 'transfer']),
        status: randomItem(['diproses', 'selesai'])
    };
});

const filterByDateAndOutlet = (transaksi, dateRange, outlet) => {
    return transaksi.filter(t => {
        const trxDate = new Date(t.tanggal);
        const inDateRange = isWithinInterval(trxDate, {
            start: startOfDay(dateRange.dari),
            end: endOfDay(dateRange.sampai)
        });
        const inOutlet = outlet === 'Semua Outlet' || t.outlet_id === outlet.toLowerCase();
        return inDateRange && inOutlet;
    });
};

export const hitungRingkasan = (transaksi, dateRange, outlet) => {
    const filtered = filterByDateAndOutlet(transaksi, dateRange, outlet);
    
    let total_pendapatan = 0;
    let total_harga_beli = 0;
    
    filtered.forEach(t => {
        total_pendapatan += t.total;
        t.items.forEach(item => {
            total_harga_beli += (item.harga_beli * item.qty);
        });
    });

    const laba_kotor = total_pendapatan - total_harga_beli;
    const laba_bersih = laba_kotor * 0.8; // Simplification
    const jumlah_transaksi = filtered.length;
    const rata_rata_transaksi = jumlah_transaksi > 0 ? total_pendapatan / jumlah_transaksi : 0;
    
    const daysDiff = Math.max(1, Math.ceil((dateRange.sampai - dateRange.dari) / (1000 * 60 * 60 * 24)));
    const transaksi_per_hari = (jumlah_transaksi / daysDiff).toFixed(1);

    return { total_pendapatan, jumlah_transaksi, total_harga_beli, laba_kotor, laba_bersih, rata_rata_transaksi, transaksi_per_hari };
};

export const hitungPerOutlet = (transaksi, dateRange) => {
    const filtered = filterByDateAndOutlet(transaksi, dateRange, 'Semua Outlet');
    
    return OUTLETS.map(outletId => {
        const tOutlet = filtered.filter(t => t.outlet_id === outletId);
        const omset = tOutlet.reduce((sum, t) => sum + t.total, 0);
        
        // Find top product
        const productCounts = {};
        tOutlet.forEach(t => {
            t.items.forEach(item => {
                productCounts[item.nama_produk] = (productCounts[item.nama_produk] || 0) + item.qty;
            });
        });
        const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
        
        return {
            id: outletId,
            nama: outletId.charAt(0).toUpperCase() + outletId.slice(1),
            omset,
            transaksi: tOutlet.length,
            produk_terlaris: topProduct ? `${topProduct[0]} (${topProduct[1]})` : '-',
            growth_vs_periode_lalu: randomInt(-10, 30) // Dummy growth
        };
    }).sort((a, b) => b.omset - a.omset);
};

export const hitungMetodeBayar = (transaksi, dateRange, outlet) => {
    const filtered = filterByDateAndOutlet(transaksi, dateRange, outlet);
    const result = {};
    const totalTransaksi = filtered.length;
    
    METODE_BAYAR.forEach(method => {
        const tMethod = filtered.filter(t => t.metode_bayar === method);
        const total = tMethod.reduce((sum, t) => sum + t.total, 0);
        const count = tMethod.length;
        result[method] = {
            count,
            total,
            persentase: totalTransaksi > 0 ? Math.round((count / totalTransaksi) * 100) : 0
        };
    });
    
    return result;
};

export const hitungOmsetHarian = (transaksi, dateRange, outlet) => {
    const filtered = filterByDateAndOutlet(transaksi, dateRange, outlet);
    const dailyData = {};
    
    filtered.forEach(t => {
        const dateStr = format(new Date(t.tanggal), 'yyyy-MM-dd');
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = { tanggal: dateStr, omset: 0, transaksi_count: 0 };
        }
        dailyData[dateStr].omset += t.total;
        dailyData[dateStr].transaksi_count += 1;
    });
    
    return Object.values(dailyData).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
};
