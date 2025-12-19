import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { sheet, cell, value } = await request.json();
    
    const filePath = path.join(process.cwd(), 'data', 'example.xlsx');
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const worksheet = workbook.Sheets[sheet];
    if (!worksheet) {
      return NextResponse.json({ success: false, error: 'Sheet not found' }, { status: 404 });
    }
    
    XLSX.utils.sheet_add_aoa(worksheet, [[value]], { origin: cell });
    
    const newBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    writeFileSync(filePath, newBuffer);
    
    return NextResponse.json({ success: true, message: 'Cell updated successfully' });
  } catch (error) {
    console.error('Error updating cell:', error);
    return NextResponse.json({ success: false, error: 'Failed to update cell' }, { status: 500 });
  }
}
