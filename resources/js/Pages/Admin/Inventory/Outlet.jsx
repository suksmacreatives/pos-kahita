import React, { useState, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useFilter } from '@/Context/FilterContext';

// Icons
import { 
  Download, Plus, RefreshCw, Layers, ArrowUpDown, 
  AlertTriangle, Inbox, ArrowRightLeft, Undo2, ClipboardList,
  Store, LayoutGrid, CheckSquare
} from 'lucide-react';

// Core Dummy Data
import { 
  outlets, 
  outletStatsAll,
  penerimaanDariGudang as initialPenerimaan,
  transferAntar as initialTransfer,
  returKeGudang as initialRetur,
  opnameOutlet as initialOpname
} from '@/data/inventoryOutletData';

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
  const { outlet: selectedOutlet } = useFilter();

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState('stock');

  // Modals state
  const [isTerimaOpen, setIsTerimaOpen] = useState(false);
  const [activeTerimaDo, setActiveTerimaDo] = useState(null);
  
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReturOpen, setIsReturOpen] = useState(false);
  const [isOpnameOpen, setIsOpnameOpen] = useState(false);

  // Local state arrays initialized with dummy data to support dynamic additions/updates
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
    const current = outlets.find(o => o.id === selectedOutlet);
    return {
      title: `Inventory ${current?.nama || 'Outlet'}`,
      sub: `Kelola stok lokal, terima DO, transfer mutasi, dan stock opname di ${current?.nama || 'outlet ini'}.`,
      color: current?.warna || 'emerald'
    };
  }, [selectedOutlet]);

  // 2. Tab Badge Counts (Pending items checking)
  const pendingTerimaCount = useMemo(() => {
    if (selectedOutlet === 'all') {
      return Object.values(penerimaanList).flat().filter(p => p.status === 'menunggu').length;
    }
    return (penerimaanList[selectedOutlet] || []).filter(p => p.status === 'menunggu').length;
  }, [selectedOutlet, penerimaanList]);

  const pendingTransferCount = useMemo(() => {
    if (selectedOutlet === 'all') {
      return transferList.filter(t => t.status === 'menunggu_konfirmasi').length;
    }
    return transferList.filter(t => 
      t.status === 'menunggu_konfirmasi' && 
      (t.outlet_asal_id === selectedOutlet || t.outlet_tujuan_id === selectedOutlet)
    ).length;
  }, [selectedOutlet, transferList]);

  // 3. Dynamic Statistics calculations
  const stats = useMemo(() => {
    if (selectedOutlet !== 'all') {
      const s = outletStatsAll[selectedOutlet] || {};
      const pendingCount = (penerimaanList[selectedOutlet] || []).filter(p => p.status === 'menunggu').length;
      return [
        { title: 'Total SKU Produk', value: `${s.total_sku || 20} item`, color: headerInfo.color, icon: Layers },
        { title: 'Total Stok Fisik', value: `${(s.total_stok || 0).toLocaleString()} pcs`, color: headerInfo.color, icon: ArrowUpDown, sub: `Est. Nilai: ${formatIDR(s.nilai_stok || 0)}` },
        { title: 'Stok Menipis / Habis', value: `${(s.menipis || 0) + (s.habis || 0)} SKU`, color: ((s.menipis || 0) + (s.habis || 0)) > 0 ? 'amber' : headerInfo.color, icon: AlertTriangle, sub: `${s.habis || 0} SKU kosong` },
        { title: 'DO Menunggu Terima', value: `${pendingCount} dokumen`, color: pendingCount > 0 ? 'blue' : headerInfo.color, icon: Inbox },
      ];
    }

    // "Semua Outlet" Mode Calculations
    const allOutletsStats = Object.values(outletStatsAll);
    const totalStokAll = allOutletsStats.reduce((acc, curr) => acc + curr.total_stok, 0);
    const totalPendingAll = Object.values(penerimaanList).flat().filter(p => p.status === 'menunggu').length;

    // Find outlet with highest stock
    let maxStok = 0;
    let maxOutletName = '-';
    outlets.forEach(o => {
      const oStok = outletStatsAll[o.id]?.total_stok || 0;
      if (oStok > maxStok) {
        maxStok = oStok;
        maxOutletName = o.nama;
      }
    });

    return [
      { title: 'Outlet Aktif', value: `${outlets.length} Lokasi`, color: 'emerald', icon: Store },
      { title: 'Total Stok Gabungan', value: `${totalStokAll.toLocaleString()} pcs`, color: 'emerald', icon: ArrowUpDown },
      { title: 'Stok Terbanyak', value: maxOutletName, color: 'emerald', icon: LayoutGrid, sub: `${maxStok.toLocaleString()} pcs` },
      { title: 'Total DO Pending', value: `${totalPendingAll} Dokumen`, color: 'emerald', icon: Inbox },
    ];
  }, [selectedOutlet, headerInfo, penerimaanList]);

  // 4. Action Handlers
  const handleOpenTerimaModal = (doRow) => {
    setActiveTerimaDo(doRow);
    setIsTerimaOpen(true);
  };

  const handleConfirmReceive = (confirmedData) => {
    setPenerimaanList(prev => {
      const copy = { ...prev };
      const currentList = copy[selectedOutlet] || [];
      copy[selectedOutlet] = currentList.map(item => 
        item.id === confirmedData.id ? confirmedData : item
      );
      return copy;
    });
    setIsTerimaOpen(false);
    setActiveTerimaDo(null);
  };

  const handleCreateTransfer = (newTransfer) => {
    setTransferList(prev => [newTransfer, ...prev]);
    setIsTransferOpen(false);
  };

  const handleCancelTransfer = (id) => {
    if (confirm('Apakah Anda yakin ingin membatalkan pengajuan transfer ini?')) {
      setTransferList(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleConfirmReceiveTransfer = (id) => {
    if (confirm('Konfirmasi bahwa barang transfer telah diterima dengan baik di outlet?')) {
      setTransferList(prev => prev.map(t => 
        t.id === id 
          ? { ...t, status: 'diterima', tgl_diterima: new Date().toISOString().split('T')[0] } 
          : t
      ));
    }
  };

  const handleCreateRetur = (newRetur) => {
    setReturList(prev => {
      const copy = { ...prev };
      const current = copy[selectedOutlet] || [];
      copy[selectedOutlet] = [newRetur, ...current];
      return copy;
    });
    setIsReturOpen(false);
  };

  const handleCancelRetur = (id) => {
    if (confirm('Apakah Anda yakin ingin membatalkan pengajuan retur ke gudang ini?')) {
      setReturList(prev => {
        const copy = { ...prev };
        copy[selectedOutlet] = (copy[selectedOutlet] || []).filter(r => r.id !== id);
        return copy;
      });
    }
  };

  const handleCreateOpname = (newOpname) => {
    setOpnameList(prev => {
      const copy = { ...prev };
      const current = copy[selectedOutlet] || [];
      copy[selectedOutlet] = [newOpname, ...current];
      return copy;
    });
    setIsOpnameOpen(false);
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
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer ${
            selectedOutlet === 'denpasar' ? 'bg-emerald-600 hover:bg-emerald-700' :
            selectedOutlet === 'jakarta' ? 'bg-blue-600 hover:bg-blue-700' :
            selectedOutlet === 'bandung' ? 'bg-purple-600 hover:bg-purple-700' :
            'bg-amber-600 hover:bg-amber-700'
          }`}
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
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/10 cursor-pointer ${
            selectedOutlet === 'denpasar' ? 'bg-emerald-600 hover:bg-emerald-700' :
            selectedOutlet === 'jakarta' ? 'bg-blue-600 hover:bg-blue-700' :
            selectedOutlet === 'bandung' ? 'bg-purple-600 hover:bg-purple-700' :
            'bg-amber-600 hover:bg-amber-700'
          }`}
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
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer ${
            selectedOutlet === 'denpasar' ? 'bg-emerald-600 hover:bg-emerald-700' :
            selectedOutlet === 'jakarta' ? 'bg-blue-600 hover:bg-blue-700' :
            selectedOutlet === 'bandung' ? 'bg-purple-600 hover:bg-purple-700' :
            'bg-amber-600 hover:bg-amber-700'
          }`}
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
              <span className={`w-3 h-3 rounded-full shrink-0 ${
                selectedOutlet === 'denpasar' ? 'bg-emerald-500' :
                selectedOutlet === 'jakarta' ? 'bg-blue-500' :
                selectedOutlet === 'bandung' ? 'bg-purple-500' :
                'bg-amber-500'
              }`} />
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
      <OutletSelector />

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((c, idx) => (
          <OutletStatCard
            key={idx}
            title={c.title}
            value={c.value}
            color={selectedOutlet === 'all' ? 'emerald' : selectedOutlet}
            icon={c.icon}
            subtext={c.sub}
          />
        ))}
      </div>

      {/* ── CHART PERBANDINGAN (Mode Semua Outlet) ── */}
      {selectedOutlet === 'all' && (
        <StokPerbandinganChart />
      )}

      {/* ── TABS NAVIGASI ── */}
      <div className="border-b border-gray-150 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? `${selectedOutlet === 'all' ? 'border-emerald-600 text-emerald-600' : 
                  selectedOutlet === 'denpasar' ? 'border-emerald-500 text-emerald-500' :
                  selectedOutlet === 'jakarta' ? 'border-blue-500 text-blue-500' :
                  selectedOutlet === 'bandung' ? 'border-purple-500 text-purple-500' :
                  'border-amber-500 text-amber-500'
                } bg-white font-extrabold`
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Stok Outlet
        </button>

        <button
          onClick={() => setActiveTab('receive')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'receive'
              ? `${selectedOutlet === 'all' ? 'border-emerald-600 text-emerald-600' : 
                  selectedOutlet === 'denpasar' ? 'border-emerald-500 text-emerald-500' :
                  selectedOutlet === 'jakarta' ? 'border-blue-500 text-blue-500' :
                  selectedOutlet === 'bandung' ? 'border-purple-500 text-purple-500' :
                  'border-amber-500 text-amber-500'
                } bg-white font-extrabold`
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
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
              ? `${selectedOutlet === 'all' ? 'border-emerald-600 text-emerald-600' : 
                  selectedOutlet === 'denpasar' ? 'border-emerald-500 text-emerald-500' :
                  selectedOutlet === 'jakarta' ? 'border-blue-500 text-blue-500' :
                  selectedOutlet === 'bandung' ? 'border-purple-500 text-purple-500' :
                  'border-amber-500 text-amber-500'
                } bg-white font-extrabold`
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
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
              ? `${selectedOutlet === 'all' ? 'border-emerald-600 text-emerald-600' : 
                  selectedOutlet === 'denpasar' ? 'border-emerald-500 text-emerald-500' :
                  selectedOutlet === 'jakarta' ? 'border-blue-500 text-blue-500' :
                  selectedOutlet === 'bandung' ? 'border-purple-500 text-purple-500' :
                  'border-amber-500 text-amber-500'
                } bg-white font-extrabold`
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          Retur ke Gudang
        </button>

        <button
          onClick={() => selectedOutlet !== 'all' && setActiveTab('opname')}
          disabled={selectedOutlet === 'all'}
          title={selectedOutlet === 'all' ? 'Pilih outlet terlebih dahulu' : ''}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            selectedOutlet === 'all' 
              ? 'opacity-40 cursor-not-allowed border-transparent text-gray-400'
              : activeTab === 'opname'
                ? `${selectedOutlet === 'denpasar' ? 'border-emerald-500 text-emerald-500' :
                    selectedOutlet === 'jakarta' ? 'border-blue-500 text-blue-500' :
                    selectedOutlet === 'bandung' ? 'border-purple-500 text-purple-500' :
                    'border-amber-500 text-amber-500'
                  } bg-white font-extrabold`
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
          />
        )}

        {activeTab === 'receive' && (
          <PenerimaanGudangTable
            selectedOutlet={selectedOutlet}
            onConfirmClick={handleOpenTerimaModal}
          />
        )}

        {activeTab === 'transfer' && (
          <TransferOutletTable
            selectedOutlet={selectedOutlet}
            onCancelTransfer={handleCancelTransfer}
            onConfirmReceive={handleConfirmReceiveTransfer}
          />
        )}

        {activeTab === 'retur' && (
          <ReturGudangTable
            selectedOutlet={selectedOutlet}
            onCancelRetur={handleCancelRetur}
          />
        )}

        {activeTab === 'opname' && (
          <StockOpnameOutletTable
            selectedOutlet={selectedOutlet}
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
      />

      <FormReturGudangModal
        isOpen={isReturOpen}
        onClose={() => setIsReturOpen(false)}
        selectedOutlet={selectedOutlet}
        onSubmit={handleCreateRetur}
      />

      <FormOpnameOutletModal
        isOpen={isOpnameOpen}
        onClose={() => setIsOpnameOpen(false)}
        selectedOutlet={selectedOutlet}
        onSubmit={handleCreateOpname}
      />
    </div>
  );
}

OutletInventory.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default OutletInventory;
