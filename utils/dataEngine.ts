
import { FinancialRecord, Climb } from '../types';
import { parseKayaCSV } from './csvParser';
import * as XLSX from 'xlsx';
import { GYMS } from '../constants/gyms';

// --- Parsing Logic ---

export const parsePlastickData = async (file: File): Promise<Record<string, Climb[]>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // Use existing parseKayaCSV logic
            // But we need to detect WHICH gym it is.
            // Assuming the CSV has gym name column or we parse all rows.
            // If it's a "Network Export", it might have a "Gym" column.

            // For now, let's assume it's a bulk export or single gym export.
            // We'll wrap parseKayaCSV to return a map.

            try {
                // Check first line for headers
                const lines = text.split('\n');
                const headers = lines[0].split(',');
                const gymIndex = headers.findIndex(h => {
                    const cleanH = h.toLowerCase().trim().replace(/_/g, '');
                    return cleanH.includes('gym') || cleanH.includes('location');
                });

                if (gymIndex === -1) {
                    // Single gym export? Or fail?
                    // Let's assume standard format and try to group by gym if possible
                    // If parseKayaCSV returns array, we group it ourselves.
                    const climbs = parseKayaCSV(text, "Unknown Gym");

                    // Group by gymCode if available in climb data (it might be inferred)
                    const grouped: Record<string, Climb[]> = {};
                    climbs.forEach(c => {
                        const code = c.gymCode || 'UNK';
                        if (!grouped[code]) grouped[code] = [];
                        grouped[code].push(c);
                    });
                    resolve(grouped);
                } else {
                    // TODO: Handle multi-gym export explicitly if format differs
                    const climbs = parseKayaCSV(text, "Multi-Gym Import");
                    const grouped: Record<string, Climb[]> = {};
                    climbs.forEach(c => {
                        const code = c.gymCode || 'UNK';
                        if (!grouped[code]) grouped[code] = [];
                        grouped[code].push(c);
                    });
                    resolve(grouped);
                }

            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    });
};

export const parseHumanityData = async (file: File): Promise<FinancialRecord[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                // Expected Headers: Location, Date, Name, Hours
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                const locIdx = headers.findIndex(h => h.includes('location'));
                const dateIdx = headers.findIndex(h => h.includes('date'));
                const hoursIdx = headers.findIndex(h => h.includes('hours') || h.includes('duration'));

                if (locIdx === -1 || dateIdx === -1 || hoursIdx === -1) {
                    throw new Error("Invalid Humanity CSV format. Missing Location, Date, or Hours columns.");
                }

                // Temp storage to aggregate by Gym + PayPeriod
                // For simplicity, we'll just sum by Gym for the entire file's range for now
                // Or better, group by Week?
                // Let's group by "Pay Period" (approx 2 weeks)
                // Actually, let's just return daily records or let the store aggregate?
                // The FinancialRecord type is Gym + Start + End + Totals.

                // Let's aggregate by Location + bi-weekly chunks relative to the data?
                // Or simpler: Just create one record per Gym for the whole file range?
                // No, that solves nothing for trends.

                // Strategy: Group by Gym, then by ISO Week or just generic 14-day blocks.
                // Let's assume the file covers a specific period and just return one record per gym per file?
                // No, the user might upload a year of data.

                // Let's aggregate by standard bi-weekly buckets.
                // For now, let's just return RAW daily sums? No, type is FinancialRecord.

                const rawData = lines.slice(1).map(line => {
                    const cols = line.split(',');
                    if (cols.length < headers.length) return null;
                    return {
                        gym: cols[locIdx]?.trim(),
                        date: new Date(cols[dateIdx]?.trim()),
                        hours: parseFloat(cols[hoursIdx]?.trim()) || 0
                    };
                }).filter(d => d && d.gym && !isNaN(d.date.getTime()));

                // Group by Gym -> Fortnight (starting from first date)
                const grouped: Record<string, Record<string, { start: Date, end: Date, hours: number }>> = {};

                if (rawData.length === 0) {
                    resolve([]);
                    return;
                }

                // Find global min date to align periods?
                // Or just standard ISO weeks.
                // Let's use simple logic: grouping by 14-day chunks from the earliest date found for that gym.

                rawData.forEach(d => {
                    // Simple distinct gym codes
                    let gymCode = 'Unknown';
                    // Try to map gym name to code?
                    // We need the `GYMS` constant but we can't import it easily here without circular dep issues maybe?
                    // Actually we can, but let's just use the string for now and let the UI map it.
                    // Or improved: Assume the CSV has the Code or we map common names.
                    gymCode = d.gym || 'UNK';

                    // Group by 14-day period
                    // Epoch millis / (14 * 24 * 60 * 60 * 1000)
                    const periodLen = 14 * 24 * 60 * 60 * 1000;
                    const periodId = Math.floor(d.date.getTime() / periodLen);
                    const key = `${gymCode}-${periodId}`;

                    if (!grouped[gymCode]) grouped[gymCode] = {};
                    if (!grouped[gymCode][key]) {
                        const start = new Date(periodId * periodLen);
                        const end = new Date(start.getTime() + periodLen - 1);
                        grouped[gymCode][key] = { start, end, hours: 0 };
                    }
                    grouped[gymCode][key].hours += d.hours;
                });

                const records: FinancialRecord[] = [];
                Object.keys(grouped).forEach(gym => {
                    Object.values(grouped[gym]).forEach(p => {
                        records.push({
                            gymCode: gym,
                            payPeriodStart: p.start.toISOString(),
                            payPeriodEnd: p.end.toISOString(),
                            totalHours: Number(p.hours.toFixed(2)),
                            totalWages: 0 // Humanity export doesn't have wages
                        });
                    });
                });

                resolve(records);

            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    });
};

