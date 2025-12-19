import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { sheet, cell } = await request.json();
    
    const filePath = path.join(process.cwd(), 'data', 'example.xlsx');
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const worksheet = workbook.Sheets[sheet];
    if (!worksheet) {
      return NextResponse.json({ success: false, error: 'Sheet not found' }, { status: 404 });
    }
    
    const cellRef = worksheet[cell];
    const formula = cellRef ? cellRef.f : undefined;
    const value = cellRef ? cellRef.v : null;
    
    return NextResponse.json({
      success: true,
      formula,
      value,
      message: `Ячейка ${sheet}!${cell}: значение=${value}, формула=${formula || "нет"}`,
    });
  } catch (error) {
    console.error('Error getting formula:', error);
    return NextResponse.json({ success: false, error: 'Failed to get formula' }, { status: 500 });
  }
}
