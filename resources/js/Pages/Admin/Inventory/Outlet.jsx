import React, { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useFilter } from '@/Context/FilterContext';

// Icons
import { 
  Download, Plus, RefreshCw, Layers, ArrowUpDown, 
  AlertTriangle, Inbox, ArrowRightLeft, Undo2, ClipboardList,
  Store, LayoutGrid, CheckSquare
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

  const tabColors = ['emerald-500', 'blue-500', 'purple-500', 'amber-500', 'rose-500', 'cyan-500', 'orange-500', 'pink-500'];
  const getTabColor = useMemo(() => {
    if (selectedOutlet === 'all') return 'emerald-600';
    const idx = outlets.findIndex(o => o.slug === selectedOutlet);
    return tabColors[idx >= 0 ? idx % tabColors.length : 4];
  }, [selectedOutlet, outlets]);

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

  const handleCreateOpname = (newOpname) => {
    router.post(route('admin.inventory.outlet.opname.start'), {
      outlet_id: newOpname.outlet_id,
      petugas: newOpname.dilakukan_oleh,
      scope: 'all',
      mulai: true,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsOpnameOpen(false);
      },
      onError: (errors) => {
        alert('Gagal memulai opname: ' + Object.values(errors).join(', '));
      }
    });
  };

  // Dummy action handler for items table buttons
  const handleTableItemAction = (action, item) => {
    if (action === 'transfer') {
      setIsTransferOpen(true);
    } else if (action === 'detail') {
      alert(`Detail Produk: ${item.nama_produk}\nKode: ${item.kode_produk}\nStok: ${item.total_stok} pcs`);
    } else if (action === 'history') {
      alert(`Riwayat Log Mutasi untuk ${item.nama_produk} akan dimuat.`);
    }
  };

  // Dynamic Action Button based on active tab
  const renderActionButtons = () => {
    if (selectedOutlet === 'all') return null;

    if (activeTab === 'stock') {
      return (
        <button 
          onClick={() => alert('Fitur Export data stok dalam format spreadsheet (.csv/.xlsx) sedang disiapkan.')}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-gray-400" />
          Export Stok
        </button>
      );
    }

    if (activeTab === 'transfer') {
      return (
        <button
          onClick={() => setIsTransferOpen(true)}
          style={{ backgroundColor: getTabColor }}
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:opacity-90`}
        >
          <Plus className="w-4 h-4" />
          Buat Transfer
        </button>
      );
    }

    if (activeTab === 'retur') {
      return (
        <button
          onClick={() => setIsReturOpen(true)}
          style={{ backgroundColor: getTabColor }}
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:opacity-90`}
        >
          <Plus className="w-4 h-4" />
          Buat Retur ke Gudang
        </button>
      );
    }

    if (activeTab === 'opname') {
      return (
        <button
          onClick={() => setIsOpnameOpen(true)}
          style={{ backgroundColor: getTabColor }}
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:opacity-90`}
        >
          <Plus className="w-4 h-4" />
          Mulai Opname
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            <span>Dashboard</span>
            <span>&rsaquo;</span>
            <span>Inventory</span>
            <span>&rsaquo;</span>
            <span className="text-gray-500">Outlet</span>
          </div>

          {/* Dynamic title with color dot */}
          <div className="flex items-center gap-2">
            {selectedOutlet !== 'all' && (
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: currentOutlet?.warna || '#amber-500' }} />
            )}
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{headerInfo.title}</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">{headerInfo.sub}</p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {renderActionButtons()}
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

      {/* ── TABS NAVIGASI ── */}
      <div className="border-b border-gray-150 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-white font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
          style={activeTab === 'stock' ? { borderBottomColor: getTabColor, color: getTabColor } : {}}
        >
          <Layers className="w-4 h-4" />
          Stok Outlet
        </button>

        <button
          onClick={() => setActiveTab('receive')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'receive'
              ? 'bg-white font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
          style={activeTab === 'receive' ? { borderBottomColor: getTabColor, color: getTabColor } : {}}
        >
          <Inbox className="w-4 h-4" />
          Terima dari Gudang
          {pendingTerimaCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-extrabold animate-pulse">
              {pendingTerimaCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'transfer'
              ? 'bg-white font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
          style={activeTab === 'transfer' ? { borderBottomColor: getTabColor, color: getTabColor } : {}}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transfer Outlet
          {pendingTransferCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold">
              {pendingTransferCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('retur')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'retur'
              ? 'bg-white font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
          style={activeTab === 'retur' ? { borderBottomColor: getTabColor, color: getTabColor } : {}}
        >
          <Undo2 className="w-4 h-4" />
          Retur ke Gudang
        </button>

        <button
          onClick={() => selectedOutlet !== 'all' && setActiveTab('opname')}
          disabled={selectedOutlet === 'all'}
          title={selectedOutlet === 'all' ? 'Pilih outlet terlebih dahulu' : ''}
          style={selectedOutlet !== 'all' && activeTab === 'opname' ? { borderBottomColor: getTabColor, color: getTabColor } : {}}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            selectedOutlet === 'all' 
              ? 'opacity-40 cursor-not-allowed border-transparent text-gray-400'
              : activeTab === 'opname'
                ? 'bg-white font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Opname Fisik
        </button>
      </div>

      {/* ── ACTIVE TAB COMPONENT CONTENT ── */}
      <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
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
        isOpen={isOpnameOpen}
        onClose={() => setIsOpnameOpen(false)}
        selectedOutlet={selectedOutlet}
        onSubmit={handleCreateOpname}
        outlets={outlets}
        outletStok={outletStok}
      />
    </div>
  );
}

OutletInventory.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default OutletInventory;
