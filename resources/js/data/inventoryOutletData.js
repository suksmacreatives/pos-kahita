/**
 * Dummy data for Inventory Outlet – Kahita Busana
 */

export const outlets = [
  { id: 'denpasar', nama: 'Outlet Denpasar', warna: 'emerald', kota: 'Bali', hexColor: '#10B981' },
  { id: 'jakarta',  nama: 'Outlet Jakarta',  warna: 'blue',    kota: 'DKI Jakarta', hexColor: '#3B82F6' },
  { id: 'bandung',  nama: 'Outlet Bandung',  warna: 'purple',  kota: 'Jawa Barat', hexColor: '#8B5CF6' },
  { id: 'surabaya', nama: 'Outlet Surabaya', warna: 'amber',   kota: 'Jawa Timur', hexColor: '#F59E0B' },
];

const productTemplates = [
  { id: 1, kode_produk: 'KHT-0001', nama_produk: 'Kemeja Flanel Kahita', kategori: 'Atasan', harga_beli: 125000, warna_hex: '#ef4444' },
  { id: 2, kode_produk: 'KHT-0002', nama_produk: 'Blouse Silk Putih', kategori: 'Atasan', harga_beli: 145000, warna_hex: '#f8fafc' },
  { id: 3, kode_produk: 'KHT-0003', nama_produk: 'Tunic Linen Kasual', kategori: 'Atasan', harga_beli: 160000, warna_hex: '#d97706' },
  { id: 4, kode_produk: 'KHT-0004', nama_produk: 'Kaos Polo Premium', kategori: 'Atasan', harga_beli: 85000, warna_hex: '#1e3a8a' },
  { id: 5, kode_produk: 'KHT-0005', nama_produk: 'Cardigan Rajut Oversize', kategori: 'Atasan', harga_beli: 175000, warna_hex: '#6b7280' },
  { id: 6, kode_produk: 'KHT-0006', nama_produk: 'Celana Chino Slimfit', kategori: 'Bawahan', harga_beli: 150000, warna_hex: '#78350f' },
  { id: 7, kode_produk: 'KHT-0007', nama_produk: 'Rok Plisket Panjang', kategori: 'Bawahan', harga_beli: 110000, warna_hex: '#db2777' },
  { id: 8, kode_produk: 'KHT-0008', nama_produk: 'Denim Pants Klasik', kategori: 'Bawahan', harga_beli: 185000, warna_hex: '#2563eb' },
  { id: 9, kode_produk: 'KHT-0009', nama_produk: 'Culotte Pants Highwaist', kategori: 'Bawahan', harga_beli: 120000, warna_hex: '#0f766e' },
  { id: 10, kode_produk: 'KHT-0010', nama_produk: 'Dress Katun Motif', kategori: 'Terusan', harga_beli: 210000, warna_hex: '#be185d' },
  { id: 11, kode_produk: 'KHT-0011', nama_produk: 'Jumpsuit Denim', kategori: 'Terusan', harga_beli: 230000, warna_hex: '#1d4ed8' },
  { id: 12, kode_produk: 'KHT-0012', nama_produk: 'Pashmina Ceruty Baby Doll', kategori: 'Hijab', harga_beli: 45000, warna_hex: '#ec4899' },
  { id: 13, kode_produk: 'KHT-0013', nama_produk: 'Hijab Voal Ultrafine', kategori: 'Hijab', harga_beli: 65000, warna_hex: '#a855f7' },
  { id: 14, kode_produk: 'KHT-0014', nama_produk: 'Scarf Signature Floral', kategori: 'Hijab', harga_beli: 75000, warna_hex: '#e11d48' },
  { id: 15, kode_produk: 'KHT-0015', nama_produk: 'Kemeja Koko Modern', kategori: 'Atasan', harga_beli: 135000, warna_hex: '#059669' },
  { id: 16, kode_produk: 'KHT-0016', nama_produk: 'Outer Batik Solo', kategori: 'Atasan', harga_beli: 195000, warna_hex: '#b45309' },
  { id: 17, kode_produk: 'KHT-0017', nama_produk: 'Jaket Bomber Hitam', kategori: 'Atasan', harga_beli: 220000, warna_hex: '#111827' },
  { id: 18, kode_produk: 'KHT-0018', nama_produk: 'Sling Bag Mini Leather', kategori: 'Aksesoris', harga_beli: 250000, warna_hex: '#000000' },
  { id: 19, kode_produk: 'KHT-0019', nama_produk: 'Flat Shoes Kahita Elegant', kategori: 'Aksesoris', harga_beli: 180000, warna_hex: '#f59e0b' },
  { id: 20, kode_produk: 'KHT-0020', nama_produk: 'Belt Kulit Casual', kategori: 'Aksesoris', harga_beli: 50000, warna_hex: '#451a03' }
];

