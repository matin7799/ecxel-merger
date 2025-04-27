// lib/zip.ts
import JSZip from 'jszip';

/**
 * تولید فایل ZIP حاوی فایل‌های اکسل
 */
export async function generateZipFile(
    files: { name: string; data: Blob }[],
    templateName: string,
    rows: Record<string, string>[]
): Promise<Blob> {
    const zip = new JSZip();

    // افزودن هر فایل به زیپ
    files.forEach((file, index) => {
        // ایجاد نام فایل خوانا بر اساس داده‌های ورودی
        let fileName = `output_${index + 1}.xlsx`;

        // اگر داده‌های ورودی دارای ستون‌های مناسب برای نامگذاری باشند
        const row = rows[index];
        if (row) {
            // تلاش برای استفاده از ستون‌های هویتی مانند کد، شناسه، نام و غیره
            const identifiers = ['شناسه', 'کد', 'شماره', 'نام', 'id', 'code', 'name'];

            for (const id of identifiers) {
                for (const key of Object.keys(row)) {
                    if (key.includes(id) && row[key]) {
                        // استفاده از اولین ستون هویتی پیدا شده
                        fileName = `${row[key].replace(/[\\/:*?"<>|]/g, '_')}.xlsx`;
                        break;
                    }
                }
                if (fileName !== `output_${index + 1}.xlsx`) break;
            }
        }

        zip.file(fileName, file.data);
    });

    // تولید فایل ZIP
    const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 6
        }
    });

    return content;
}
