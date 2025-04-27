// components/CellSelector.tsx
'use client';
import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { extractSheetData } from '@/lib/excel';
import { GridData } from '@/types';

interface CellSelectorProps {
    templateFile: File | null;
    selectedCell: string;
    onCellSelect: (cellAddress: string) => void;
    mappedCells: string[];
}

export default function CellSelector({
                                         templateFile,
                                         selectedCell,
                                         onCellSelect,
                                         mappedCells
                                     }: CellSelectorProps) {
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [activeSheet, setActiveSheet] = useState<string>('');
    const [gridData, setGridData] = useState<GridData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // بارگذاری داده‌های قالب
    useEffect(() => {
        if (!templateFile) {
            setGridData(null);
            setSheetNames([]);
            setActiveSheet('');
            return;
        }

        loadTemplateData(templateFile);
    }, [templateFile]);

    // بارگذاری تمام نام‌های شیت و داده‌های اولین شیت
    async function loadTemplateData(file: File) {
        setLoading(true);
        setError(null);

        try {
            const workbook = new ExcelJS.Workbook();
            const arrayBuffer = await file.arrayBuffer();

            // اضافه کردن گزینه‌های بیشتر برای سازگاری
            await workbook.xlsx.load(arrayBuffer, {
                password: '',
                ignoreNodes: ['extLst', 'ext'] // نادیده گرفتن برخی گره‌های XML پیچیده
            });

            // بررسی خالی نبودن کتاب کاری
            if (workbook.worksheets.length === 0) {
                setError('هیچ شیتی در فایل یافت نشد');
                setLoading(false);
                return;
            }

            const names = workbook.worksheets.map(sheet => sheet.name);
            setSheetNames(names);

            const firstSheet = names[0];
            setActiveSheet(firstSheet);

            const worksheet = workbook.getWorksheet(firstSheet);

            // بررسی حفاظت شیت
            const isProtected = worksheet.protect !== undefined;
            console.log(`شیت "${firstSheet}" ${isProtected ? 'محافظت شده است' : 'محافظت نشده است'}`);

            const data = extractSheetData(worksheet);
            setGridData(data);
        } catch (err) {
            setError(`خطا در بارگذاری فایل قالب: ${err instanceof Error ? err.message : 'خطای ناشناخته'}`);
            console.error('خطا در بارگذاری فایل قالب:', err);
        } finally {
            setLoading(false);
        }
    }

    // تغییر شیت فعال
    const handleSheetChange = async (sheetName: string) => {
        if (!templateFile || sheetNames.length === 0) return;

        setActiveSheet(sheetName);
        setLoading(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const arrayBuffer = await templateFile.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer, {
                password: '',
                ignoreNodes: ['extLst', 'ext']
            });

            const worksheet = workbook.getWorksheet(sheetName);
            const data = extractSheetData(worksheet);
            setGridData(data);
        } catch (err) {
            setError(`خطا در بارگذاری شیت: ${err instanceof Error ? err.message : 'خطای ناشناخته'}`);
            console.error('خطا در بارگذاری شیت:', err);
        } finally {
            setLoading(false);
        }
    };

    // انتخاب سلول با کلیک
    const handleCellClick = (cellAddress: string) => {
        onCellSelect(cellAddress);
    };

    // نمایش وضعیت بارگذاری
    if (loading) {
        return <div className="p-4 text-center">در حال بارگذاری صفحه‌گسترده...</div>;
    }

    // نمایش خطا
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    // نمایش راهنما در صورت عدم انتخاب فایل
    if (!templateFile) {
        return (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                لطفاً ابتدا یک فایل قالب انتخاب کنید
            </div>
        );
    }

    // نمایش انتخاب شیت و جدول
    return (
        <div>
            {sheetNames.length > 1 && (
                <div className="mb-4">
                    <label htmlFor="sheet-selector" className="block mb-2 text-sm font-medium">انتخاب شیت:</label>
                    <select
                        id="sheet-selector"
                        value={activeSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        {sheetNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            )}

            {gridData && (
                <div className="excel-grid-container">
                    <div className="excel-grid overflow-auto">
                        <table>
                            <tbody>
                            {gridData.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {/* شماره سطر */}
                                    <td className="excel-cell sticky-col col-label">
                                        {rowIndex + 1}
                                    </td>

                                    {/* سلول‌های سطر */}
                                    {row.cells.map((cell, cellIndex) => {
                                        const isMappedCell = mappedCells.includes(cell.address);
                                        const isCurrentSelection = cell.address === selectedCell;

                                        return (
                                            <td
                                                key={`${rowIndex}-${cellIndex}`}
                                                className={`excel-cell ${cell.isMerged ? 'merged' : ''} ${
                                                    isCurrentSelection ? 'selected' : ''
                                                } ${isMappedCell ? 'mapped' : ''}`}
                                                colSpan={cell.colspan}
                                                rowSpan={cell.rowspan}
                                                onClick={() => handleCellClick(cell.address)}
                                                style={{
                                                    backgroundColor: cell.style?.backgroundColor ? `#${cell.style.backgroundColor}` : undefined,
                                                    color: cell.style?.color ? `#${cell.style.color}` : undefined,
                                                    fontWeight: cell.style?.bold ? 'bold' : undefined,
                                                    fontStyle: cell.style?.italic ? 'italic' : undefined,
                                                    textDecoration: cell.style?.underline ? 'underline' : undefined,
                                                    textAlign: cell.style?.alignment as any,
                                                    border: cell.style?.border ? '1px solid #aaa' : undefined,
                                                }}
                                                title={`${cell.address}: ${cell.value || ''}`}
                                            >
                                                {cell.value || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
