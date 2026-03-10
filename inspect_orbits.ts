import * as xlsx from 'xlsx';
import * as fs from 'fs';

const wb = xlsx.read(fs.readFileSync('Setting Payroll Details - SHERLOCK FINAL.xlsx'), { type: 'buffer' });
const allOrbitsSheetName = wb.SheetNames.find(s => s.toLowerCase().includes('orbit'));

if (allOrbitsSheetName) {
    const sheet = wb.Sheets[allOrbitsSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    fs.writeFileSync('extracted_orbits_preview.txt', JSON.stringify(data.slice(0, 15), null, 2));
    console.log("Wrote first 15 rows to extracted_orbits_preview.txt");
}
