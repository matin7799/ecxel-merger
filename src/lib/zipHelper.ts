// src/lib/zipHelper.ts
import JSZip from 'jszip';

export async function createZipFromBlobs(
    blobs: Blob[],
    fileNames: string[]
): Promise<Blob> {
    if (blobs.length !== fileNames.length) {
        throw new Error('تعداد فایل‌ها و نام‌ها باید برابر باشد');
    }

    const zip = new JSZip();

    for (let i = 0; i < blobs.length; i++) {
        zip.file(fileNames[i], blobs[i]);
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    return zipContent;
}
