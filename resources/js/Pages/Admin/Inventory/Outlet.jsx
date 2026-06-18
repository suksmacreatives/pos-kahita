import React, { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useFilter } from '@/Context/FilterContext';

// Icons
import { 
  Download, Plus, Layers, ArrowUpDown, 
  AlertTriangle, Inbox,
  Store, LayoutGrid
} from 'lucide-react';

// Child Components
import OutletSelector from '@/Components/Admin/Inventory/Outlet/OutletSelector';
import OutletStatCard from '@/Components/Admin/Inventory/Outlet/OutletStatCard';
import StokPerbandinganChart from '@/Components/Admin/Inventory/Outlet/StokPerbandinganChart';
import StokOutletTable from '@/Components/Admin/Inventory/Outlet/StokOutletTable';
import PenerimaanGudangTable from '@/Components/Admin/Inventory/Outlet/PenerimaanGudangTable';
import KonfirmasiTerimaModal from '@/Components/Admin/Inventory/Outlet/KonfirmasiTerimaModal';
import TransferOutletTable from '@/Components/Admin/Inventory/Outlet/TransferOutletTable';
import FormTransferModal from '@/Components/Admin/Inventory/Outlet/FormTransferModal';
import ReturGudangTable from '@/Components/Admin/Inventory/Outlet/ReturGudangTable';
import FormReturGudangModal from '@/Components/Admin/Inventory/Outlet/FormReturGudangModal';
import StockOpnameOutletTable from '@/Components/Admin/Inventory/Outlet/StockOpnameOutletTable';
import FormOpnameOutletModal from '@/Components/Admin/Inventory/Outlet/FormOpnameOutletModal';
import LihatMutasiModal from '@/Components/Admin/Inventory/Gudang/LihatMutasiModal';

