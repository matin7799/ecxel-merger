// components/FileUpload.tsx
'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept: string;
  label: string;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelected, accept, label, selectedFile }: FileUploadProps) {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',    // xlsx
    'application/vnd.ms-excel.sheet.macroEnabled.12',                       // xlsm
    'application/vnd.ms-excel'                                              // xls
  ];

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // بررسی پسوند فایل
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'xlsm') {
        // نمایش اخطار برای فایل‌های دارای ماکرو
        const confirmUse = window.confirm(
            'این فایل حاوی ماکرو است. برخی ویژگی‌های آن ممکن است پشتیبانی نشود. آیا می‌خواهید ادامه دهید؟'
        );
        if (!confirmUse) return;
      }

      // پردازش فایل
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm']
    },
    multiple: false
  });

  return (
      <div className="mb-4">
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${
                isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
        >
          <input {...getInputProps()} />

          {selectedFile ? (
              <div>
                <p className="text-sm font-medium">فایل انتخاب شده:</p>
                <p className="text-blue-600 font-semibold">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="mt-2 text-sm text-gray-600">برای تغییر، فایل دیگری را بکشید و رها کنید</p>
              </div>
          ) : (
              <div>
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2">{label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  فایل‌های Excel (.xlsx, .xls) را بکشید و رها کنید، یا کلیک کنید
                </p>
              </div>
          )}
        </div>
      </div>
  );
}