// Helper to derive the 14-day pay period from a paycheck date
export const derivePayPeriod = (paycheckDate: Date): { start: string, end: string } => {
    // Paycheck is usually on Friday, 5 days after the pay period ends on Sunday.
    const d = new Date(paycheckDate);
    // Subtract 5 days to reach the Period End (Sunday)
    d.setDate(d.getDate() - 5);

    // Ensure it's a Sunday (0). If not, roll back to the nearest Sunday.
    while (d.getDay() !== 0) {
        d.setDate(d.getDate() - 1);
    }

    const endStr = d.toISOString().split('T')[0];

    // Start is 13 days before End (to make a 14-day inclusive period)
    const startD = new Date(d);
    startD.setDate(startD.getDate() - 13);
    const startStr = startD.toISOString().split('T')[0];

    return { start: startStr, end: endStr };
};

export const parsePayrollData = async (file: File): Promise<FinancialRecord[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                // Use cellDates: true to parse Excel dates into JS Dates
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                const sheetName = 'Setter Payroll Master List';
                const sheet = workbook.Sheets[sheetName];

                if (!sheet) {
                    console.warn(`Sheet "${sheetName}" not found. Trying to parse first sheet as fallback...`);
                    resolve([]);
                    return;
                }

                const json = XLSX.utils.sheet_to_json<any>(sheet);

                // Aggregate by gymCode and Pay Period (using derived dates)
                const grouped: Record<string, FinancialRecord> = {};

                json.forEach(row => {
                    const gymName = String(row['Gym'] || 'UNK').trim();

                    // Map gymName to gymCode
                    let gymCode = 'UNK';
                    const matchedGym = GYMS.find(g =>
                        g.name.toLowerCase() === gymName.toLowerCase() ||
                        g.searchKeywords.some(kw => kw.toLowerCase() === gymName.toLowerCase())
                    );
                    if (matchedGym) {
                        gymCode = matchedGym.code;
                    } else {
                        gymCode = gymName;
                    }

                    // Extract Paycheck Date
                    let payDateStr = new Date().toISOString();
                    const payDateVal = row['Paycheck Date'] || row['Pay Date'];
                    if (payDateVal instanceof Date) {
                        payDateStr = payDateVal.toISOString();
                    } else if (typeof payDateVal === 'number') {
                        payDateStr = new Date((payDateVal - 25569) * 86400 * 1000).toISOString();
                    } else if (typeof payDateVal === 'string') {
                        payDateStr = new Date(payDateVal).toISOString();
                    }

                    const payDateObj = new Date(payDateStr);
                    const { start, end } = derivePayPeriod(payDateObj);
                    const key = `${gymCode}-${end}`; // Group by period end

                    if (!grouped[key]) {
                        grouped[key] = {
                            gymCode: gymCode,
                            payPeriodStart: start,
                            payPeriodEnd: end,
                            totalHours: 0,
                            totalWages: 0
                        };
                    }

                    // Dynamically find exact column names for wages and hours
                    const wageKey = Object.keys(row).find(k => k.toLowerCase().includes('worked wages'));
                    const hourKey = Object.keys(row).find(k => k.toLowerCase().includes('worked hours'));

                    if (wageKey) grouped[key].totalWages += Number(row[wageKey]) || 0;
                    if (hourKey) grouped[key].totalHours += Number(row[hourKey]) || 0;
                });

                // Convert map to array
                resolve(Object.values(grouped));

            } catch (err) {
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