function OutletInventory() {
  const { outlet: selectedOutlet, setOutlet } = useFilter();
  const { props } = usePage();
  const {
    auth = {},
    outletStok = {},
    outletStatsAll = {},
    penerimaanList: initialPenerimaan = {},
    transferList: initialTransfer = [],
    returList: initialRetur = {},
    opnameList: initialOpname = {},
    mutasiLog: initialMutasiLog = [],
    perbandinganStok = [],
    outlets = [],
    flash
  } = props;

  const user = auth.user;
  const currentOutlet = useMemo(() => outlets.find(o => o.slug === selectedOutlet), [selectedOutlet, outlets]);

  useEffect(() => {
    if (user?.outlet_id) {
      const userOutlet = outlets.find(o => o.id === user.outlet_id);
      if (userOutlet) {
        setOutlet(userOutlet.slug);
      }
    }
  }, []);

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState('stock');

  // Modals state
  const [isTerimaOpen, setIsTerimaOpen] = useState(false);
  const [activeTerimaDo, setActiveTerimaDo] = useState(null);
  
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReturOpen, setIsReturOpen] = useState(false);
  const [isOpnameOpen, setIsOpnameOpen] = useState(false);
  const [lihatMutasi, setLihatMutasi] = useState(null);

  // Local state arrays initialized with server data to support dynamic additions/updates
  const [penerimaanList, setPenerimaanList] = useState(initialPenerimaan);
  const [transferList, setTransferList] = useState(initialTransfer);
  const [returList, setReturList] = useState(initialRetur);
  const [opnameList, setOpnameList] = useState(initialOpname);

  // Format IDR Helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Dynamic Header Info
  const headerInfo = useMemo(() => {
    if (selectedOutlet === 'all') {
      return {
        title: 'Inventory Semua Outlet',
        sub: 'Monitoring stock level gabungan dan perbandingan antar outlet Kahita Busana.',
        color: 'emerald'
      };
    }
    return {
      title: `Inventory ${currentOutlet?.nama || 'Outlet'}`,
      sub: `Kelola stok lokal, terima DO, transfer mutasi, dan stock opname di ${currentOutlet?.nama || 'outlet ini'}.`,
      color: currentOutlet?.warna || 'emerald'
    };
  }, [selectedOutlet, currentOutlet]);

  // 2. Tab Badge Counts (Pending items checking)
  const pendingTerimaCount = useMemo(() => {
    if (selectedOutlet === 'all') {
      return Object.values(penerimaanList || {}).flat().filter(p => p?.status === 'menunggu').length;
    }
    return (penerimaanList[selectedOutlet] || []).filter(p => p?.status === 'menunggu').length;
  }, [selectedOutlet, penerimaanList]);

  const pendingTransferCount = useMemo(() => {
    if (selectedOutlet === 'all') {
      return (transferList || []).filter(t => t.status === 'menunggu_konfirmasi').length;
    }
    return (transferList || []).filter(t => 
      t.status === 'menunggu_konfirmasi' && 
      (t.outlet_asal_id === selectedOutlet || t.outlet_tujuan_id === selectedOutlet)
    ).length;
  }, [selectedOutlet, transferList]);

  // 3. Dynamic Statistics calculations
  const stats = useMemo(() => {
    if (selectedOutlet !== 'all') {
      const s = outletStatsAll[selectedOutlet] || {};
      const pendingCount = (penerimaanList[selectedOutlet] || []).filter(p => p?.status === 'menunggu').length;
      return [
        { title: 'Total SKU Produk', value: `${s.total_sku || 0} item`, color: headerInfo.color, icon: Layers },
        { title: 'Total Stok Fisik', value: `${(s.total_stok || 0).toLocaleString()} pcs`, color: headerInfo.color, icon: ArrowUpDown, sub: `Est. Nilai: ${formatIDR(s.nilai_stok || 0)}` },
        { title: 'Stok Menipis / Habis', value: `${(s.menipis || 0) + (s.habis || 0)} SKU`, color: ((s.menipis || 0) + (s.habis || 0)) > 0 ? 'amber' : headerInfo.color, icon: AlertTriangle, sub: `${s.habis || 0} SKU kosong` },
        { title: 'DO Menunggu Terima', value: `${pendingCount} dokumen`, color: pendingCount > 0 ? 'blue' : headerInfo.color, icon: Inbox },
      ];
    }

    // "Semua Outlet" Mode Calculations
    const allOutletsStats = Object.values(outletStatsAll || {});
    const totalStokAll = allOutletsStats.reduce((acc, curr) => acc + (curr.total_stok || 0), 0);
    const totalPendingAll = Object.values(penerimaanList || {}).flat().filter(p => p?.status === 'menunggu').length;

    // Find outlet with highest stock
    let maxStok = 0;
    let maxOutletName = '-';
    (outlets || []).forEach(o => {
      const key = o.slug || o.id;
      const oStok = (outletStatsAll[key]?.total_stok || 0);
      if (oStok > maxStok) {
        maxStok = oStok;
        maxOutletName = o.nama;
      }
    });

    return [
      { title: 'Outlet Aktif', value: `${(outlets || []).length} Lokasi`, color: 'emerald', icon: Store },
      { title: 'Total Stok Gabungan', value: `${totalStokAll.toLocaleString()} pcs`, color: 'emerald', icon: ArrowUpDown },
      { title: 'Stok Terbanyak', value: maxOutletName, color: 'emerald', icon: LayoutGrid, sub: `${maxStok.toLocaleString()} pcs` },
      { title: 'Total DO Pending', value: `${totalPendingAll} Dokumen`, color: 'emerald', icon: Inbox },
    ];
  }, [selectedOutlet, headerInfo, penerimaanList, outletStatsAll, outlets]);

  // 3b. Filter change via Inertia router
  const navigateWithFilters = (tab) => {
    router.get(route('admin.inventory.outlet'), {
      outlet: selectedOutlet === 'all' ? undefined : selectedOutlet,
      tab,
    }, { preserveState: true, preserveScroll: true });
  };

  // 4. Action Handlers
  const handleOpenTerimaModal = (doRow) => {
    setActiveTerimaDo(doRow);
    setIsTerimaOpen(true);
  };

  const handleConfirmReceive = (confirmedData) => {
    router.post(route('admin.inventory.outlet.penerimaan.konfirmasi', {
      distributionOrder: confirmedData.id
    }), {
      items: confirmedData.items.map(it => ({
        id: it.id || it.produk_id,
        qty_terima: it.qty_terima,
        kondisi: it.kondisi || 'baik',
        catatan: it.catatan || '',
      })),
      penerima: 'Admin Outlet'
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsTerimaOpen(false);
        setActiveTerimaDo(null);
      },
      onError: (errors) => {
        alert('Gagal konfirmasi: ' + Object.values(errors).join(', '));
      }
    });
  };

  const handleCreateTransfer = (newTransfer) => {
    router.post(route('admin.inventory.outlet.transfer'), {
      outlet_asal_id: newTransfer.outlet_asal_id,
      outlet_tujuan_id: newTransfer.outlet_tujuan_id,
      tgl_transfer: newTransfer.tgl_transfer,
      alasan: newTransfer.alasan,
      catatan: newTransfer.catatan || '',
      items: newTransfer.items.map(it => ({
        product_id: it.product_id,
        product_variant_id: it.product_variant_id,
        nama: it.nama,
        ukuran: it.ukuran,
        warna: it.warna,
        qty: it.qty,
      })),
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsTransferOpen(false);
      },
      onError: (errors) => {
        alert('Gagal membuat transfer: ' + Object.values(errors).join(', '));
      }
    });
  };

  const handleCancelTransfer = (id) => {
    if (confirm('Apakah Anda yakin ingin membatalkan pengajuan transfer ini?')) {
      router.delete(route('admin.inventory.outlet.transfer.cancel', { id }), {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  const handleConfirmReceiveTransfer = (id) => {
    if (confirm('Konfirmasi bahwa barang transfer telah diterima dengan baik di outlet?')) {
      router.patch(route('admin.inventory.outlet.transfer.terima', { id }), {}, {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  const handleCreateRetur = (newRetur) => {
    router.post(route('admin.inventory.outlet.retur'), {
      outlet_id: newRetur.outlet_id,
      tgl_retur: newRetur.tgl_retur,
      alasan: newRetur.alasan,
      catatan: newRetur.catatan || '',
      items: newRetur.items.map(it => ({
        product_id: it.produk_id,
        product_variant_id: it.product_variant_id || null,
        nama: it.nama,
        ukuran: it.ukuran,
        warna: it.warna,
        qty: it.qty,
        catatan: it.catatan || '',
      })),
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsReturOpen(false);
      },
      onError: (errors) => {
        alert('Gagal membuat retur: ' + Object.values(errors).join(', '));
      }
    });
  };

  const handleCancelRetur = (id) => {
    if (confirm('Apakah Anda yakin ingin membatalkan pengajuan retur ke gudang ini?')) {
      router.delete(route('admin.inventory.outlet.retur.cancel', { id }), {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  const handleCreateOpname = (data) => {
    router.post(route('admin.inventory.outlet.opname'), {
      ...data,
      outlet_id: selectedOutlet,
    }, {
      preserveScroll: true,
      onSuccess: () => { setIsOpnameOpen(false); },
      onError: () => {},
    });
  };

  const handleTableItemAction = (action, item) => {
    if (action === 'transfer') {
      setIsTransferOpen(true);
    } else if (action === 'detail') {
      alert(`Detail Produk: ${item.nama_produk}\nKode: ${item.kode_produk}\nStok: ${item.total_stok} pcs`);
    } else if (action === 'history') {
      setLihatMutasi(item);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{headerInfo.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{headerInfo.sub}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert('Fitur Export data stok dalam format spreadsheet (.csv/.xlsx) sedang disiapkan.')}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-400" />
            Export
          </button>
          <button
            onClick={() => selectedOutlet !== 'all' && setIsTransferOpen(true)}
            disabled={selectedOutlet === 'all'}
            title={selectedOutlet === 'all' ? 'Pilih outlet terlebih dahulu' : ''}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Transfer
          </button>
          <button
            onClick={() => selectedOutlet !== 'all' && setIsReturOpen(true)}
            disabled={selectedOutlet === 'all'}
            title={selectedOutlet === 'all' ? 'Pilih outlet terlebih dahulu' : ''}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Retur Gudang
          </button>
          <button
            onClick={() => selectedOutlet !== 'all' && setIsOpnameOpen(true)}
            disabled={selectedOutlet === 'all'}
            title={selectedOutlet === 'all' ? 'Pilih outlet terlebih dahulu' : ''}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Opname
          </button>
        </div>
      </div>

      {/* ── OUTLET SELECTOR BAR ── */}
      <OutletSelector outlets={outlets} outletStatsAll={outletStatsAll} />

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((c, idx) => (
          <OutletStatCard
            key={idx}
            title={c.title}
            value={c.value}
            color={c.color}
            icon={c.icon}
            subtext={c.sub}
          />
        ))}
      </div>

      {/* ── CHART PERBANDINGAN (Mode Semua Outlet) ── */}
      {selectedOutlet === 'all' && (
        <StokPerbandinganChart perbandinganStok={perbandinganStok} outlets={outlets} />
      )}

      {/* ── TABS + CONTENT CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5">
          <nav className="-mb-px flex gap-1" aria-label="Tabs">
            <button onClick={() => setActiveTab('stock')}
              className={`relative px-4 py-3 text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'stock' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
              Stok Outlet
            </button>

            <button onClick={() => setActiveTab('receive')}
              className={`relative px-4 py-3 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'receive' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
              Terima dari Gudang
              {pendingTerimaCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === 'receive' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {pendingTerimaCount}
                </span>
              )}
            </button>

            <button onClick={() => setActiveTab('transfer')}
              className={`relative px-4 py-3 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'transfer' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
              Transfer Outlet
              {pendingTransferCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === 'transfer' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {pendingTransferCount}
                </span>
              )}
            </button>

            <button onClick={() => setActiveTab('retur')}
              className={`relative px-4 py-3 text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'retur' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
              Retur ke Gudang
            </button>

            <button onClick={() => selectedOutlet !== 'all' && setActiveTab('opname')}
              disabled={selectedOutlet === 'all'}
              title={selectedOutlet === 'all' ? 'Pilih outlet terlebih dahulu' : ''}
              className={`relative px-4 py-3 text-xs font-semibold transition-colors ${selectedOutlet === 'all' ? 'opacity-40 cursor-not-allowed text-gray-300' : 'cursor-pointer ' + (activeTab === 'opname' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600')}`}>
              Opname Fisik
            </button>
          </nav>
        </div>

        <div className="p-5 animate-in fade-in slide-in-from-top-1 duration-200">
          {activeTab === 'stock' && (
            <StokOutletTable 
              selectedOutlet={selectedOutlet}
              onAction={handleTableItemAction}
              outletStok={outletStok}
              outlets={outlets}
            />
          )}

          {activeTab === 'receive' && (
            <PenerimaanGudangTable
              selectedOutlet={selectedOutlet}
              onConfirmClick={handleOpenTerimaModal}
              penerimaanList={penerimaanList}
            />
          )}

          {activeTab === 'transfer' && (
            <TransferOutletTable
              selectedOutlet={selectedOutlet}
              onCancelTransfer={handleCancelTransfer}
              onConfirmReceive={handleConfirmReceiveTransfer}
              transferList={transferList}
              outletList={outlets.map(o => ({ id: o.id, name: o.nama }))}
            />
          )}

          {activeTab === 'retur' && (
            <ReturGudangTable
              selectedOutlet={selectedOutlet}
              onCancelRetur={handleCancelRetur}
              returList={returList}
            />
          )}

          {activeTab === 'opname' && (
            <StockOpnameOutletTable
              selectedOutlet={selectedOutlet}
              opnameList={opnameList}
            />
          )}
        </div>
      </div>

      {/* ── POPUP MODALS ── */}
      <KonfirmasiTerimaModal
        isOpen={isTerimaOpen}
        onClose={() => setIsTerimaOpen(false)}
        data={activeTerimaDo}
        onConfirm={handleConfirmReceive}
      />

      <FormTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        selectedOutlet={selectedOutlet}
        onSubmit={handleCreateTransfer}
        outlets={outlets}
        outletStok={outletStok}
      />

      <FormReturGudangModal
        isOpen={isReturOpen}
        onClose={() => setIsReturOpen(false)}
        selectedOutlet={selectedOutlet}
        onSubmit={handleCreateRetur}
        outlets={outlets}
        outletStok={outletStok}
      />

      <FormOpnameOutletModal
        open={isOpnameOpen}
        onClose={() => setIsOpnameOpen(false)}
        onSubmit={handleCreateOpname}
        products={outletStok[selectedOutlet] || []}
      />

      <LihatMutasiModal
        data={lihatMutasi}
        onClose={() => setLihatMutasi(null)}
        mutasiLog={initialMutasiLog}
      />
    </div>
  );
}

OutletInventory.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default OutletInventory;
