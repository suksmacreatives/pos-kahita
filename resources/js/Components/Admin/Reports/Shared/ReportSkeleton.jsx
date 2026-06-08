import React from 'react';

export default function ReportSkeleton({ count = 4 }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-7 bg-gray-100 rounded w-32 mt-2" />
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="h-3 bg-gray-100 rounded w-28" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="h-5 bg-gray-100 rounded w-40 mb-6" />
        <div className="h-[280px] bg-gray-50 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-100 rounded w-48" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
