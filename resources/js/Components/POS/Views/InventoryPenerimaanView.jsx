import React from 'react';

export default function InventoryPenerimaanView() {
    return (
        <div className="flex-1 bg-[#f7f8fa] p-5 overflow-y-auto">

            <div className="bg-white border border-slate-200 rounded-xl p-5">

                <div className="flex items-center justify-between mb-5">

                    <div>
                        <h1 className="text-lg font-black text-slate-800">
                            Penerimaan Barang
                        </h1>

                        <p className="text-xs text-slate-500">
                            Barang yang diterima dari distribusi pusat atau supplier
                        </p>
                    </div>

                </div>

                <div className="border border-dashed border-slate-300 rounded-xl h-[500px] flex items-center justify-center">

                    <div className="text-center">

                        <div className="text-5xl mb-3">
                            📦
                        </div>

                        <h3 className="font-bold text-slate-700">
                            Belum Ada Data
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                            Daftar penerimaan barang akan tampil di sini
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}