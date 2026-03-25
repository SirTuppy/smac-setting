
import { Climb } from '../types';
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