// Helper to determine status based on total_stok vs stok_minimum
const getStatus = (total, min) => {
  if (total <= 0) return 'habis';
  if (total < min) return 'menipis';
  return 'normal';
};

// Generate stock data per outlet with variation
export const outletStok = {
  denpasar: productTemplates.map((p, idx) => {
    const total = 50 + (idx * 5); // Denpasar has high stocks
    const min = 15;
    return {
      ...p,
      foto_color: p.warna_hex,
      varian: [
        { ukuran: 'S', warna: p.warna_hex, stok: Math.floor(total * 0.3), sku: `${p.kode_produk}-S` },
        { ukuran: 'M', warna: p.warna_hex, stok: Math.floor(total * 0.4), sku: `${p.kode_produk}-M` },
        { ukuran: 'L', warna: p.warna_hex, stok: total - Math.floor(total * 0.3) - Math.floor(total * 0.4), sku: `${p.kode_produk}-L` },
      ],
      total_stok: total,
      stok_minimum: min,
      tgl_terakhir_masuk: '2026-05-20',
      tgl_terakhir_terjual: '2026-05-28',
      status: getStatus(total, min)
    };
  }),

  jakarta: productTemplates.map((p, idx) => {
    const total = 30 + (idx * 3); // Jakarta has medium stock
    const min = 12;
    return {
      ...p,
      foto_color: p.warna_hex,
      varian: [
        { ukuran: 'S', warna: p.warna_hex, stok: Math.floor(total * 0.3), sku: `${p.kode_produk}-S` },
        { ukuran: 'M', warna: p.warna_hex, stok: Math.floor(total * 0.4), sku: `${p.kode_produk}-M` },
        { ukuran: 'L', warna: p.warna_hex, stok: total - Math.floor(total * 0.3) - Math.floor(total * 0.4), sku: `${p.kode_produk}-L` },
      ],
      total_stok: total,
      stok_minimum: min,
      tgl_terakhir_masuk: '2026-05-22',
      tgl_terakhir_terjual: '2026-05-27',
      status: getStatus(total, min)
    };
  }),

  bandung: productTemplates.map((p, idx) => {
    // Bandung has medium stock with some low stock items (e.g. index 3, 7, 12, 18)
    const isLow = [3, 7, 12, 18].includes(idx);
    const total = isLow ? 6 : 25 + (idx * 2);
    const min = 10;
    return {
      ...p,
      foto_color: p.warna_hex,
      varian: [
        { ukuran: 'S', warna: p.warna_hex, stok: Math.floor(total * 0.3), sku: `${p.kode_produk}-S` },
        { ukuran: 'M', warna: p.warna_hex, stok: Math.floor(total * 0.4), sku: `${p.kode_produk}-M` },
        { ukuran: 'L', warna: p.warna_hex, stok: total - Math.floor(total * 0.3) - Math.floor(total * 0.4), sku: `${p.kode_produk}-L` },
      ],
      total_stok: total,
      stok_minimum: min,
      tgl_terakhir_masuk: '2026-05-24',
      tgl_terakhir_terjual: '2026-05-28',
      status: getStatus(total, min)
    };
  }),

  surabaya: productTemplates.map((p, idx) => {
    // Surabaya is a new outlet, some items are out of stock (index 2, 8, 14) and others are low
    const isOut = [2, 8, 14].includes(idx);
    const isLow = [5, 11, 17].includes(idx);
    const total = isOut ? 0 : (isLow ? 4 : 15 + idx);
    const min = 8;
    return {
      ...p,
      foto_color: p.warna_hex,
      varian: [
        { ukuran: 'S', warna: p.warna_hex, stok: Math.floor(total * 0.3), sku: `${p.kode_produk}-S` },
        { ukuran: 'M', warna: p.warna_hex, stok: Math.floor(total * 0.4), sku: `${p.kode_produk}-M` },
        { ukuran: 'L', warna: p.warna_hex, stok: total - Math.floor(total * 0.3) - Math.floor(total * 0.4), sku: `${p.kode_produk}-L` },
      ],
      total_stok: total,
      stok_minimum: min,
      tgl_terakhir_masuk: '2026-05-25',
      tgl_terakhir_terjual: '2026-05-28',
      status: getStatus(total, min)
    };
  })
};

