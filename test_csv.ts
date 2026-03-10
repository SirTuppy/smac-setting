import { parseKayaCSV } from './utils/csvParser';
import * as fs from 'fs';

const newCsv = fs.readFileSync('multi-gym-climbs.csv', 'utf-8');
const climbs = parseKayaCSV(newCsv);

const grouped = climbs.reduce((acc, c) => {
    acc[c.gymCode] = (acc[c.gymCode] || 0) + 1;
    return acc;
}, {} as any);

console.log("Total climbed parsed:", climbs.length);
console.log("Climbs by Gym Code:", grouped);

// Let's check a random climb from SFO
const sfoClimb = climbs.find(c => c.gymCode === 'SFO');
console.log("Sample SFO Climb:", sfoClimb);

// Let's check for any missing assignments:
const missingWall = climbs.filter(c => !c.wall || c.wall === 'General');
const missingGrade = climbs.filter(c => !c.grade || c.grade === 'Unrated');
const missingType = climbs.filter(c => !c.climbType);

console.log(`Missing Wall: ${missingWall.length}`);
console.log(`Missing Grade: ${missingGrade.length}`);
console.log(`Missing Type: ${missingType.length}`);
