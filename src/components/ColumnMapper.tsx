// components/ColumnMapper.tsx
'use client';
import { useState, useEffect } from 'react';
import { ColumnMapping } from '@/types';
import CellSelector from './CellSelector';
import { loadMapping, saveMapping, suggestMappings } from '@/lib/utils';

interface ColumnMapperProps {
    headers: string[];
    templateFile: File | null;
    mappings: ColumnMapping[];
    onMappingsChange: (mappings: ColumnMapping[]) => void;
}

export default function ColumnMapper({
                                         headers,
                                         templateFile,
                                         mappings,
                                         onMappingsChange
                                     }: ColumnMapperProps) {
    const [selectedColumn, setSelectedColumn] = useState<string>('');
    const [selectedCell, setSelectedCell] = useState<string>('');
    const [suggestions, setSuggestions] = useState<ColumnMapping[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    // بررسی وجود مپینگ ذخیره شده
    useEffect(() => {
        if (templateFile && headers.length > 0) {
            // تلاش برای بازیابی مپینگ‌های ذخیره شده
            const storedMappings = loadMapping(
                `input-${headers.join('-')}`,
                `template-${templateFile.name}`
            );

            if (storedMappings && Array.isArray(storedMappings) && storedMappings.length > 0) {
                // بررسی معتبر بودن مپینگ‌های ذخیره شده
                const validMappings = storedMappings.filter(
                    (m: any) =>
                        typeof m === 'object' &&
                        headers.includes(m.sourceColumn) &&
                        typeof m.targetCell === 'string'
                );

                if (validMappings.length > 0) {
                    onMappingsChange(validMappings);
                }
            }
        }
    }, [headers, templateFile, onMappingsChange]);

    // ذخیره مپینگ‌ها
    useEffect(() => {
        if (templateFile && headers.length > 0 && mappings.length > 0) {
            saveMapping(
                `input-${headers.join('-')}`,
                `template-${templateFile.name}`,
                mappings
            );
        }
    }, [headers, templateFile, mappings]);

    // تغییر ستون انتخاب شده
    const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedColumn(e.target.value);
    };

    // انتخاب سلول در قالب
    const handleCellSelect = (cellAddress: string) => {
        setSelectedCell(cellAddress);

        // اگر ستونی انتخاب شده باشد، مپینگ را اضافه کنید
        if (selectedColumn) {
            addMapping(selectedColumn, cellAddress);
            setSelectedColumn('');
        }
    };

    // اضافه کردن مپینگ
    const addMapping = (sourceColumn: string, targetCell: string) => {
        // اگر مپینگ موجود است، آن را به‌روزرسانی کنید
        const existingMappingIndex = mappings.findIndex(m => m.sourceColumn === sourceColumn);

        if (existingMappingIndex >= 0) {
            const updatedMappings = [...mappings];
            updatedMappings[existingMappingIndex] = { sourceColumn, targetCell };
            onMappingsChange(updatedMappings);
        } else {
            // در غیر این صورت، مپینگ جدید را اضافه کنید
            onMappingsChange([...mappings, { sourceColumn, targetCell }]);
        }
    };

    // حذف مپینگ
    const removeMapping = (index: number) => {
        const updatedMappings = [...mappings];
        updatedMappings.splice(index, 1);
        onMappingsChange(updatedMappings);
    };

    // لیست سلول‌هایی که قبلاً مپ شده‌اند
    const mappedCells = mappings.map(m => m.targetCell);

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">تعیین مپینگ ستون‌ها به سلول‌ها</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* بخش انتخاب ستون */}
                <div>
                    <h3 className="text-lg font-medium mb-3">ستون‌های داده</h3>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">انتخاب ستون از داده‌های ورودی:</label>
                        <select
                            value={selectedColumn}
                            onChange={handleColumnChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">-- یک ستون انتخاب کنید --</option>
                            {headers.map(header => (
                                <option key={header} value={header}>{header}</option>
                            ))}
                        </select>
                    </div>

                    {/* لیست مپینگ‌های موجود */}
                    <div>
                        <h4 className="font-medium mb-2">مپینگ‌های تعریف شده:</h4>

                        {mappings.length === 0 ? (
                            <p className="text-gray-500 text-sm">هنوز هیچ مپینگی تعریف نشده است</p>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ستون منبع</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سلول هدف</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {mappings.map((mapping, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 whitespace-nowrap">{mapping.sourceColumn}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{mapping.targetCell}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => removeMapping(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* بخش نمایش و انتخاب سلول‌ها */}
                <div>
                    <h3 className="text-lg font-medium mb-3">انتخاب سلول در قالب</h3>
                    <p className="mb-2 text-gray-600 text-sm">
                        روی سلول مورد نظر در قالب کلیک کنید تا برای ستون انتخاب‌شده مپ شود.
                    </p>

                    <CellSelector
                        templateFile={templateFile}
                        selectedCell={selectedCell}
                        onCellSelect={handleCellSelect}
                        mappedCells={mappedCells}
                    />
                </div>
            </div>
        </div>
    );
}
