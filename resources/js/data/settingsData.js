import { format, subDays } from 'date-fns';

const now = new Date();
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const roles = [
    {
        id: 'super_admin',
        label: 'Super Admin',
        color: 'purple',
        deskripsi: 'Akses penuh ke semua fitur dan outlet',
        permissions: {
            dashboard: { view: true, edit: true },
            products: { view: true, edit: true },
            inventory: { view: true, edit: true },
            transactions: { view: true, void: true, refund: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: true }
        }
    },
    {
        id: 'admin',
        label: 'Admin',
        color: 'blue',
        deskripsi: 'Akses penuh kecuali pengaturan sistem',
        permissions: {
            dashboard: { view: true, edit: true },
            products: { view: true, edit: true },
            inventory: { view: true, edit: true },
            transactions: { view: true, void: true, refund: true },
            reports: { view: true, export: true },
            settings: { view: false, edit: false }
        }
    },
    {
        id: 'manajer',
        label: 'Manajer',
        color: 'emerald',
        deskripsi: 'Kelola outlet yang ditugaskan',
        permissions: {
            dashboard: { view: true, edit: false },
            products: { view: true, edit: false },
            inventory: { view: true, edit: true },
            transactions: { view: true, void: true, refund: false },
            reports: { view: true, export: false },
            settings: { view: false, edit: false }
        }
    },
    {
        id: 'kasir',
        label: 'Kasir',
        color: 'amber',
        deskripsi: 'Transaksi kasir saja',
        permissions: {
            dashboard: { view: true, edit: false },
            products: { view: true, edit: false },
            inventory: { view: true, edit: false },
            transactions: { view: true, void: false, refund: false },
            reports: { view: false, export: false },
            settings: { view: false, edit: false }
        }
    }
];

export const accounts = [
    { id: 'USR-001', nama: 'Budi Santoso', email: 'budi@kahita.com', telp: '081234567890', foto_color: '#8B5CF6', role: 'super_admin', outlet_id: null, outlet_nama: null, status: 'aktif', last_login: new Date().toISOString(), created_at: subDays(now, 300).toISOString() },
    { id: 'USR-002', nama: 'Siti Rahma', email: 'siti@kahita.com', telp: '081234567891', foto_color: '#3B82F6', role: 'admin', outlet_id: null, outlet_nama: null, status: 'aktif', last_login: subDays(now, 1).toISOString(), created_at: subDays(now, 250).toISOString() },
    { id: 'USR-003', nama: 'Agus Pratama', email: 'agus@kahita.com', telp: '081234567892', foto_color: '#3B82F6', role: 'admin', outlet_id: null, outlet_nama: null, status: 'nonaktif', last_login: subDays(now, 15).toISOString(), created_at: subDays(now, 200).toISOString() },
    { id: 'USR-004', nama: 'Lina Marlina', email: 'lina@kahita.com', telp: '081234567893', foto_color: '#10B981', role: 'manajer', outlet_id: 'denpasar', outlet_nama: 'Denpasar', status: 'aktif', last_login: subDays(now, 0).toISOString(), created_at: subDays(now, 150).toISOString() },
    { id: 'USR-005', nama: 'Dewi Lestari', email: 'dewi@kahita.com', telp: '081234567894', foto_color: '#10B981', role: 'manajer', outlet_id: 'jakarta', outlet_nama: 'Jakarta', status: 'aktif', last_login: subDays(now, 2).toISOString(), created_at: subDays(now, 120).toISOString() },
    { id: 'USR-006', nama: 'Hendra Setiawan', email: 'hendra@kahita.com', telp: '081234567895', foto_color: '#10B981', role: 'manajer', outlet_id: 'bandung', outlet_nama: 'Bandung', status: 'aktif', last_login: subDays(now, 1).toISOString(), created_at: subDays(now, 100).toISOString() },
    { id: 'USR-007', nama: 'Dian Sastro', email: 'dian@kahita.com', telp: '081234567896', foto_color: '#10B981', role: 'manajer', outlet_id: 'surabaya', outlet_nama: 'Surabaya', status: 'suspended', last_login: subDays(now, 30).toISOString(), created_at: subDays(now, 90).toISOString() },
    { id: 'USR-008', nama: 'Joko Widodo', email: 'joko@kahita.com', telp: '081234567897', foto_color: '#F59E0B', role: 'kasir', outlet_id: 'denpasar', outlet_nama: 'Denpasar', status: 'aktif', last_login: subDays(now, 0).toISOString(), created_at: subDays(now, 80).toISOString() },
    { id: 'USR-009', nama: 'Rina Nose', email: 'rina@kahita.com', telp: '081234567898', foto_color: '#F59E0B', role: 'kasir', outlet_id: 'jakarta', outlet_nama: 'Jakarta', status: 'aktif', last_login: subDays(now, 0).toISOString(), created_at: subDays(now, 70).toISOString() },
    { id: 'USR-010', nama: 'Andi Arsyil', email: 'andi@kahita.com', telp: '081234567899', foto_color: '#F59E0B', role: 'kasir', outlet_id: 'bandung', outlet_nama: 'Bandung', status: 'aktif', last_login: subDays(now, 1).toISOString(), created_at: subDays(now, 60).toISOString() },
    { id: 'USR-011', nama: 'Sari Roti', email: 'sari@kahita.com', telp: '081234567900', foto_color: '#F59E0B', role: 'kasir', outlet_id: 'surabaya', outlet_nama: 'Surabaya', status: 'aktif', last_login: subDays(now, 0).toISOString(), created_at: subDays(now, 50).toISOString() },
    { id: 'USR-012', nama: 'Tono Suparman', email: 'tono@kahita.com', telp: '081234567901', foto_color: '#F59E0B', role: 'kasir', outlet_id: 'denpasar', outlet_nama: 'Denpasar', status: 'nonaktif', last_login: subDays(now, 45).toISOString(), created_at: subDays(now, 40).toISOString() }
];

