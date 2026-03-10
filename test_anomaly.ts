import { parseKayaCSV } from './utils/csvParser';
import * as fs from 'fs';

const newCsv = fs.readFileSync('multi-gym-climbs.csv', 'utf-8');
const climbs = parseKayaCSV(newCsv);

const anomalousGym = climbs.find(c => c.gymCode.includes('Grade Benchmark'));
if (anomalousGym) {
    console.log("Anomalous Climb:", anomalousGym);
}
