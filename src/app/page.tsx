// app/page.tsx
'use client';
import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ColumnMapper from '@/components/ColumnMapper';
import SuccessMessage from '@/components/SuccessMessage';
import ErrorAlert from '@/components/ErrorAlert';
import { parseExcelFile, generateExcelFiles } from '@/lib/excel';
import { generateZipFile } from '@/lib/zip';
import { ExcelData, ColumnMapping } from '@/types';
import { downloadBlob } from '@/lib/utils';
import ProcessingModal from "@/components/ProcessingModal.tsx";

export default function Home() {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [excelData, setExcelData] = useState<ExcelData | null>(null);
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // پردازش فایل ورودی
    const handleInputFileSelected = useCallback(async (file: File) => {
        setInputFile(file);
        setExcelData(null);
        setError(null);

        try {
            const data = await parseExcelFile(file);
            setExcelData(data);
        } catch (err) {
            setError(`خطا در پردازش فایل ورودی: ${err instanceof Error ? err.message : 'خطای ناشناخته'}`);
        }
    }, []);

    // پردازش فایل قالب
    const handleTemplateFileSelected = useCallback((file: File) => {
        setTemplateFile(file);
        setError(null);
    }, []);

    // پردازش و تولید فایل‌های خروجی
    const handleProcess = async () => {
        if (!inputFile || !templateFile || !excelData || mappings.length === 0) {
            setError('لطفاً تمامی فایل‌ها را انتخاب کرده و حداقل یک مپینگ تعریف کنید.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setSuccess(false);
        setError(null);

        try {
            // تولید فایل‌های اکسل
            const outputFiles = await generateExcelFiles(
                templateFile,
                excelData,
                mappings,
                setProgress
            );

            // تولید فایل زیپ
            const zipBlob = await generateZipFile(outputFiles, templateFile.name, excelData.rows);

            // دانلود فایل زیپ
            downloadBlob(zipBlob, 'output_files.zip');

            setSuccess(true);
        } catch (err) {
            setError(`خطا در پردازش فایل‌ها: ${err instanceof Error ? err.message : 'خطای ناشناخته'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetProcess = () => {
        setSuccess(false);
    };

    return (
        <main className="container mx-auto py-8 px-4 md:px-8">
            <h1 className="text-3xl font-bold mb-8 text-center">تبدیل اکسل به قالب سفارشی</h1>

            {error && <ErrorAlert message={error} />}

            {/* بخش آپلود فایل‌ها */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">فایل داده‌های ورودی</h2>
                    <FileUpload
                        onFileSelected={handleInputFileSelected}
                        accept=".xlsx,.xls"
                        label="فایل اکسل حاوی داده‌های ورودی را انتخاب کنید"
                        selectedFile={inputFile}
                    />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">فایل قالب</h2>
                    <FileUpload
                        onFileSelected={handleTemplateFileSelected}
                        accept=".xlsx,.xls,.xlsm"
                        label="فایل اکسل قالب را انتخاب کنید"
                        selectedFile={templateFile}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        توجه: فایل‌های قالب پیچیده با فرم‌های فعال یا ماکروها ممکن است به درستی باز نشوند.
                    </p>
                </div>
            </div>

            {/* نمایش مپینگ‌ها */}
            {excelData && excelData.headers.length > 0 && (
                <div className="mb-8">
                    <ColumnMapper
                        headers={excelData.headers}
                        templateFile={templateFile}
                        mappings={mappings}
                        onMappingsChange={setMappings}
                    />

                    <div className="mt-8 text-center">
                        <button
                            onClick={handleProcess}
                            disabled={!templateFile || mappings.length === 0}
                            className={`px-6 py-3 rounded-lg font-medium text-lg ${
                                !templateFile || mappings.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            پردازش و تولید فایل‌ها
                        </button>
                    </div>
                </div>
            )}

            {/* نمایش مدال پردازش */}
            {isProcessing && (
                <ProcessingModal
                    progress={progress}
                    totalRows={excelData?.rows.length || 0}
                />
            )}

            {/* نمایش پیام موفقیت */}
            {success && (
                <SuccessMessage
                    totalFiles={excelData?.rows.length || 0}
                    onReset={resetProcess}
                />
            )}
        </main>
    );
}
