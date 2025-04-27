// components/ErrorAlert.tsx
'use client';
import React, { useState } from 'react';

interface ErrorAlertProps {
    message: string;
    details?: string;
}

export default function ErrorAlert({ message, details }: ErrorAlertProps) {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="mr-3">
                    <p className="text-sm font-medium text-red-800">
                        {message}
                    </p>
                    {details && (
                        <p className="mt-1 text-xs text-red-700">
                            {details}
                        </p>
                    )}
                </div>
                <div className="mr-auto pl-3">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-md bg-red-50 text-red-500 hover:bg-red-100 focus:outline-none"
                    >
                        <span className="sr-only">بستن</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
