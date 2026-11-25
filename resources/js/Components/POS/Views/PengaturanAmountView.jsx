import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'pos_payment_settings';

const DEFAULT_SETTINGS = {
    cashPresets: [10000, 20000, 50000, 100000],
    accountsByMethod: {
        Transfer: [
            'BCA - 1234567890 a/n Kahita Busana',
            'Mandiri - 0987654321 a/n Kahita Busana',
        ],
        Debit: ['EDC BCA', 'EDC Mandiri'],
        QRIS: ['QRIS Statis Toko'],
    },
};

const formatRibuan = (val) => {
    const digits = String(val ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function PengaturanAmountView({ formatRupiah }) {
    const [cashPresets, setCashPresets] = useState(DEFAULT_SETTINGS.cashPresets);
    const [newNominalInput, setNewNominalInput] = useState('');

    const [activeAccountMethod, setActiveAccountMethod] = useState('Transfer');
    const [accountsByMethod, setAccountsByMethod] = useState(
        DEFAULT_SETTINGS.accountsByMethod
    );
    const [newAccountInput, setNewAccountInput] = useState('');
    const [savedToast, setSavedToast] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed.cashPresets) && parsed.cashPresets.length > 0) {
                const cleaned = parsed.cashPresets
                    .map((n) => Number(n))
                    .filter((n) => n > 0);
                if (cleaned.length > 0) {
                    setCashPresets(cleaned);
                }
            }

            if (parsed.accountsByMethod && typeof parsed.accountsByMethod === 'object') {
                setAccountsByMethod({
                    ...DEFAULT_SETTINGS.accountsByMethod,
                    ...parsed.accountsByMethod,
                });
            }
        } catch (err) {
            console.error('Gagal membaca pos_payment_settings:', err);
        }
    }, []);

    const handleAddNominal = (e) => {
        e.preventDefault();
        const rawNumber = Number(String(newNominalInput).replace(/\D/g, ''));
        if (!rawNumber || rawNumber <= 0) return;

        if (!cashPresets.includes(rawNumber)) {
            const updated = [...cashPresets, rawNumber].sort((a, b) => a - b);
            setCashPresets(updated);
        }
        setNewNominalInput('');
    };

    const handleRemoveNominal = (nominal) => {
        setCashPresets((prev) => prev.filter((item) => item !== nominal));
    };

    const handleAddAccount = (e) => {
        e.preventDefault();
        const trimmed = newAccountInput.trim();
        if (!trimmed) return;

        setAccountsByMethod((prev) => {
            const currentList = prev[activeAccountMethod] || [];
            if (currentList.includes(trimmed)) return prev;
            return {
                ...prev,
                [activeAccountMethod]: [...currentList, trimmed],
            };
        });
        setNewAccountInput('');
    };

    const handleRemoveAccount = (accToRemove) => {
        setAccountsByMethod((prev) => ({
            ...prev,
            [activeAccountMethod]: (prev[activeAccountMethod] || []).filter(
                (acc) => acc !== accToRemove
            ),
        }));
    };

    const handleSaveSettings = () => {
        const payload = {
            cashPresets:
                cashPresets.length > 0 ? cashPresets : DEFAULT_SETTINGS.cashPresets,
            accountsByMethod,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const handleResetDefault = () => {
        setCashPresets(DEFAULT_SETTINGS.cashPresets);
        setAccountsByMethod(DEFAULT_SETTINGS.accountsByMethod);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const renderMoney = (val) =>
        typeof formatRupiah === 'function'
            ? formatRupiah(val)
            : `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

    return (
        <div className="flex-1 h-full bg-[#f4f6f9] p-5 overflow-y-auto text-xs text-gray-700">
            <div className="max-w-5xl mx-auto space-y-5">
                {/* HEADER */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div>
                        <h2 className="text-base font-black text-gray-800 uppercase tracking-wide">
                            Setting Amount & Jenis Rekening
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Atur nominal tunai cepat dan jenis rekening untuk metode pembayaran non-tunai
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleResetDefault}
                            className="px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition"
                        >
                            Reset Default
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            className="px-4 py-2 rounded-lg bg-[#009664] hover:bg-emerald-700 text-white font-black transition shadow-2xs"
                        >
                            Simpan Pengaturan
                        </button>
                    </div>
                </div>

                {savedToast && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl font-bold">
                        Pengaturan amount & rekening berhasil disimpan.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* KARTU 1: NOMINAL TUNAI CEPAT */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-2xs">
                        <div>
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                                1. Nominal Tunai Cepat (Amount)
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                Pilihan pecahan uang yang muncul pada popup pembayaran Tunai
                            </p>
                        </div>

                        <form onSubmit={handleAddNominal} className="flex gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Contoh: 50.000"
                                value={formatRibuan(newNominalInput)}
                                onChange={(e) =>
                                    setNewNominalInput(e.target.value.replace(/\D/g, ''))
                                }
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 font-bold text-gray-800 focus:outline-none focus:bg-white focus:border-[#009664]"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-lg bg-[#009664] hover:bg-emerald-700 text-white font-bold transition"
                            >
                                + Tambah
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {cashPresets.map((nominal) => (
                                <div
                                    key={nominal}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50/70 text-[#009664] font-extrabold"
                                >
                                    <span>{renderMoney(nominal)}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNominal(nominal)}
                                        title="Hapus nominal"
                                        className="text-emerald-700 hover:text-red-600 font-black leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KARTU 2: JENIS REKENING NON TUNAI */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-2xs">
                        <div>
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                                2. Jenis Rekening Non-Tunai
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                Kelola daftar rekening bank atau EDC per metode pembayaran
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
                            {['Transfer', 'Debit', 'QRIS'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setActiveAccountMethod(method)}
                                    className={`py-2 rounded-md font-bold transition ${
                                        activeAccountMethod === method
                                            ? 'bg-white text-[#009664] shadow-2xs'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleAddAccount} className="flex gap-2">
                            <input
                                type="text"
                                placeholder={
                                    activeAccountMethod === 'Debit'
                                        ? 'Contoh: EDC BCA / EDC Mandiri'
                                        : activeAccountMethod === 'Transfer'
                                        ? 'Contoh: BCA - 1234567890 a/n Toko'
                                        : 'Contoh: QRIS Statis Kasir 1'
                                }
                                value={newAccountInput}
                                onChange={(e) => setNewAccountInput(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-[#009664]"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-lg bg-[#009664] hover:bg-emerald-700 text-white font-bold transition"
                            >
                                + Tambah
                            </button>
                        </form>

                        <div className="space-y-2 pt-1">
                            {(accountsByMethod[activeAccountMethod] || []).length === 0 ? (
                                <div className="text-xs text-gray-400 italic py-2">
                                    Belum ada rekening/channel untuk {activeAccountMethod}.
                                </div>
                            ) : (
                                (accountsByMethod[activeAccountMethod] || []).map((acc) => (
                                    <div
                                        key={acc}
                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/70"
                                    >
                                        <span className="font-bold text-gray-800">{acc}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAccount(acc)}
                                            className="text-xs font-bold text-red-500 hover:text-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}