// 2. penerimaanDariGudang per outlet
export const penerimaanDariGudang = {
  denpasar: [
    {
      id: 1,
      nomor_do: 'DO-20260520-001',
      nomor_terima: 'TR-20260520-001',
      tgl_kirim_gudang: '2026-05-18',
      tgl_terima_outlet: '2026-05-20',
      items: [
        { produk_id: 1, nama: 'Kemeja Flanel Kahita', ukuran: 'M', warna: '#ef4444', qty_kirim: 20, qty_terima: 20, catatan: 'Sesuai DO' },
        { produk_id: 2, nama: 'Blouse Silk Putih', ukuran: 'L', warna: '#f8fafc', qty_kirim: 15, qty_terima: 15, catatan: 'Sesuai DO' }
      ],
      total_item: 2,
      total_qty: 35,
      status: 'diterima',
      diterima_oleh: 'Staff Denpasar'
    },
    {
      id: 2,
      nomor_do: 'DO-20260527-003',
      nomor_terima: null,
      tgl_kirim_gudang: '2026-05-27',
      tgl_terima_outlet: null,
      items: [
        { produk_id: 3, nama: 'Tunic Linen Kasual', ukuran: 'S', warna: '#d97706', qty_kirim: 25, qty_terima: 0, catatan: '' },
        { produk_id: 4, nama: 'Kaos Polo Premium', ukuran: 'M', warna: '#1e3a8a', qty_kirim: 30, qty_terima: 0, catatan: '' }
      ],
      total_item: 2,
      total_qty: 55,
      status: 'menunggu',
      diterima_oleh: null
    }
  ],
  jakarta: [
    {
      id: 1,
      nomor_do: 'DO-20260522-001',
      nomor_terima: 'TR-20260522-001',
      tgl_kirim_gudang: '2026-05-20',
      tgl_terima_outlet: '2026-05-22',
      items: [
        { produk_id: 5, nama: 'Cardigan Rajut Oversize', ukuran: 'M', warna: '#6b7280', qty_kirim: 10, qty_terima: 10, catatan: 'Sesuai DO' },
        { produk_id: 6, nama: 'Celana Chino Slimfit', ukuran: 'L', warna: '#78350f', qty_kirim: 12, qty_terima: 10, catatan: '2 pcs reject robek' }
      ],
      total_item: 2,
      total_qty: 22,
      status: 'sebagian',
      diterima_oleh: 'Supervisor Jakarta'
    },
    {
      id: 2,
      nomor_do: 'DO-20260528-001',
      nomor_terima: null,
      tgl_kirim_gudang: '2026-05-28',
      tgl_terima_outlet: null,
      items: [
        { produk_id: 8, nama: 'Denim Pants Klasik', ukuran: 'M', warna: '#2563eb', qty_kirim: 15, qty_terima: 0, catatan: '' }
      ],
      total_item: 1,
      total_qty: 15,
      status: 'menunggu',
      diterima_oleh: null
    }
  ],
  bandung: [
    {
      id: 1,
      nomor_do: 'DO-20260524-001',
      nomor_terima: 'TR-20260524-001',
      tgl_kirim_gudang: '2026-05-22',
      tgl_terima_outlet: '2026-05-24',
      items: [
        { produk_id: 9, nama: 'Culotte Pants Highwaist', ukuran: 'S', warna: '#0f766e', qty_kirim: 20, qty_terima: 20, catatan: 'Kondisi baik' }
      ],
      total_item: 1,
      total_qty: 20,
      status: 'diterima',
      diterima_oleh: 'Staff Bandung'
    },
    {
      id: 2,
      nomor_do: 'DO-20260528-005',
      nomor_terima: null,
      tgl_kirim_gudang: '2026-05-28',
      tgl_terima_outlet: null,
      items: [
        { produk_id: 13, nama: 'Hijab Voal Ultrafine', ukuran: 'M', warna: '#a855f7', qty_kirim: 40, qty_terima: 0, catatan: '' }
      ],
      total_item: 1,
      total_qty: 40,
      status: 'menunggu',
      diterima_oleh: null
    }
  ],
  surabaya: [
    {
      id: 1,
      nomor_do: 'DO-20260525-001',
      nomor_terima: 'TR-20260525-001',
      tgl_kirim_gudang: '2026-05-23',
      tgl_terima_outlet: '2026-05-25',
      items: [
        { produk_id: 14, nama: 'Scarf Signature Floral', ukuran: 'M', warna: '#e11d48', qty_kirim: 15, qty_terima: 15, catatan: 'Lengkap' }
      ],
      total_item: 1,
      total_qty: 15,
      status: 'diterima',
      diterima_oleh: 'Staff Surabaya'
    },
    {
      id: 2,
      nomor_do: 'DO-20260528-009',
      nomor_terima: null,
      tgl_kirim_gudang: '2026-05-28',
      tgl_terima_outlet: null,
      items: [
        { produk_id: 18, nama: 'Sling Bag Mini Leather', ukuran: 'L', warna: '#000000', qty_kirim: 10, qty_terima: 0, catatan: '' }
      ],
      total_item: 1,
      total_qty: 10,
      status: 'menunggu',
      diterima_oleh: null
    }
  ]
};

