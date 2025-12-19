import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
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
    
    const range = XLSX.utils.decode_range(from + ':' + to);
    const nullData = [];
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      const rowData = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        rowData.push(null);
      }
      nullData.push(rowData);
    }
    
    XLSX.utils.sheet_add_aoa(worksheet, nullData, { origin: from });
    
    const newBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    writeFileSync(filePath, newBuffer);
    
    return NextResponse.json({ success: true, message: 'Range deleted successfully' });
  } catch (error) {
    console.error('Error deleting range:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete range' }, { status: 500 });
  }
}
