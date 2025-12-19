import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { sheet, from, to } = await request.json();
    
    const filePath = path.join(process.cwd(), 'data', 'example.xlsx');
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const worksheet = workbook.Sheets[sheet];
    if (!worksheet) {
      return NextResponse.json({ success: false, error: 'Sheet not found' }, { status: 404 });
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const range = XLSX.utils.decode_range(from + ':' + to);
    
    const result: any[][] = [];
    for (let row = range.s.r; row <= range.e.r; row++) {
      const rowData: any[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        rowData.push((data[row] as any[]) ? (data[row] as any[])[col] : null);
      }
      result.push(rowData);
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error reading range:', error);
    return NextResponse.json({ success: false, error: 'Failed to read range' }, { status: 500 });
  }
}