// 3. transferAntar[] - 10 records with combinations
export const transferAntar = [
  {
    id: 1,
    nomor_transfer: 'TF-20260522-001',
    outlet_asal_id: 'denpasar',
    outlet_asal_nama: 'Outlet Denpasar',
    outlet_tujuan_id: 'jakarta',
    outlet_tujuan_nama: 'Outlet Jakarta',
    tgl_transfer: '2026-05-20',
    tgl_diterima: '2026-05-22',
    items: [{ produk_id: 1, nama: 'Kemeja Flanel Kahita', ukuran: 'M', warna: '#ef4444', qty: 10 }],
    total_item: 1,
    total_qty: 10,
    alasan: 'permintaan',
    status: 'diterima',
    dibuat_oleh: 'Budi (Denpasar)'
  },
  {
    id: 2,
    nomor_transfer: 'TF-20260523-002',
    outlet_asal_id: 'jakarta',
    outlet_asal_nama: 'Outlet Jakarta',
    outlet_tujuan_id: 'bandung',
    outlet_tujuan_nama: 'Outlet Bandung',
    tgl_transfer: '2026-05-22',
    tgl_diterima: '2026-05-23',
    items: [{ produk_id: 5, nama: 'Cardigan Rajut Oversize', ukuran: 'L', warna: '#6b7280', qty: 5 }],
    total_item: 1,
    total_qty: 5,
    alasan: 'kelebihan stok',
    status: 'diterima',
    dibuat_oleh: 'Santi (Jakarta)'
  },
  {
    id: 3,
    nomor_transfer: 'TF-20260525-003',
    outlet_asal_id: 'denpasar',
    outlet_asal_nama: 'Outlet Denpasar',
    outlet_tujuan_id: 'surabaya',
    outlet_tujuan_nama: 'Outlet Surabaya',
    tgl_transfer: '2026-05-24',
    tgl_diterima: '2026-05-25',
    items: [
      { produk_id: 10, nama: 'Dress Katun Motif', ukuran: 'S', warna: '#be185d', qty: 10 },
      { produk_id: 12, nama: 'Pashmina Ceruty Baby Doll', ukuran: 'M', warna: '#ec4899', qty: 20 }
    ],
    total_item: 2,
    total_qty: 30,
    alasan: 'darurat',
    status: 'diterima',
    dibuat_oleh: 'Budi (Denpasar)'
  },
  {
    id: 4,
    nomor_transfer: 'TF-20260526-004',
    outlet_asal_id: 'bandung',
    outlet_asal_nama: 'Outlet Bandung',
    outlet_tujuan_id: 'surabaya',
    outlet_tujuan_nama: 'Outlet Surabaya',
    tgl_transfer: '2026-05-26',
    tgl_diterima: null,
    items: [{ produk_id: 13, nama: 'Hijab Voal Ultrafine', ukuran: 'S', warna: '#a855f7', qty: 15 }],
    total_item: 1,
    total_qty: 15,
    alasan: 'darurat',
    status: 'dikirim',
    dibuat_oleh: 'Lina (Bandung)'
  },
  {
    id: 5,
    nomor_transfer: 'TF-20260528-005',
    outlet_asal_id: 'denpasar',
    outlet_asal_nama: 'Outlet Denpasar',
    outlet_tujuan_id: 'jakarta',
    outlet_tujuan_nama: 'Outlet Jakarta',
    tgl_transfer: '2026-05-28',
    tgl_diterima: null,
    items: [{ produk_id: 15, nama: 'Kemeja Koko Modern', ukuran: 'M', warna: '#059669', qty: 8 }],
    total_item: 1,
    total_qty: 8,
    alasan: 'permintaan',
    status: 'menunggu_konfirmasi',
    dibuat_oleh: 'Budi (Denpasar)'
  },
  {
    id: 6,
    nomor_transfer: 'TF-20260528-006',
    outlet_asal_id: 'jakarta',
    outlet_asal_nama: 'Outlet Jakarta',
    outlet_tujuan_id: 'surabaya',
    outlet_tujuan_nama: 'Outlet Surabaya',
    tgl_transfer: '2026-05-28',
    tgl_diterima: null,
    items: [{ produk_id: 7, nama: 'Rok Plisket Panjang', ukuran: 'M', warna: '#db2777', qty: 12 }],
    total_item: 1,
    total_qty: 12,
    alasan: 'kelebihan stok',
    status: 'menunggu_konfirmasi',
    dibuat_oleh: 'Santi (Jakarta)'
  },
  {
    id: 7,
    nomor_transfer: 'TF-20260527-007',
    outlet_asal_id: 'surabaya',
    outlet_asal_nama: 'Outlet Surabaya',
    outlet_tujuan_id: 'denpasar',
    outlet_tujuan_nama: 'Outlet Denpasar',
    tgl_transfer: '2026-05-27',
    tgl_diterima: null,
    items: [{ produk_id: 19, nama: 'Flat Shoes Kahita Elegant', ukuran: 'M', warna: '#f59e0b', qty: 5 }],
    total_item: 1,
    total_qty: 5,
    alasan: 'kelebihan stok',
    status: 'dikirim',
    dibuat_oleh: 'Rudi (Surabaya)'
  },
  {
    id: 8,
    nomor_transfer: 'TF-20260528-008',
    outlet_asal_id: 'bandung',
    outlet_asal_nama: 'Outlet Bandung',
    outlet_tujuan_id: 'denpasar',
    outlet_tujuan_nama: 'Outlet Denpasar',
    tgl_transfer: '2026-05-28',
    tgl_diterima: null,
    items: [{ produk_id: 14, nama: 'Scarf Signature Floral', ukuran: 'S', warna: '#e11d48', qty: 10 }],
    total_item: 1,
    total_qty: 10,
    alasan: 'permintaan',
    status: 'menunggu_konfirmasi',
    dibuat_oleh: 'Lina (Bandung)'
  },
  {
    id: 9,
    nomor_transfer: 'TF-20260528-009',
    outlet_asal_id: 'surabaya',
    outlet_asal_nama: 'Outlet Surabaya',
    outlet_tujuan_id: 'jakarta',
    outlet_tujuan_nama: 'Outlet Jakarta',
    tgl_transfer: '2026-05-28',
    tgl_diterima: null,
    items: [{ produk_id: 17, nama: 'Jaket Bomber Hitam', ukuran: 'L', warna: '#111827', qty: 4 }],
    total_item: 1,
    total_qty: 4,
    alasan: 'permintaan',
    status: 'menunggu_konfirmasi',
    dibuat_oleh: 'Rudi (Surabaya)'
  },
  {
    id: 10,
    nomor_transfer: 'TF-20260528-010',
    outlet_asal_id: 'bandung',
    outlet_asal_nama: 'Outlet Bandung',
    outlet_tujuan_id: 'jakarta',
    outlet_tujuan_nama: 'Outlet Jakarta',
    tgl_transfer: '2026-05-28',
    tgl_diterima: null,
    items: [{ produk_id: 6, nama: 'Celana Chino Slimfit', ukuran: 'M', warna: '#78350f', qty: 6 }],
    total_item: 1,
    total_qty: 6,
    alasan: 'kelebihan stok',
    status: 'menunggu_konfirmasi',
    dibuat_oleh: 'Lina (Bandung)'
  }
];

