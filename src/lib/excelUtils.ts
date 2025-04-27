// src/lib/excelUtils.ts
import * as ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { FileData, Mapping } from '../../../shadcn-ui/src/types';

export async function readExcelColumns(file: FileData): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.data);
  const worksheet = workbook.worksheets[0];
  const headers: string[] = [];

  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.text);
  });

  return headers;
}

export async function getTemplateCells(file: FileData): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.data);
  const worksheet = workbook.worksheets[0];
  const cells: string[] = [];

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cells.push(cell.address);
    });
  });

  return [...new Set(cells)];
}

export async function processExcelFiles(
  inputFile: FileData,
  templateFile: FileData,
  mappings: Mapping[],
  onProgress: (progress: number) => void
): Promise<void> {
  const inputWorkbook = new ExcelJS.Workbook();
  await inputWorkbook.xlsx.load(inputFile.data);
  const inputSheet = inputWorkbook.worksheets[0];

  const zip = new JSZip();
  const totalRows = inputSheet.rowCount - 1; // Excluding header

  for (let rowIndex = 2; rowIndex <= inputSheet.rowCount; rowIndex++) {
    const row = inputSheet.getRow(rowIndex);
    const templateWorkbook = new ExcelJS.Workbook();
    await templateWorkbook.xlsx.load(templateFile.data);
    const templateSheet = templateWorkbook.worksheets[0];

    // Apply mappings
    mappings.forEach((mapping) => {
      const columnIndex = inputSheet.getRow(1).findCell(
        (ell) => cell.text === mapping.column
      )?.col;
      
      if (columnIndex) {
        const value = row.getCell(columnIndex).value;
        const targetCell = templateSheet.getCell(mapping.cell);
        targetCell.value = value;
      }
    });

    // Add to ZIP
    const buffer = await templateWorkbook.xlsx.writeBuffer();
    zip.file(`output_${rowIndex - 1}.xlsx`, buffer);

    onProgress((rowIndex - 1) / totalRows);
  }

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'processed_files.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}