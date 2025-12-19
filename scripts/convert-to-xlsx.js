const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, '../data/example.csv');
const xlsxPath = path.join(__dirname, '../data/example.xlsx');

if (fs.existsSync(csvPath)) {
  // Read CSV and convert to workbook
  const workbook = XLSX.utils.book_new();
  const csvData = fs.readFileSync(csvPath, 'utf8');
  
  // Parse CSV
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  // Add some calculated columns
  data.forEach(row => {
    const salary = parseFloat(row['Зарплата']) || 0;
    row['Премия'] = salary * 0.15;
    row['Итого'] = salary + row['Премия'];
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Сотрудники');
  
  // Write XLSX file
  XLSX.writeFile(workbook, xlsxPath);
  
  console.log('XLSX file created successfully');
} else {
  console.log('CSV file not found');
}
