// src/components/MappingTable.tsx
import React, { useState } from 'react';
import { ExcelColumn, MappingItem } from '@/types';

interface MappingTableProps {
    columns: ExcelColumn[];
    availableCells: string[];
    onMappingChange: (mappings: MappingItem[]) => void;
}

const MappingTable: React.FC<MappingTableProps> = ({
                                                       columns,
                                                       availableCells,
                                                       onMappingChange,
                                                   }) => {
    const [mappings, setMappings] = useState<Record<string, string>>({});

    const handleCellChange = (columnKey: string, columnHeader: string, targetCell: string) => {
        setMappings((prev) => {
            const newMappings = { ...prev, [columnKey]: targetCell };

            // Convert to MappingItem[] and notify parent
            const mappingItems: MappingItem[] = Object.entries(newMappings).map(([key, cell]) => ({
                columnKey: key,
                columnHeader: columns.find(col => col.key === key)?.header || '',
                targetCell: cell,
            }));

            onMappingChange(mappingItems);

            return newMappings;
        });
    };

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ستون فایل ورودی
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سلول هدف در قالب
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {columns.map((column) => (
                    <tr key={column.key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {column.header}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={mappings[column.key] || ''}
                                onChange={(e) => handleCellChange(column.key, column.header, e.target.value)}
                            >
                                <option value="">انتخاب سلول</option>
                                {availableCells.map((cell) => (
                                    <option key={cell} value={cell}>
                                        {cell}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default MappingTable;
