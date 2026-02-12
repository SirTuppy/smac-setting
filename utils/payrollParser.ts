import { FinancialRecord } from '../types';
import { getGymCode } from '../constants/mapTemplates';

export const parsePayrollCSV = (csvText: string): FinancialRecord[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const getIndex = (possibleKeys: string[]) => headers.findIndex(h => possibleKeys.some(k => h.includes(k.toLowerCase())));

    const locIdx = getIndex(['location', 'gym', 'name']);
    const hoursIdx = getIndex(['actual hours', 'hours', 'total hours', 'xyz hours']);
    const wagesIdx = getIndex(['actual wages', 'wages', 'total wages', 'xyz wages', 'payroll']);
    const budgetIdx = getIndex(['budget wages', 'budget']);
    const varIdx = getIndex(['variance']);
    const startIdx = getIndex(['start date', 'from', 'period start']);
    const endIdx = getIndex(['end date', 'to', 'period end', 'pay period end']);

    const records: FinancialRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
        // Regex to handle quoted CSV parts (containing commas)
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, ''));
        if (row.length < 3) continue;

        const location = row[locIdx];
        const gymCode = getGymCode(location) || location.substring(0, 3).toUpperCase();

        records.push({
            gymCode,
            payPeriodStart: row[startIdx] || '',
            payPeriodEnd: row[endIdx] || '',
            totalHours: parseFloat(row[hoursIdx]) || 0,
            totalWages: parseFloat(row[wagesIdx].replace(/[$,]/g, '')) || 0, // Clean currencies
            budgetWages: budgetIdx !== -1 ? parseFloat(row[budgetIdx].replace(/[$,]/g, '')) : undefined,
            variance: varIdx !== -1 ? parseFloat(row[varIdx].replace(/[$,]/g, '')) : undefined
        });
    }

    return records;
};
