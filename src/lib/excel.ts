// lib/excel.ts
import ExcelJS from 'exceljs';
import { ExcelData, ColumnMapping, GridData, GridRow, GridCell } from '@/types';

// تحلیل فایل اکسل
export async function parseExcelFile(file: File): Promise<ExcelData> {
    try {
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await file.arrayBuffer();

        // اضافه کردن گزینه‌های بارگذاری برای بهبود سازگاری
        await workbook.xlsx.load(arrayBuffer, {
            password: '',
            base64: false,
            ignoreNodes: ['extLst', 'ext'],
        });

        // بررسی شیت‌ها
        if (!workbook.worksheets || workbook.worksheets.length === 0) {
            throw new Error('هیچ شیتی در فایل یافت نشد');
        }

        const worksheet = workbook.worksheets[0];
        const headers: string[] = [];
        const rows: Record<string, string>[] = [];

        // دریافت هدرها از سطر اول
        try {
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                headers[colNumber - 1] = cell.value?.toString() || `ستون ${colNumber}`;
            });
        } catch (error) {
            console.warn('خطا در خواندن سطر هدر، استفاده از هدرهای پیش‌فرض:', error);
            // ایجاد هدرهای پیش‌فرض اگر خواندن ناموفق بود
            for (let i = 0; i < 10; i++) {
                headers.push(`ستون ${i+1}`);
            }
        }

        if (headers.length === 0) {
            // اگر هیچ هدری یافت نشد، هدرهای پیش‌فرض ایجاد کن
            for (let i = 0; i < 10; i++) {
                headers.push(`ستون ${i+1}`);
            }
        }

        // دریافت داده‌ها از سطرها
        try {
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // رد کردن سطر هدر

                const rowData: Record<string, string> = {};

                row.eachCell((cell, colNumber) => {
                    // مدیریت انواع مختلف داده
                    let value = '';

                    // تبدیل انواع مختلف داده به رشته
                    if (cell.value !== null && cell.value !== undefined) {
                        if (typeof cell.value === 'object') {
                            if (cell.value instanceof Date) {
                                value = cell.value.toISOString().split('T')[0];
                            } else if ('text' in cell.value) {
                                value = cell.value.text || '';
                            } else if ('richText' in cell.value) {
                                value = cell.value.richText?.map((rt: any) => rt.text).join('') || '';
                            } else {
                                try {
                                    value = JSON.stringify(cell.value);
                                } catch (e) {
                                    value = '[مقدار پیچیده]';
                                }
                            }
                        } else {
                            value = cell.value.toString();
                        }
                    }

                    const headerName = headers[colNumber - 1] || `ستون ${colNumber}`;
                    rowData[headerName] = value;
                });

                // فقط در صورتی که سطر دارای داده است، آن را اضافه کن
                if (Object.keys(rowData).length > 0) {
                    rows.push(rowData);
                }
            });
        } catch (error) {
            console.error('خطا در خواندن سطرهای داده:', error);
            throw new Error(`خطا در خواندن سطرهای داده: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
        }

        return { headers, rows };
    } catch (error) {
        console.error('خطا در پردازش فایل اکسل:', error);
        throw new Error(`خطا در باز کردن فایل اکسل: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
    }
}

