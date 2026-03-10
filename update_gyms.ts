import * as fs from 'fs';

const validationsData = [
    { name: "Design District", region: "Texas", tier: "Tier 2", code: "12800" },
    { name: "The Hill", region: "Texas", tier: "Tier 4", code: "12900" },
    { name: "Denton", region: "Texas", tier: "Tier 3", code: "13500" },
    { name: "Plano", region: "Texas", tier: "Tier 2", code: "13700" },
    { name: "Grapevine", region: "Texas", tier: "Tier 1B", code: "13800" },
    { name: "Englewood", region: "Colorado", tier: "Tier 2", code: "11400" },
    { name: "Boulder", region: "Colorado", tier: "Tier 3", code: "11500" },
    { name: "RiNo", region: "Colorado", tier: "Tier 3", code: "11600" },
    { name: "Baker", region: "Colorado", tier: "Tier 2", code: "11700" },
    { name: "Golden", region: "Colorado", tier: "Tier 3", code: "11800" },
    { name: "Lincoln Park", region: "Chicago", tier: "Tier 1A", code: "12200" },
    { name: "Wrigleyville", region: "Chicago", tier: "Tier 2", code: "12300" },
    { name: "Centennial", region: "Colorado", tier: "Tier 3", code: "12100" },
    { name: "Gowanus", region: "NY/PA", tier: "Tier 3", code: "13000" },
    { name: "Long Island City", region: "NY/PA", tier: "Tier 4", code: "13100" },
    { name: "Valhalla", region: "NY/PA", tier: "Tier 2", code: "13300" },
    { name: "Harlem", region: "NY/PA", tier: "Tier 1B", code: "13200" },
    { name: "Callowhill", region: "NY/PA", tier: "Tier 3", code: "13400" },
    { name: "Fairfax", region: "DMV", tier: "Tier 3", code: "12700" },
    { name: "Mountain View", region: "Bay Area", tier: "Tier 2B", code: undefined },
    { name: "Fishtown", region: "NY/PA", tier: "Tier 2", code: undefined },
];

let content = fs.readFileSync('./constants/gyms.ts', 'utf-8');

validationsData.forEach(gym => {
    // Find the block for the gym name
    const regex = new RegExp(`({\\s*code:\\s*'(?:[^']+)',\\s*name:\\s*'${gym.name}',\\s*region:\\s*')([^']+)(')`, 'g');

    // First, update the region to match exact string
    content = content.replace(regex, `$1${gym.region}$3`);

    // Now add tier and facilityCode
    const blockRegex = new RegExp(`({\\s*code:\\s*'(?:[^']+)',\\s*name:\\s*'${gym.name}',\\s*region:\\s*'${gym.region}',)`);
    let additions = `\n        tier: '${gym.tier}',`;
    if (gym.code) additions += `\n        facilityCode: '${gym.code}',`;

    content = content.replace(blockRegex, `$1${additions}`);
});

fs.writeFileSync('./constants/gyms.ts', content);
console.log('constants/gyms.ts updated with validation data');
