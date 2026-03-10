const XLSX = require('xlsx');
const fs = require('fs');

const data = fs.readFileSync('Setting Payroll Details - SHERLOCK FINAL.xlsx');
const workbook = XLSX.read(data, { type: 'buffer', cellDates: true });

const sheetName = 'Setter Payroll Master List';
const sheet = workbook.Sheets[sheetName];

const json = XLSX.utils.sheet_to_json(sheet);
const grouped = {};

json.forEach(row => {
    const gymName = row['Gym'] || 'UNK';
    let payDateStr = new Date().toISOString();
    const payDateVal = row['Paycheck Date'];
    if (payDateVal instanceof Date) {
        payDateStr = payDateVal.toISOString();
    } else if (typeof payDateVal === 'number') {
        payDateStr = new Date((payDateVal - 25569) * 86400 * 1000).toISOString();
    } else if (typeof payDateVal === 'string') {
        payDateStr = new Date(payDateVal).toISOString();
    }

    const dateOnly = payDateStr.split('T')[0];

    // Create a Pay Period End date based on Paycheck Date
    // If paycheck date is a Friday, usually period end is previous Saturday, etc.
    // For our purposes, we can just use the Paycheck date as the identifier.
    const key = `${gymName}-${dateOnly}`;

    if (!grouped[key]) {
        grouped[key] = {
            gymCode: gymName, // We can map this later
            payPeriodStart: dateOnly,
            payPeriodEnd: dateOnly, // We'll just use the check date
            totalHours: 0,
            totalWages: 0
        };
    }

    const wageKey = Object.keys(row).find(k => k.toLowerCase().includes('worked wages'));
    const hourKey = Object.keys(row).find(k => k.toLowerCase().includes('worked hours'));

    if (wageKey) grouped[key].totalWages += Number(row[wageKey]) || 0;
    if (hourKey) grouped[key].totalHours += Number(row[hourKey]) || 0;
});

const results = Object.values(grouped);
console.log(`Found ${results.length} grouped records.`);
console.dir(results.slice(0, 3), { depth: null });