// استخراج داده‌های شیت برای نمایش
export function extractSheetData(worksheet: ExcelJS.Worksheet): GridData {
    const rows: GridRow[] = [];
    let maxCols = 0;
    const merges: { [key: string]: string } = {};

    // تعیین ابعاد امن
    let minRow = 1, minCol = 1, maxRow = 50, maxCol = 26;

    try {
        if (worksheet.dimensions && worksheet.dimensions.min && worksheet.dimensions.max) {
            minRow = worksheet.dimensions.min.row || minRow;
            minCol = worksheet.dimensions.min.col || minCol;
            maxRow = worksheet.dimensions.max.row || maxRow;
            maxCol = worksheet.dimensions.max.col || maxCol;
        } else {
            // تلاش برای تعیین ابعاد با یافتن آخرین سلول دارای محتوا
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > maxRow) maxRow = rowNumber;

                row.eachCell((cell, colNumber) => {
                    if (colNumber > maxCol) maxCol = colNumber;
                });
            });
        }
    } catch (error) {
        console.warn('خطا در تعیین ابعاد کاربرگ، استفاده از مقادیر پیش‌فرض:', error);
        // استفاده از مقادیر پیش‌فرض
    }

    // پردازش سلول‌های ادغام شده به صورت امن
    try {
        // استفاده از روش‌های مختلف برای سازگاری
        if (worksheet.hasMerges && typeof worksheet.hasMerges === 'function' && worksheet.hasMerges()) {
            worksheet.eachMergedRange((range) => {
                if (!range ||
                    typeof range.top !== 'number' ||
                    typeof range.left !== 'number' ||
                    typeof range.bottom !== 'number' ||
                    typeof range.right !== 'number') {
                    return;
                }

                const startCell = indicesToCellAddress(range.top, range.left);

                // ثبت هر سلول در محدوده ادغام
                for (let r = range.top; r <= range.bottom; r++) {
                    for (let c = range.left; c <= range.right; c++) {
                        const cellAddress = indicesToCellAddress(r, c);
                        merges[cellAddress] = startCell;
                    }
                }
            });
        } else if (worksheet._merges) {
            // دسترسی به _merges برای نسخه‌های قدیمی‌تر
            const mergeRanges = Object.values(worksheet._merges);

            mergeRanges.forEach((range: any) => {
                if (!range ||
                    typeof range.top !== 'number' ||
                    typeof range.left !== 'number' ||
                    typeof range.bottom !== 'number' ||
                    typeof range.right !== 'number') {
                    return;
                }

                const startCell = indicesToCellAddress(range.top, range.left);

                for (let r = range.top; r <= range.bottom; r++) {
                    for (let c = range.left; c <= range.right; c++) {
                        const cellAddress = indicesToCellAddress(r, c);
                        merges[cellAddress] = startCell;
                    }
                }
            });
        }
    } catch (error) {
        console.warn('خطا در پردازش سلول‌های ادغام شده:', error);
    }

    // خواندن سلول‌ها و ایجاد ساختار داده‌های شبکه
    for (let rowNumber = minRow; rowNumber <= maxRow; rowNumber++) {
        const gridRow: GridRow = { cells: [] };
        const excelRow = worksheet.getRow(rowNumber);

        gridRow.height = excelRow.height;

        for (let colNumber = minCol; colNumber <= maxCol; colNumber++) {
            try {
                const cellAddress = indicesToCellAddress(rowNumber, colNumber);
                const excelCell = worksheet.getCell(cellAddress);
                const isMerged = cellAddress in merges;
                const isMergeStart = isMerged && merges[cellAddress] === cellAddress;

                let colspan = 1;
                let rowspan = 1;

                // تعیین colspan و rowspan برای سلول‌های ادغام شده
                if (isMergeStart) {
                    try {
                        // استفاده از API رسمی برای دسترسی به محدوده ادغام
                        const mergeRange = worksheet.getMergeCellRange(cellAddress);
                        if (mergeRange &&
                            typeof mergeRange.bottom === 'number' &&
                            typeof mergeRange.top === 'number' &&
                            typeof mergeRange.right === 'number' &&
                            typeof mergeRange.left === 'number') {
                            rowspan = mergeRange.bottom - mergeRange.top + 1;
                            colspan = mergeRange.right - mergeRange.left + 1;
                        } else {
                            // دسترسی مستقیم به _merges برای نسخه‌های قدیمی‌تر
                            const mergeRanges = Object.values(worksheet._merges || {});
                            for (const range of mergeRanges) {
                                if (!range ||
                                    typeof range.top !== 'number' ||
                                    typeof range.left !== 'number' ||
                                    typeof range.bottom !== 'number' ||
                                    typeof range.right !== 'number') {
                                    continue;
                                }

                                const startCellForRange = indicesToCellAddress(range.top, range.left);
                                if (startCellForRange === cellAddress) {
                                    rowspan = range.bottom - range.top + 1;
                                    colspan = range.right - range.left + 1;
                                    break;
                                }
                            }
                        }
                    } catch (error) {
                        console.warn(`خطا در محاسبه دامنه ادغام برای سلول ${cellAddress}:`, error);
                    }
                }

                // نمایش سلول‌ها فقط اگر اولین سلول در ادغام هستند یا اصلاً ادغام نشده‌اند
                if (!isMerged || isMergeStart) {
                    const style = {
                        backgroundColor: excelCell.fill?.type === 'pattern' && excelCell.fill.pattern === 'solid'
                            ? excelCell.fill.fgColor?.argb?.substring(2) || ''
                            : undefined,
                        color: excelCell.font?.color?.argb?.substring(2) || undefined,
                        bold: excelCell.font?.bold,
                        italic: excelCell.font?.italic,
                        underline: excelCell.font?.underline,
                        alignment: excelCell.alignment?.horizontal,
                        border: !!(excelCell.border?.top || excelCell.border?.right || excelCell.border?.bottom || excelCell.border?.left),
                    };

                    const gridCell: GridCell = {
                        address: cellAddress,
                        value: excelCell.value?.toString() || null,
                        isMerged,
                        isMergeStart,
                        colspan,
                        rowspan,
                        style,
                    };

                    gridRow.cells.push(gridCell);
                }
            } catch (error) {
                console.warn(`خطا در پردازش سلول در سطر ${rowNumber}، ستون ${colNumber}:`, error);
                // اضافه کردن یک سلول جایگزین برای حفظ ساختار
                gridRow.cells.push({
                    address: indicesToCellAddress(rowNumber, colNumber),
                    value: null,
                    isMerged: false,
                    isMergeStart: false,
                    colspan: 1,
                    rowspan: 1,
                    style: {},
                });
            }
        }

        rows.push(gridRow);
    }

    return { rows, maxCols, merges };
}