// 4. returKeGudang{} per outlet
export const returKeGudang = {
  denpasar: [
    {
      id: 1,
      nomor_retur: 'RO-20260515-001',
      outlet_id: 'denpasar',
      outlet_nama: 'Outlet Denpasar',
      tgl_retur: '2026-05-15',
      alasan: 'cacat',
      items: [{ produk_id: 2, nama: 'Blouse Silk Putih', ukuran: 'M', warna: '#f8fafc', qty: 2 }],
      total_item: 1,
      total_qty: 2,
      status: 'diterima_gudang',
      catatan: 'Diterima, diganti stock baru'
    },
    {
      id: 2,
      nomor_retur: 'RO-20260528-002',
      outlet_id: 'denpasar',
      outlet_nama: 'Outlet Denpasar',
      tgl_retur: '2026-05-28',
      alasan: 'kelebihan stok',
      items: [{ produk_id: 4, nama: 'Kaos Polo Premium', ukuran: 'L', warna: '#1e3a8a', qty: 15 }],
      total_item: 1,
      total_qty: 15,
      status: 'diajukan',
      catatan: 'Kelebihan stok warna navy'
    }
  ],
  jakarta: [
    {
      id: 1,
      nomor_retur: 'RO-20260522-001',
      outlet_id: 'jakarta',
      outlet_nama: 'Outlet Jakarta',
      tgl_retur: '2026-05-22',
      alasan: 'cacat',
      items: [{ produk_id: 6, nama: 'Celana Chino Slimfit', ukuran: 'L', warna: '#78350f', qty: 2 }],
      total_item: 1,
      total_qty: 2,
      status: 'diproses',
      catatan: '2 pcs reject jahitan paha robek'
    }
  ],
  bandung: [
    {
      id: 1,
      nomor_retur: 'RO-20260510-001',
      outlet_id: 'bandung',
      outlet_nama: 'Outlet Bandung',
      tgl_retur: '2026-05-10',
      alasan: 'tidak laku',
      items: [{ produk_id: 7, nama: 'Rok Plisket Panjang', ukuran: 'S', warna: '#db2777', qty: 5 }],
      total_item: 1,
      total_qty: 5,
      status: 'diterima_gudang',
      catatan: 'Warna pink kurang diminati di Bandung'
    }
  ],
  surabaya: [
    {
      id: 1,
      nomor_retur: 'RO-20260526-001',
      outlet_id: 'surabaya',
      outlet_nama: 'Outlet Surabaya',
      tgl_retur: '2026-05-26',
      alasan: 'salah kirim',
      items: [{ produk_id: 20, nama: 'Belt Kulit Casual', ukuran: 'S', warna: '#451a03', qty: 10 }],
      total_item: 1,
      total_qty: 10,
      status: 'diproses',
      catatan: 'Seharusnya dikirim Belt Black'
    }
  ]
};

