import { FinancialRecord } from '../types';
import { getGymCode } from '../constants/mapTemplates';

export const parsePayrollCSV = (csvText: string): FinancialRecord[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Simple CSV splitter that handles quotes
    const splitCSV = (line: string) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));

    const headers = splitCSV(lines[0]).map(h => h.toLowerCase().replace(/_/g, '').replace(/ /g, ''));
    const getIndex = (possibleKeys: string[]) => headers.findIndex(h => possibleKeys.some(k => h.includes(k.toLowerCase())));

    const gymIdx = getIndex(['location', 'gym', 'center', 'unit']);
    const hoursIdx = getIndex(['hours', 'totalhrs', 'actualhours']);
    const wagesIdx = getIndex(['wages', 'actualwages', 'totalpay', 'payroll']);
    const budgetIdx = getIndex(['budget', 'budgetwages', 'targetpay']);
    const varianceIdx = getIndex(['variance', 'var']);
    const accountIdx = getIndex(['account', 'gl', 'description']);
    const startIdx = getIndex(['start', 'periodfrom', 'from']);
    const endIdx = getIndex(['end', 'periodto', 'to']);

    // Required minimal set: Gym and either Hours or Wages
    if (gymIdx === -1 || (hoursIdx === -1 && wagesIdx === -1)) {
        console.error("Missing required columns in Payroll CSV. Headers found:", headers);
        return [];
    }

    const records: FinancialRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
        const row = splitCSV(lines[i]);
        if (row.length < 2) continue;

        const rawGym = row[gymIdx] || '';
        const gymCode = getGymCode(rawGym) || rawGym.toUpperCase();

        // Skip total rows or generic descriptions if gymCode wasn't derived
        if (!rawGym || rawGym.toLowerCase().includes('total')) continue;

        records.push({
            gymCode,
            payPeriodStart: startIdx !== -1 ? row[startIdx] : '',
            payPeriodEnd: endIdx !== -1 ? row[endIdx] : '',
            totalHours: hoursIdx !== -1 ? parseFloat(row[hoursIdx].replace(/[$,]/g, '')) || 0 : 0,
            totalWages: wagesIdx !== -1 ? parseFloat(row[wagesIdx].replace(/[$,]/g, '')) || 0 : 0,
            budgetWages: budgetIdx !== -1 ? parseFloat(row[budgetIdx].replace(/[$,]/g, '')) || 0 : 0,
            variance: varianceIdx !== -1 ? parseFloat(row[varianceIdx].replace(/[$,]/g, '')) || 0 : 0,
            glAccount: accountIdx !== -1 ? row[accountIdx] : undefined
        });
    }

    return records;
};