// تبدیل آدرس سلول (مثل A1) به شماره سطر و ستون
export function cellAddressToIndices(address: string): { row: number; col: number } {
    const colMatch = address.match(/[A-Z]+/);
    const rowMatch = address.match(/\d+/);

    if (!colMatch || !rowMatch) {
        throw new Error(`آدرس سلول نامعتبر: ${address}`);
    }

    const colStr = colMatch[0];
    const row = parseInt(rowMatch[0], 10);

    // تبدیل حروف ستون به عدد (A=1, B=2, ...)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + colStr.charCodeAt(i) - 64;
    }

    return { row, col };
}

// تبدیل شماره سطر و ستون به آدرس سلول (مثل A1)
export function indicesToCellAddress(row: number, col: number): string {
    // بررسی ایمنی
    if (typeof row !== 'number' || isNaN(row) || row <= 0) {
        console.warn(`مقدار سطر نامعتبر: ${row}، استفاده از 1 به عنوان جایگزین`);
        row = 1;
    }

    if (typeof col !== 'number' || isNaN(col) || col <= 0) {
        console.warn(`مقدار ستون نامعتبر: ${col}، استفاده از 1 به عنوان جایگزین`);
        col = 1;
    }

    let colStr = '';

    // تبدیل شماره ستون به حروف
    let tempCol = col;
    while (tempCol > 0) {
        const remainder = (tempCol - 1) % 26;
        colStr = String.fromCharCode(65 + remainder) + colStr;
        tempCol = Math.floor((tempCol - 1) / 26);
    }

    return `${colStr}${row}`;
}

// تولید فایل‌های اکسل بر اساس داده‌های ورودی و مپینگ‌ها
export async function generateExcelFiles(
    templateFile: File,
    excelData: ExcelData,
    mappings: ColumnMapping[],
    setProgress: (progress: number) => void
): Promise<{ name: string; data: Blob }[]> {
    // خواندن قالب
    const templateArrayBuffer = await templateFile.arrayBuffer();
    const outputFiles: { name: string; data: Blob }[] = [];

    // پردازش هر سطر داده
    for (let i = 0; i < excelData.rows.length; i++) {
        try {
            // باز کردن یک کپی جدید از قالب برای هر سطر
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(templateArrayBuffer, {
                password: '',
                ignoreNodes: ['extLst', 'ext'],
            });

            const worksheet = workbook.worksheets[0];
            const row = excelData.rows[i];

            // اعمال مپینگ‌ها
            for (const mapping of mappings) {
                const value = row[mapping.sourceColumn] || '';
                const cellAddress = mapping.targetCell;

                try {
                    const cell = worksheet.getCell(cellAddress);
                    cell.value = value;
                } catch (error) {
                    console.error(`خطا در نوشتن داده به سلول ${cellAddress}:`, error);
                }
            }

            // تولید محتوای فایل
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            // نام فایل بر اساس داده‌های ورودی
            const fileName = `output_${i + 1}.xlsx`;
            outputFiles.push({ name: fileName, data: blob });
        } catch (error) {
            console.error(`خطا در پردازش ردیف ${i+1}:`, error);
        }

        // به‌روزرسانی پیشرفت
        setProgress(Math.round(((i + 1) / excelData.rows.length) * 100));
    }

    return outputFiles;
}
