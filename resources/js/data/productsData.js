// resources/js/data/productsData.js

export const categoriesData = {
  'Atasan': ['Blouse', 'Kemeja', 'Kaos', 'Tunik', 'Cardigan'],
  'Bawahan': ['Celana', 'Rok', 'Kulot'],
  'Dress': ['Midi Dress', 'Maxi Dress', 'Mini Dress'],
  'Outer': ['Jaket', 'Blazer', 'Vest', 'Coat'],
  'Gamis & Hijab': ['Gamis', 'Set Gamis', 'Hijab Segiempat', 'Pashmina'],
  'Aksesoris': ['Tas', 'Ikat Pinggang', 'Kalung', 'Bros']
};

export const outletsList = [
  { id: 'denpasar', name: 'Outlet Denpasar' },
  { id: 'jakarta', name: 'Outlet Jakarta' },
  { id: 'bandung', name: 'Outlet Bandung' },
  { id: 'surabaya', name: 'Outlet Surabaya' }
];

export const dummyProducts = [
  {
    id: 1,
    kode_produk: 'KHT-0001',
    nama_produk: 'Blouse Batik Prada',
    kategori: 'Atasan',
    sub_kategori: 'Blouse',
    deskripsi: 'Blouse batik dengan bahan katun prada premium, sangat elegan dan nyaman untuk kerja maupun acara formal.',
    harga_beli: 110000,
    harga_jual: 185000,
    diskon: 10,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta'],
    varian: [
      { ukuran: 'S', warna: { nama: 'Emas', hex: '#D4AF37' }, stok: 15, sku: 'KHT-0001-S-EM' },
      { ukuran: 'M', warna: { nama: 'Emas', hex: '#D4AF37' }, stok: 20, sku: 'KHT-0001-M-EM' },
      { ukuran: 'L', warna: { nama: 'Hitam', hex: '#1A1A1A' }, stok: 4, sku: 'KHT-0001-L-HT' },
      { ukuran: 'XL', warna: { nama: 'Hitam', hex: '#1A1A1A' }, stok: 2, sku: 'KHT-0001-XL-HT' }
    ],
    total_stok: 41,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-05-15T10:30:00Z'
  },
  {
    id: 2,
    kode_produk: 'KHT-0002',
    nama_produk: 'Maxi Dress Floral Elegan',
    kategori: 'Dress',
    sub_kategori: 'Maxi Dress',
    deskripsi: 'Dress panjang bermotif bunga lembut dengan bahan sifon berkualitas tinggi dilengkapi furing penuh.',
    harga_beli: 190000,
    harga_jual: 320000,
    diskon: 15,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'M', warna: { nama: 'Pink Dusty', hex: '#DCAE96' }, stok: 8, sku: 'KHT-0002-M-PD' },
      { ukuran: 'L', warna: { nama: 'Pink Dusty', hex: '#DCAE96' }, stok: 10, sku: 'KHT-0002-L-PD' },
      { ukuran: 'XL', warna: { nama: 'Navy', hex: '#1A2E40' }, stok: 5, sku: 'KHT-0002-XL-NV' }
    ],
    total_stok: 23,
    created_at: '2026-02-12T09:00:00Z',
    updated_at: '2026-05-20T14:15:00Z'
  },
  {
    id: 3,
    kode_produk: 'KHT-0003',
    nama_produk: 'Kemeja Linen Premium',
    kategori: 'Atasan',
    sub_kategori: 'Kemeja',
    deskripsi: 'Kemeja kasual berbahan pure linen yang adem dan menyerap keringat. Cocok untuk tampilan smart-casual.',
    harga_beli: 130000,
    harga_jual: 225000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['jakarta', 'bandung'],
    varian: [
      { ukuran: 'M', warna: { nama: 'Putih Tulang', hex: '#F9F6EE' }, stok: 12, sku: 'KHT-0003-M-PT' },
      { ukuran: 'L', warna: { nama: 'Putih Tulang', hex: '#F9F6EE' }, stok: 15, sku: 'KHT-0003-L-PT' },
      { ukuran: 'XL', warna: { nama: 'Olive', hex: '#556B2F' }, stok: 8, sku: 'KHT-0003-XL-OL' }
    ],
    total_stok: 35,
    created_at: '2026-02-15T11:00:00Z',
    updated_at: '2026-04-10T16:00:00Z'
  },
  {
    id: 4,
    kode_produk: 'KHT-0004',
    nama_produk: 'Kulot Plisket Rayon',
    kategori: 'Bawahan',
    sub_kategori: 'Kulot',
    deskripsi: 'Celana kulot dengan plisket rapi, menggunakan bahan rayon super yang jatuh dan dingin dipakai.',
    harga_beli: 100000,
    harga_jual: 195000,
    diskon: 20,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'surabaya'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Hitam', hex: '#000000' }, stok: 30, sku: 'KHT-0004-FS-HT' },
      { ukuran: 'Free Size', warna: { nama: 'Mocca', hex: '#A38A75' }, stok: 25, sku: 'KHT-0004-FS-MC' }
    ],
    total_stok: 55,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-05-18T09:00:00Z'
  },
  {
    id: 5,
    kode_produk: 'KHT-0005',
    nama_produk: 'Gamis Syari Ceruti',
    kategori: 'Gamis & Hijab',
    sub_kategori: 'Gamis',
    deskripsi: 'Gamis anggun berbahan ceruti baby doll premium dengan potongan payung lebar, dilapisi furing kaos.',
    harga_beli: 220000,
    harga_jual: 375000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'M', warna: { nama: 'Lavender', hex: '#E6E6FA' }, stok: 3, sku: 'KHT-0005-M-LV' },
      { ukuran: 'L', warna: { nama: 'Lavender', hex: '#E6E6FA' }, stok: 1, sku: 'KHT-0005-L-LV' },
      { ukuran: 'XL', warna: { nama: 'Maroon', hex: '#800000' }, stok: 0, sku: 'KHT-0005-XL-MR' }
    ],
    total_stok: 4, // Menipis (<5)
    created_at: '2026-03-05T14:00:00Z',
    updated_at: '2026-05-25T11:45:00Z'
  },
  {
    id: 6,
    kode_produk: 'KHT-0006',
    nama_produk: 'Blazer Wanita Formal',
    kategori: 'Outer',
    sub_kategori: 'Blazer',
    deskripsi: 'Outer blazer berstruktur dengan busa pundak tipis dan lapisan satin furing. Sangat rapi untuk karir profesional.',
    harga_beli: 165000,
    harga_jual: 289000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'S', warna: { nama: 'Abu Tua', hex: '#4A4A4A' }, stok: 10, sku: 'KHT-0006-S-AT' },
      { ukuran: 'M', warna: { nama: 'Abu Tua', hex: '#4A4A4A' }, stok: 12, sku: 'KHT-0006-M-AT' },
      { ukuran: 'L', warna: { nama: 'Hitam', hex: '#1C1C1C' }, stok: 8, sku: 'KHT-0006-L-HT' }
    ],
    total_stok: 30,
    created_at: '2026-03-10T09:30:00Z',
    updated_at: '2026-04-20T10:15:00Z'
  },
  {
    id: 7,
    kode_produk: 'KHT-0007',
    nama_produk: 'Hijab Segiempat Voal Ultra',
    kategori: 'Gamis & Hijab',
    sub_kategori: 'Hijab Segiempat',
    deskripsi: 'Hijab voal premium berukuran 115x115cm dengan laser cut tepi, tegak di dahi dan tidak pekak di telinga.',
    harga_beli: 45000,
    harga_jual: 89000,
    diskon: 30,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Denim Blue', hex: '#4F6F8F' }, stok: 50, sku: 'KHT-0007-FS-DB' },
      { ukuran: 'Free Size', warna: { nama: 'Cream', hex: '#F5F5DC' }, stok: 45, sku: 'KHT-0007-FS-CR' },
      { ukuran: 'Free Size', warna: { nama: 'Milo', hex: '#827064' }, stok: 40, sku: 'KHT-0007-FS-ML' }
    ],
    total_stok: 135,
    created_at: '2026-03-12T13:00:00Z',
    updated_at: '2026-05-24T15:30:00Z'
  },
  {
    id: 8,
    kode_produk: 'KHT-0008',
    nama_produk: 'Rok Plisket A-Line',
    kategori: 'Bawahan',
    sub_kategori: 'Rok',
    deskripsi: 'Rok panjang dengan plisket flare melebar (A-line) yang anggun. Pinggang karet elastis nyaman.',
    harga_beli: 95000,
    harga_jual: 169000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'bandung'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Cokelat Milo', hex: '#AB8E78' }, stok: 3, sku: 'KHT-0008-FS-CM' },
      { ukuran: 'Free Size', warna: { nama: 'Navy', hex: '#1E2D4A' }, stok: 1, sku: 'KHT-0008-FS-NV' }
    ],
    total_stok: 4, // Menipis (<5)
    created_at: '2026-03-15T08:20:00Z',
    updated_at: '2026-05-10T12:00:00Z'
  },
  {
    id: 9,
    kode_produk: 'KHT-0009',
    nama_produk: 'Tunik Crinkle Airflow',
    kategori: 'Atasan',
    sub_kategori: 'Tunik',
    deskripsi: 'Tunik cantik dengan tekstur crinkle airflow premium yang ironless (tidak perlu disetrika). Wudhu friendly.',
    harga_beli: 110000,
    harga_jual: 198000,
    diskon: 10,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'surabaya'],
    varian: [
      { ukuran: 'M', warna: { nama: 'Sage Green', hex: '#9C9F84' }, stok: 15, sku: 'KHT-0009-M-SG' },
      { ukuran: 'L', warna: { nama: 'Sage Green', hex: '#9C9F84' }, stok: 18, sku: 'KHT-0009-L-SG' },
      { ukuran: 'XL', warna: { nama: 'Dusty Pink', hex: '#D29C9C' }, stok: 12, sku: 'KHT-0009-XL-DP' }
    ],
    total_stok: 45,
    created_at: '2026-03-20T10:45:00Z',
    updated_at: '2026-05-12T16:20:00Z'
  },
  {
    id: 10,
    kode_produk: 'KHT-0010',
    nama_produk: 'Midi Dress Casual Rayon',
    kategori: 'Dress',
    sub_kategori: 'Midi Dress',
    deskripsi: 'Midi dress harian dengan kancing depan penuh (busui friendly), bahan katun rayon adem maksimal.',
    harga_beli: 115000,
    harga_jual: 189000,
    diskon: 0,
    status: 'nonaktif',
    outlet_tersedia: ['jakarta', 'surabaya'],
    varian: [
      { ukuran: 'M', warna: { nama: 'Terracotta', hex: '#C25A3F' }, stok: 12, sku: 'KHT-0010-M-TC' },
      { ukuran: 'L', warna: { nama: 'Terracotta', hex: '#C25A3F' }, stok: 14, sku: 'KHT-0010-L-TC' }
    ],
    total_stok: 26,
    created_at: '2026-03-25T11:00:00Z',
    updated_at: '2026-05-01T09:30:00Z'
  },
  {
    id: 11,
    kode_produk: 'KHT-0011',
    nama_produk: 'Cardigan Rajut Halus',
    kategori: 'Atasan',
    sub_kategori: 'Cardigan',
    deskripsi: 'Cardigan rajut rajutan rapat dan halus dengan aksen kancing mutiara vintage.',
    harga_beli: 85000,
    harga_jual: 149000,
    diskon: 15,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Broken White', hex: '#FDFDFC' }, stok: 0, sku: 'KHT-0011-FS-BW' }
    ],
    total_stok: 0, // Habis, status aktif tapi stok habis (akan ditampilkan status habis)
    created_at: '2026-03-28T09:00:00Z',
    updated_at: '2026-05-26T17:10:00Z'
  },
  {
    id: 12,
    kode_produk: 'KHT-0012',
    nama_produk: 'Coat Wool Musim Dingin',
    kategori: 'Outer',
    sub_kategori: 'Coat',
    deskripsi: 'Coat panjang berbahan wool tebal dilapisi satin licin, menjaga kehangatan saat bepergian ke luar negeri.',
    harga_beli: 350000,
    harga_jual: 650000,
    diskon: 20,
    status: 'aktif',
    outlet_tersedia: ['jakarta'],
    varian: [
      { ukuran: 'M', warna: { nama: 'Camel/Beige', hex: '#C19A6B' }, stok: 2, sku: 'KHT-0012-M-CB' },
      { ukuran: 'L', warna: { nama: 'Camel/Beige', hex: '#C19A6B' }, stok: 2, sku: 'KHT-0012-L-CB' }
    ],
    total_stok: 4, // Menipis
    created_at: '2026-04-01T15:20:00Z',
    updated_at: '2026-05-14T11:00:00Z'
  },
  {
    id: 13,
    kode_produk: 'KHT-0013',
    nama_produk: 'Pashmina Plisket Ceruty',
    kategori: 'Gamis & Hijab',
    sub_kategori: 'Pashmina',
    deskripsi: 'Pashmina plisket ceruty babydoll dengan lipatan plisket penuh tanpa garis tengah. Gampang dibentuk.',
    harga_beli: 35000,
    harga_jual: 69000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Lilac', hex: '#C8A2C8' }, stok: 35, sku: 'KHT-0013-FS-LL' },
      { ukuran: 'Free Size', warna: { nama: 'Mocca', hex: '#A38A75' }, stok: 40, sku: 'KHT-0013-FS-MC' },
      { ukuran: 'Free Size', warna: { nama: 'Mustard', hex: '#FFDB58' }, stok: 38, sku: 'KHT-0013-FS-MT' }
    ],
    total_stok: 113,
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-05-22T13:40:00Z'
  },
  {
    id: 14,
    kode_produk: 'KHT-0014',
    nama_produk: 'Tas Kulit Sintetis Hana',
    kategori: 'Aksesoris',
    sub_kategori: 'Tas',
    deskripsi: 'Tas tangan (handbag) wanita minimalis berbahan kulit sintetis tebal dan anti-air, dilengkapi tali panjang.',
    harga_beli: 125000,
    harga_jual: 249000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Tan/Cokelat', hex: '#D2B48C' }, stok: 1, sku: 'KHT-0014-FS-TN' },
      { ukuran: 'Free Size', warna: { nama: 'Hitam', hex: '#000000' }, stok: 1, sku: 'KHT-0014-FS-HT' }
    ],
    total_stok: 2, // Menipis
    created_at: '2026-04-10T14:30:00Z',
    updated_at: '2026-05-20T10:50:00Z'
  },
  {
    id: 15,
    kode_produk: 'KHT-0015',
    nama_produk: 'Celana Linen Culotte',
    kategori: 'Bawahan',
    sub_kategori: 'Celana',
    deskripsi: 'Celana panjang kulot linen bertekstur alami, berkaret di pinggang belakang dengan saku samping aktif.',
    harga_beli: 110000,
    harga_jual: 210000,
    diskon: 10,
    status: 'aktif',
    outlet_tersedia: ['jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'L', warna: { nama: 'Navy', hex: '#000080' }, stok: 15, sku: 'KHT-0015-L-NV' },
      { ukuran: 'XL', warna: { nama: 'Khaki', hex: '#C3B091' }, stok: 20, sku: 'KHT-0015-XL-KK' }
    ],
    total_stok: 35,
    created_at: '2026-04-12T09:00:00Z',
    updated_at: '2026-05-24T16:00:00Z'
  },
  {
    id: 16,
    kode_produk: 'KHT-0016',
    nama_produk: 'Vest Rajut V-Neck',
    kategori: 'Outer',
    sub_kategori: 'Vest',
    deskripsi: 'Rompi outer rajut bermodel kerah V. Sangat cocok dipakai di atas kemeja putih.',
    harga_beli: 60000,
    harga_jual: 115000,
    diskon: 0,
    status: 'habis', // Status habis manual
    outlet_tersedia: ['denpasar', 'jakarta', 'surabaya'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Broken White', hex: '#FDFDFC' }, stok: 0, sku: 'KHT-0016-FS-BW' }
    ],
    total_stok: 0,
    created_at: '2026-04-15T11:20:00Z',
    updated_at: '2026-05-21T09:00:00Z'
  },
  {
    id: 17,
    kode_produk: 'KHT-0017',
    nama_produk: 'Kaos Cotton Combed 30s',
    kategori: 'Atasan',
    sub_kategori: 'Kaos',
    deskripsi: 'Kaos polos katun combed 30s premium dengan jahitan rantai rapi, adem dan menyerap keringat.',
    harga_beli: 40000,
    harga_jual: 79000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'S', warna: { nama: 'Hitam', hex: '#000000' }, stok: 30, sku: 'KHT-0017-S-HT' },
      { ukuran: 'M', warna: { nama: 'Hitam', hex: '#000000' }, stok: 40, sku: 'KHT-0017-M-HT' },
      { ukuran: 'L', warna: { nama: 'Mustard', hex: '#FFDB58' }, stok: 25, sku: 'KHT-0017-L-MT' },
      { ukuran: 'XL', warna: { nama: 'Mustard', hex: '#FFDB58' }, stok: 15, sku: 'KHT-0017-XL-MT' }
    ],
    total_stok: 110,
    created_at: '2026-04-18T10:15:00Z',
    updated_at: '2026-05-25T14:00:00Z'
  },
  {
    id: 18,
    kode_produk: 'KHT-0018',
    nama_produk: 'Ikat Pinggang Kulit Ring',
    kategori: 'Aksesoris',
    sub_kategori: 'Ikat Pinggang',
    deskripsi: 'Sabuk wanita dengan ring bulat gold metal dan bahan kulit sintetis halus untuk melengkapi busana dress/blazer.',
    harga_beli: 25000,
    harga_jual: 49000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'jakarta', 'bandung', 'surabaya'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Hitam', hex: '#000000' }, stok: 8, sku: 'KHT-0018-FS-HT' },
      { ukuran: 'Free Size', warna: { nama: 'Cokelat', hex: '#8B4513' }, stok: 12, sku: 'KHT-0018-FS-CK' }
    ],
    total_stok: 20,
    created_at: '2026-04-20T09:00:00Z',
    updated_at: '2026-05-19T11:20:00Z'
  },
  {
    id: 19,
    kode_produk: 'KHT-0019',
    nama_produk: 'Kalung Etnik Nusantara',
    kategori: 'Aksesoris',
    sub_kategori: 'Kalung',
    deskripsi: 'Kalung aksesoris berdesain etnik tradisional dengan gantungan logam kuningan bakar untuk pakaian tunik/kebaya.',
    harga_beli: 30000,
    harga_jual: 65000,
    diskon: 10,
    status: 'aktif',
    outlet_tersedia: ['denpasar', 'bandung'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Kuningan', hex: '#D5A642' }, stok: 15, sku: 'KHT-0019-FS-KN' }
    ],
    total_stok: 15,
    created_at: '2026-04-22T14:00:00Z',
    updated_at: '2026-05-10T10:15:00Z'
  },
  {
    id: 20,
    kode_produk: 'KHT-0020',
    nama_produk: 'Bros Hijab Mutiara',
    kategori: 'Aksesoris',
    sub_kategori: 'Bros',
    deskripsi: 'Bros kecil mewah bertahtakan mutiara tiruan berkilau dan peniti tajam anti-sangkut untuk kerudung.',
    harga_beli: 15000,
    harga_jual: 29000,
    diskon: 0,
    status: 'aktif',
    outlet_tersedia: ['jakarta', 'surabaya'],
    varian: [
      { ukuran: 'Free Size', warna: { nama: 'Silver Mutiara', hex: '#E5E4E2' }, stok: 3, sku: 'KHT-0020-FS-SM' }
    ],
    total_stok: 3, // Menipis
    created_at: '2026-04-25T11:00:00Z',
    updated_at: '2026-05-24T09:30:00Z'
  }
];
