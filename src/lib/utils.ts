import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { GridData } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts

/**
 * دانلود فایل
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * تأخیر برای انیمیشن‌ها یا عملیات زمان‌بندی شده
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * محدود کردن تابع برای اجرای محدود
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * عملکرد نمونه برای پیشنهاد خودکار مپینگ بر اساس نام یا الگوهای ستون
 */
export function suggestMappings(headers: string[], gridData: GridData): { sourceColumn: string; targetCell: string }[] {
  const suggestions: { sourceColumn: string; targetCell: string }[] = [];

  // دریافت آدرس‌های سلول از گرید
  const cellAddresses = new Set<string>();
  gridData.rows.forEach(row => {
    row.cells.forEach(cell => {
      cellAddresses.add(cell.address);
    });
  });

  // تطبیق هر سرستون با سلول‌های موجود در قالب بر اساس نام مشابه
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();

    for (const rowObj of gridData.rows) {
      for (const cell of rowObj.cells) {
        if (!cell.value) continue;

        const cellValue = cell.value.toString().toLowerCase();

        // بررسی مطابقت
        if (cellValue.includes(lowerHeader) || lowerHeader.includes(cellValue)) {
          suggestions.push({
            sourceColumn: header,
            targetCell: cell.address
          });
          return; // پس از یافتن اولین تطابق برای این هدر، ادامه ندهید
        }
      }
    }
  });

  return suggestions;
}

/**
 * ذخیره مپینگ در حافظه محلی
 */
export function saveMapping(inputFilename: string, templateFilename: string, mappings: any[]): void {
  try {
    const key = `excel-mapping-${inputFilename}-${templateFilename}`;
    localStorage.setItem(key, JSON.stringify(mappings));
  } catch (error) {
    console.error('خطا در ذخیره مپینگ:', error);
  }
}

/**
 * بازیابی مپینگ از حافظه محلی
 */
export function loadMapping(inputFilename: string, templateFilename: string): any[] | null {
  try {
    const key = `excel-mapping-${inputFilename}-${templateFilename}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('خطا در بازیابی مپینگ:', error);
    return null;
  }
}