export const promos = [
    { id: 'PRO-001', nama_promo: 'Diskon Spesial Lebaran', kode_promo: 'LEBARAN25', tipe: 'persentase', nilai_diskon: 20, min_transaksi: 150000, max_diskon: 50000, berlaku_dari: subDays(now, 5).toISOString(), berlaku_sampai: subDays(now, -10).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 100, terpakai: 45, status: 'aktif', deskripsi: 'Diskon 20% maksimal 50rb untuk semua produk', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 10).toISOString() },
    { id: 'PRO-002', nama_promo: 'Potongan Belanja 50rb', kode_promo: 'POTONGAN50', tipe: 'nominal', nilai_diskon: 50000, min_transaksi: 300000, max_diskon: null, berlaku_dari: subDays(now, 10).toISOString(), berlaku_sampai: subDays(now, 20).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 50, terpakai: 12, status: 'aktif', deskripsi: 'Potongan langsung Rp 50.000 min belanja 300rb', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 15).toISOString() },
    { id: 'PRO-003', nama_promo: 'Beli 2 Gratis 1 Kemeja', kode_promo: 'B2G1KEMEJA', tipe: 'beli_x_gratis_y', nilai_diskon: null, min_transaksi: 0, max_diskon: null, berlaku_dari: subDays(now, 2).toISOString(), berlaku_sampai: subDays(now, 5).toISOString(), berlaku_di: 'semua', berlaku_untuk: ['Kemeja Rayon'], kuota: 200, terpakai: 80, status: 'aktif', deskripsi: 'Setiap pembelian 2 Kemeja Rayon, gratis 1 item yang sama', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 5).toISOString() },
    { id: 'PRO-004', nama_promo: 'Paket Hemat Keluarga', kode_promo: 'HEMATFAM', tipe: 'bundle', nilai_diskon: 250000, min_transaksi: 0, max_diskon: null, berlaku_dari: subDays(now, 20).toISOString(), berlaku_sampai: subDays(now, 30).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: null, terpakai: 150, status: 'aktif', deskripsi: 'Bundle 2 atasan dan 2 bawahan hanya Rp 250.000', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 25).toISOString() },
    { id: 'PRO-005', nama_promo: 'Flash Sale Akhir Pekan', kode_promo: 'FLASHSALE', tipe: 'persentase', nilai_diskon: 50, min_transaksi: 0, max_diskon: 100000, berlaku_dari: subDays(now, 1).toISOString(), berlaku_sampai: subDays(now, 1).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 50, terpakai: 25, status: 'aktif', deskripsi: 'Flash sale gila-gilaan diskon 50%', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 2).toISOString() },
    { id: 'PRO-006', nama_promo: 'Diskon Pegawai', kode_promo: 'KAHITASTAFF', tipe: 'persentase', nilai_diskon: 30, min_transaksi: 0, max_diskon: null, berlaku_dari: subDays(now, 100).toISOString(), berlaku_sampai: subDays(now, 365).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: null, terpakai: 400, status: 'aktif', deskripsi: 'Diskon khusus staff Kahita', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 100).toISOString() },
    { id: 'PRO-007', nama_promo: 'Promo Tahun Baru', kode_promo: 'TAHUNBARU', tipe: 'persentase', nilai_diskon: 25, min_transaksi: 200000, max_diskon: 100000, berlaku_dari: subDays(now, 150).toISOString(), berlaku_sampai: subDays(now, 140).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: null, terpakai: 800, status: 'kadaluarsa', deskripsi: 'Promo akhir tahun diskon 25%', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 160).toISOString() },
    { id: 'PRO-008', nama_promo: 'Potongan Ongkir', kode_promo: 'FREESHIP', tipe: 'nominal', nilai_diskon: 20000, min_transaksi: 100000, max_diskon: null, berlaku_dari: subDays(now, 80).toISOString(), berlaku_sampai: subDays(now, 70).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 1000, terpakai: 1000, status: 'habis', deskripsi: 'Potongan ongkir Rp 20.000', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 85).toISOString() },
    { id: 'PRO-009', nama_promo: 'Buy 1 Get 1 T-Shirt', kode_promo: 'B1G1KAOS', tipe: 'beli_x_gratis_y', nilai_diskon: null, min_transaksi: 0, max_diskon: null, berlaku_dari: subDays(now, 60).toISOString(), berlaku_sampai: subDays(now, 50).toISOString(), berlaku_di: ['jakarta', 'bandung'], berlaku_untuk: ['Atasan'], kuota: 50, terpakai: 50, status: 'habis', deskripsi: 'Beli 1 gratis 1 untuk semua kaos', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 65).toISOString() },
    { id: 'PRO-010', nama_promo: 'Diskon Kemerdekaan', kode_promo: 'MERDEKA79', tipe: 'persentase', nilai_diskon: 17, min_transaksi: 80000, max_diskon: 45000, berlaku_dari: subDays(now, 300).toISOString(), berlaku_sampai: subDays(now, 290).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 1945, terpakai: 800, status: 'kadaluarsa', deskripsi: 'Diskon 17% spesial kemerdekaan', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 310).toISOString() },
    { id: 'PRO-011', nama_promo: 'Potongan Weekend', kode_promo: 'WEEKENDYAY', tipe: 'nominal', nilai_diskon: 15000, min_transaksi: 150000, max_diskon: null, berlaku_dari: subDays(now, 10).toISOString(), berlaku_sampai: subDays(now, 8).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 100, terpakai: 100, status: 'habis', deskripsi: 'Potongan 15rb khusus sabtu minggu', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 12).toISOString() },
    { id: 'PRO-012', nama_promo: 'Paket Pasangan', kode_promo: 'COUPLE', tipe: 'bundle', nilai_diskon: 180000, min_transaksi: 0, max_diskon: null, berlaku_dari: subDays(now, 50).toISOString(), berlaku_sampai: subDays(now, 20).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 500, terpakai: 20, status: 'nonaktif', deskripsi: 'Bundle baju pasangan', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 55).toISOString() },
    { id: 'PRO-013', nama_promo: 'Beli 3 Gratis 1', kode_promo: 'B3G1ALL', tipe: 'beli_x_gratis_y', nilai_diskon: null, min_transaksi: 0, max_diskon: null, berlaku_dari: subDays(now, 40).toISOString(), berlaku_sampai: subDays(now, 10).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 100, terpakai: 0, status: 'nonaktif', deskripsi: 'Beli 3 produk apapun gratis 1', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 45).toISOString() },
    { id: 'PRO-014', nama_promo: 'Potongan Pelajar', kode_promo: 'STUDENT', tipe: 'nominal', nilai_diskon: 20000, min_transaksi: 100000, max_diskon: null, berlaku_dari: subDays(now, 30).toISOString(), berlaku_sampai: subDays(now, 10).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 200, terpakai: 50, status: 'nonaktif', deskripsi: 'Tunjukkan kartu pelajar dapat diskon', dibuat_oleh: 'Budi Santoso', created_at: subDays(now, 35).toISOString() },
    { id: 'PRO-015', nama_promo: 'Diskon Buka Puasa', kode_promo: 'BUKBER', tipe: 'persentase', nilai_diskon: 10, min_transaksi: 50000, max_diskon: 20000, berlaku_dari: subDays(now, 20).toISOString(), berlaku_sampai: subDays(now, -5).toISOString(), berlaku_di: 'semua', berlaku_untuk: 'semua', kuota: 300, terpakai: 15, status: 'nonaktif', deskripsi: 'Diskon sore hari menjelang buka', dibuat_oleh: 'Siti Rahma', created_at: subDays(now, 25).toISOString() },
];

