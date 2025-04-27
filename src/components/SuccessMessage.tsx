// components/SuccessMessage.tsx
'use client';
import React from 'react';

interface SuccessMessageProps {
    totalFiles: number;
    onReset: () => void;
}

export default function SuccessMessage({ totalFiles, onReset }: SuccessMessageProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
                <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2">عملیات با موفقیت انجام شد</h3>

                <p className="text-gray-600 mb-4">
                    {totalFiles} فایل با موفقیت ایجاد و در یک فایل زیپ ذخیره شد.
                </p>

                <div className="mt-5">
                    <button
                        onClick={onReset}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                        بازگشت به صفحه اصلی
                    </button>
                </div>
            </div>
        </div>
    );
}
