import { parseKayaCSV } from './utils/csvParser';
import * as fs from 'fs';

const newCsv = fs.readFileSync('multi-gym-climbs.csv', 'utf-8');

// The line is failing inside parseKayaCSV, likely due to a regex issue.
// Let's test the regex directly on the specific line causing trouble.

const lines = newCsv.trim().split('\n');

const brokenLineIndex = lines.findIndex(l => l.includes('1910408,,v6'));
if (brokenLineIndex !== -1) {
    const rawLine = lines[brokenLineIndex];
    console.log("Broken Raw:", rawLine.substring(0, 100));

    // The current regex:
    const regexBrokenSplit = rawLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    console.log("Current Split produces:", regexBrokenSplit.length, "columns.");

    // Better regex or parser:
    // Let's use a standard CSV parsing approach to see if it fixes it.
    let inQuotes = false;
    let currentVal = '';
    const parsedRow: string[] = [];

    for (let i = 0; i < rawLine.length; i++) {
        const char = rawLine[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parsedRow.push(currentVal.trim().replace(/^"|"$/g, ''));
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    parsedRow.push(currentVal.trim().replace(/^"|"$/g, ''));

    console.log("Manual Split produces:", parsedRow.length, "columns.");
    console.log("Manual Array snippet:", parsedRow.slice(0, 10));
}
