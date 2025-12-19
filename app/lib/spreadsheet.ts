import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import { config } from "@/app/config";

export interface CellRange {
  sheet: string;
  from: string;
  to: string;
}

export interface CellData {
  value: any;
  formula?: string;
  address: string;
}

export interface SpreadsheetData {
  [sheetName: string]: any[][];
}

class SpreadsheetService {
  private filePath: string;
  private workbook: XLSX.WorkBook | null = null;

  constructor(filePath?: string) {
    this.filePath = filePath || config.spreadsheet.path;
    this.loadWorkbook();
  }

  private loadWorkbook(): void {
    try {
      const fileBuffer = readFileSync(this.filePath);
      this.workbook = XLSX.read(fileBuffer, { type: "buffer" });
    } catch (error) {
      console.error("Error loading workbook:", error);
      // Create empty workbook if file doesn't exist
      this.workbook = XLSX.utils.book_new();
      this.saveWorkbook();
    }
  }

  private saveWorkbook(): void {
    if (!this.workbook) return;
    
    const fileBuffer = XLSX.write(this.workbook, { type: "buffer", bookType: "xlsx" });
    writeFileSync(this.filePath, fileBuffer);
  }

  getSheetNames(): string[] {
    if (!this.workbook) return [];
    return this.workbook.SheetNames;
  }

  getSheetData(sheetName: string): any[][] {
    if (!this.workbook) return [];
    
    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return [];
    
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }

  getRange(sheetName: string, from: string, to: string): any[][] {
    const data = this.getSheetData(sheetName);
    const range = XLSX.utils.decode_range(from + ":" + to);
    
    const result: any[][] = [];
    for (let row = range.s.r; row <= range.e.r; row++) {
      const rowData: any[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        rowData.push(data[row] ? data[row][col] : null);
      }
      result.push(rowData);
    }
    
    return result;
  }

  getCell(sheetName: string, cell: string): any {
    const data = this.getSheetData(sheetName);
    const address = XLSX.utils.decode_cell(cell);
    
    return data[address.r] ? data[address.r][address.c] : null;
  }

  updateCell(sheetName: string, cell: string, value: any): void {
    if (!this.workbook) return;
    
    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return;
    
    XLSX.utils.sheet_add_aoa(worksheet, [[value]], { origin: cell });
    this.saveWorkbook();
  }

  updateRange(sheetName: string, from: string, to: string, values: any[][]): void {
    if (!this.workbook) return;
    
    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return;
    
    XLSX.utils.sheet_add_aoa(worksheet, values, { origin: from });
    this.saveWorkbook();
  }

  getCellFormula(sheetName: string, cell: string): string | undefined {
    if (!this.workbook) return undefined;
    
    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return undefined;
    
    const cellRef = worksheet[cell];
    return cellRef ? cellRef.f : undefined;
  }

  getAllData(): SpreadsheetData {
    const result: SpreadsheetData = {};
    
    if (!this.workbook) return result;
    
    this.workbook.SheetNames.forEach(sheetName => {
      result[sheetName] = this.getSheetData(sheetName);
    });
    
    return result;
  }

  parseRangeReference(rangeRef: string): CellRange | null {
    // Parse @Sheet1!A1:B3 format
    const match = rangeRef.match(/^@([^!]+)!([A-Z]+\d+):([A-Z]+\d+)$/);
    if (!match) return null;
    
    return {
      sheet: match[1],
      from: match[2],
      to: match[3],
    };
  }
}

export const spreadsheet = new SpreadsheetService();
