import { parseKayaCSV } from './utils/csvParser';
import * as fs from 'fs';

const newCsv = fs.readFileSync('multi-gym-climbs.csv', 'utf-8');
const climbs = parseKayaCSV(newCsv);

// Find climbs where gymCode is junk
const junkGymClimbs = climbs.filter(c => c.gymCode.includes('Grade Benchmark'));
console.log("Total junk Gyms:", junkGymClimbs.length);
if (junkGymClimbs.length > 0) {
    console.log("Sample junk Gym Climb Name:", junkGymClimbs[0].name);
    console.log("Sample junk Gym Climb Gym Code:", junkGymClimbs[0].gymCode);
    console.log("Sample junk Gym Climb Date:", junkGymClimbs[0].dateSet);
}
