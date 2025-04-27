// components/ProcessingModal.tsx
'use client';
import React from 'react';

interface ProcessingModalProps {
    progress: number;
    totalRows: number;
}

export default function ProcessingModal({ progress, totalRows }: ProcessingModalProps) {
    const processedRows = Math.floor((progress / 100) * totalRows);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">در حال پردازش فایل‌ها</h3>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
            <span className="text-gray-700">
              {processedRows} از {totalRows} فایل ({progress}%)
            </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <p className="text-gray-600 text-sm text-center">
                    لطفاً صبر کنید. در حال تولید فایل‌های خروجی...
                </p>
            </div>
        </div>
    );
}