// 5. opnameOutlet{} per outlet
export const opnameOutlet = {
  denpasar: [
    {
      id: 1,
      nomor_opname: 'OPO-20260501-001',
      outlet_id: 'denpasar',
      tgl_mulai: '2026-05-01',
      tgl_selesai: '2026-05-01',
      status: 'selesaim',
      status: 'selesai',
      items: [
        { produk_id: 1, nama: 'Kemeja Flanel Kahita', ukuran: 'M', warna: '#ef4444', stok_sistem: 30, stok_fisik: 30, selisih: 0, keterangan: 'Cocok' },
        { produk_id: 2, nama: 'Blouse Silk Putih', ukuran: 'L', warna: '#f8fafc', stok_sistem: 20, stok_fisik: 19, selisih: -1, keterangan: 'Kurang 1 pcs' }
      ],
      total_item: 2,
      total_selisih_plus: 0,
      total_selisih_minus: 1,
      dilakukan_oleh: 'Budi Arga'
    }
  ],
  jakarta: [
    {
      id: 1,
      nomor_opname: 'OPO-20260502-001',
      outlet_id: 'jakarta',
      tgl_mulai: '2026-05-02',
      tgl_selesai: '2026-05-02',
      status: 'selesai',
      items: [
        { produk_id: 5, nama: 'Cardigan Rajut Oversize', ukuran: 'L', warna: '#6b7280', stok_sistem: 15, stok_fisik: 16, selisih: 1, keterangan: 'Kelebihan 1 pcs' }
      ],
      total_item: 1,
      total_selisih_plus: 1,
      total_selisih_minus: 0,
      dilakukan_oleh: 'Siti Rahma'
    }
  ],
  bandung: [
    {
      id: 1,
      nomor_opname: 'OPO-20260515-001',
      outlet_id: 'bandung',
      tgl_mulai: '2026-05-15',
      tgl_selesai: '2026-05-15',
      status: 'selesai',
      items: [
        { produk_id: 7, nama: 'Rok Plisket Panjang', ukuran: 'S', warna: '#db2777', stok_sistem: 10, stok_fisik: 10, selisih: 0, keterangan: 'Cocok' }
      ],
      total_item: 1,
      total_selisih_plus: 0,
      total_selisih_minus: 0,
      dilakukan_oleh: 'Lina Marlina'
    }
  ],
  surabaya: [
    {
      id: 1,
      nomor_opname: 'OPO-20260527-001',
      outlet_id: 'surabaya',
      tgl_mulai: '2026-05-27',
      tgl_selesai: null,
      status: 'berlangsung',
      items: [
        { produk_id: 14, nama: 'Scarf Signature Floral', ukuran: 'M', warna: '#e11d48', stok_sistem: 15, stok_fisik: 15, selisih: 0, keterangan: '' }
      ],
      total_item: 1,
      total_selisih_plus: 0,
      total_selisih_minus: 0,
      dilakukan_oleh: 'Rudi Hartono'
    }
  ]
};

