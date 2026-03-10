const xlsx = require('xlsx');
const wb = xlsx.readFile('Setting Payroll Details - SHERLOCK FINAL.xlsx', { cellFormula: true });
console.log('--- Sheets ---');
console.log(wb.SheetNames);

const exploreSheet = (sheetName) => {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) { console.log('Sheet not found:', sheetName); return; }
    console.log('\n--- Headers for', sheetName, '---');
    const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0];
    console.log(headers);
    console.log('\n--- First Row for', sheetName, '---');
    const data = xlsx.utils.sheet_to_json(sheet)[0];
    console.log(data);

    // Attempt to find formulas
    console.log('\n--- Sample Formulas for', sheetName, '---');
    let formulaCount = 0;
    for (const cellAddress in sheet) {
        if (cellAddress[0] === '!') continue;
        const cell = sheet[cellAddress];
        if (cell.f) {
            console.log(cellAddress, '=', cell.f);
            formulaCount++;
            if (formulaCount > 5) break;
        }
    }
    if (formulaCount === 0) console.log('No formulas found continuously.');
}

exploreSheet('Setter Payroll Master List');
exploreSheet('All Orbits Log');
exploreSheet('Production x Wage Dashboard');
exploreSheet('Production x Wage Ledger');
