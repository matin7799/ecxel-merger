// types/index.ts
export interface ExcelData {
    headers: string[];
    rows: Record<string, string>[];
}

export interface ColumnMapping {
    sourceColumn: string;
    targetCell: string;
}

export interface GridCell {
    address: string;
    value: string | null;
    isMerged: boolean;
    isMergeStart: boolean;
    colspan: number;
    rowspan: number;
    style?: {
        backgroundColor?: string;
        color?: string;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        alignment?: string;
        border?: boolean;
    };
}

export interface GridRow {
    cells: GridCell[];
    height?: number;
}

export interface GridData {
    rows: GridRow[];
    maxCols: number;
    merges: { [key: string]: string };
}