// 6. outletStatsAll
export const outletStatsAll = {
  denpasar: {
    total_sku: outletStok.denpasar.length,
    total_stok: outletStok.denpasar.reduce((a, p) => a + p.total_stok, 0),
    nilai_stok: outletStok.denpasar.reduce((a, p) => a + p.total_stok * p.harga_beli, 0),
    menipis: outletStok.denpasar.filter(p => p.status === 'menipis').length,
    habis: outletStok.denpasar.filter(p => p.status === 'habis').length,
    pending_terima: penerimaanDariGudang.denpasar.filter(p => p.status === 'menunggu').length,
  },
  jakarta: {
    total_sku: outletStok.jakarta.length,
    total_stok: outletStok.jakarta.reduce((a, p) => a + p.total_stok, 0),
    nilai_stok: outletStok.jakarta.reduce((a, p) => a + p.total_stok * p.harga_beli, 0),
    menipis: outletStok.jakarta.filter(p => p.status === 'menipis').length,
    habis: outletStok.jakarta.filter(p => p.status === 'habis').length,
    pending_terima: penerimaanDariGudang.jakarta.filter(p => p.status === 'menunggu').length,
  },
  bandung: {
    total_sku: outletStok.bandung.length,
    total_stok: outletStok.bandung.reduce((a, p) => a + p.total_stok, 0),
    nilai_stok: outletStok.bandung.reduce((a, p) => a + p.total_stok * p.harga_beli, 0),
    menipis: outletStok.bandung.filter(p => p.status === 'menipis').length,
    habis: outletStok.bandung.filter(p => p.status === 'habis').length,
    pending_terima: penerimaanDariGudang.bandung.filter(p => p.status === 'menunggu').length,
  },
  surabaya: {
    total_sku: outletStok.surabaya.length,
    total_stok: outletStok.surabaya.reduce((a, p) => a + p.total_stok, 0),
    nilai_stok: outletStok.surabaya.reduce((a, p) => a + p.total_stok * p.harga_beli, 0),
    menipis: outletStok.surabaya.filter(p => p.status === 'menipis').length,
    habis: outletStok.surabaya.filter(p => p.status === 'habis').length,
    pending_terima: penerimaanDariGudang.surabaya.filter(p => p.status === 'menunggu').length,
  }
};

// 7. perbandinganStok[]
export const perbandinganStok = [
  { tanggal: '22 Mei', denpasar: 1800, jakarta: 1100, bandung: 890, surabaya: 200 },
  { tanggal: '23 Mei', denpasar: 1850, jakarta: 1120, bandung: 870, surabaya: 210 },
  { tanggal: '24 Mei', denpasar: 1900, jakarta: 1150, bandung: 860, surabaya: 250 },
  { tanggal: '25 Mei', denpasar: 1910, jakarta: 1180, bandung: 880, surabaya: 280 },
  { tanggal: '26 Mei', denpasar: 1940, jakarta: 1200, bandung: 910, surabaya: 300 },
  { tanggal: '27 Mei', denpasar: 1960, jakarta: 1220, bandung: 930, surabaya: 310 },
  { tanggal: '28 Mei', denpasar: 2050, jakarta: 1250, bandung: 940, surabaya: 330 }
];