export const AKSI_TYPES = [
    'LOGIN', 'LOGOUT', 'TAMBAH', 'EDIT', 'HAPUS', 'VOID', 'REFUND', 'EXPORT', 'CETAK', 'TRANSFER_STOK', 'TERIMA_BARANG', 'UBAH_PASSWORD'
];

export const MODUL_TYPES = [
    'Auth', 'Products', 'Inventory', 'Transactions', 'Reports', 'Settings', 'Akun', 'Promo'
];

export const ALASAN_VOID = [
    'Salah input harga', 'Pelanggan batal beli', 'Pembayaran gagal', 'Stok tidak tersedia', 'Permintaan pelanggan'
];

export const ALASAN_REFUND = [
    'Produk cacat/rusak', 'Ukuran tidak sesuai', 'Warna tidak sesuai', 'Produk tidak seperti deskripsi'
];

export const activityLogs = Array.from({ length: 100 }).map((_, i) => {
    const isSuccess = Math.random() > 0.3; // 70% success
    const user = randomItem(accounts);
    const aksi = randomItem(AKSI_TYPES);
    const modul = randomItem(MODUL_TYPES);
    const id = `LOG-${String(100 - i).padStart(3, '0')}`;
    
    // Bias towards more recent dates
    const timestamp = subDays(now, Math.floor(Math.random() * Math.random() * 30)).toISOString();
    
    return {
        id,
        timestamp,
        user_id: user.id,
        user_nama: user.nama,
        user_role: user.role,
        outlet_id: user.outlet_id,
        outlet_nama: user.outlet_nama,
        aksi,
        modul,
        target_id: randomItem(['PRD-012', 'TRX-20250501-1234', 'PRO-001', 'USR-005', null]),
        target_label: randomItem(['Blouse Batik Prada', 'Transaksi #1234', 'Diskon Lebaran', 'Siti Rahma', null]),
        detail: {
            sebelum: { status: 'nonaktif', harga: 100000 },
            sesudah: { status: 'aktif', harga: 120000 }
        },
        ip_address: `192.168.1.${randomInt(10, 250)}`,
        device: randomItem(['desktop', 'mobile', 'tablet']),
        status: isSuccess ? 'sukses' : 'gagal',
        error_msg: isSuccess ? null : randomItem(['Password salah', 'Tidak memiliki izin akses', 'Sesi telah habis'])
    };
}).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Stats Computations
export const akunStats = {
    total: accounts.length,
    aktif: accounts.filter(a => a.status === 'aktif').length,
    kasir: accounts.filter(a => a.role === 'kasir').length,
    nonaktif_suspended: accounts.filter(a => a.status !== 'aktif').length,
};

export const promoStats = {
    total: promos.length,
    aktif: promos.filter(p => p.status === 'aktif').length,
    hampir_habis: promos.filter(p => {
        if (p.status !== 'aktif') return false;
        const s = new Date(p.berlaku_sampai);
        const diffDays = Math.ceil((s - now) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 3;
    }).length,
    total_terpakai: promos.reduce((sum, p) => sum + p.terpakai, 0),
};

const logsToday = activityLogs.filter(l => {
    const lDate = new Date(l.timestamp);
    return lDate.getDate() === now.getDate() && lDate.getMonth() === now.getMonth() && lDate.getFullYear() === now.getFullYear();
});

const userActivityCounts = {};
logsToday.forEach(l => {
    userActivityCounts[l.user_nama] = (userActivityCounts[l.user_nama] || 0) + 1;
});
const topUser = Object.entries(userActivityCounts).sort((a, b) => b[1] - a[1])[0] || ['Tidak ada', 0];

export const logStats = {
    total_hari_ini: logsToday.length,
    login_hari_ini: logsToday.filter(l => l.aksi === 'LOGIN').length,
    gagal_hari_ini: logsToday.filter(l => l.status === 'gagal').length,
    user_teraktif: { nama: topUser[0], count: topUser[1] }
};
