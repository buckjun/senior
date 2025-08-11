import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('attached_assets/제조업2_1754930991450.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('\nFirst few rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

console.log('\nColumn headers:');
if (data.length > 0) {
  console.log(Object.keys(data[0]));
}

// Save as CSV for easier processing
const csvData = XLSX.utils.sheet_to_csv(worksheet);
fs.writeFileSync('attached_assets/제조업2_processed.csv', csvData, 'utf8');

console.log('\nSaved as 제조업2_processed.csv');