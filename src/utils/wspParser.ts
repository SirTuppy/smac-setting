import Papa from 'papaparse';
import { GYM_WALLS, getGymCode } from '../constants/mapTemplates';
import { GYMS, SKIP_TITLES } from '../constants/gyms';
import { WSPGymData, WSPScheduleRow } from '../types';

export interface ParseWSPResult {
    plans: Record<string, WSPGymData>;
    unrecognized: Record<string, string[]>;
}

const expandWallRanges = (titleStr: string) => {
    const namedRangeRegex = /([a-zA-Z]+)(\d+)-([a-zA-Z]+)(\d+)/g;
    const simpleRangeRegex = /([a-zA-Z]+)(\d+)-(\d+)/g;
    let expandedStr = titleStr;
    expandedStr = expandedStr.replace(namedRangeRegex, (match, prefix1, startStr, prefix2, endStr) => {
        if (prefix1 !== prefix2) return match;
        const min = Math.min(parseInt(startStr), parseInt(endStr));
        const max = Math.max(parseInt(startStr), parseInt(endStr));
        const expanded = [];
        for (let i = min; i <= max; i++) expanded.push(prefix1 + i);
        return expanded.join(', ');
    });
    expandedStr = expandedStr.replace(simpleRangeRegex, (match, prefix, startStr, endStr) => {
        const min = Math.min(parseInt(startStr), parseInt(endStr));
        const max = Math.max(parseInt(startStr), parseInt(endStr));
        const expanded = [];
        for (let i = min; i <= max; i++) expanded.push(prefix + i);
        return expanded.join(', ');
    });
    return expandedStr;
};

const parseWallsAndFindUnrecognized = (titleStr: string, gymCode: string, userMappings: Record<string, { type: 'rope' | 'boulder' | 'ignored' }>) => {
    const currentGymWalls = GYM_WALLS[gymCode] || {};
    const gymUserMappings = userMappings || {};

    if (!titleStr) return { recognized: [], unrecognized: [] };

    const expandedTitle = expandWallRanges(titleStr);
    const cleanTitle = expandedTitle.toLowerCase()
        .replace('jcca - ', '')
        .replace('setting - ', '')
        .replace('set - ', '')
        .replace((gymCode || '').toLowerCase(), '')
        .replace(/\./g, '');

    const parts = cleanTitle.split(/[,\/\s+]+/g).filter(s => s);
    const recognized: string[] = [];
    const unrecognized: string[] = [];
    let buffer: string[] = [];

    for (const part of parts) {
        buffer.push(part);
        const potentialWall = buffer.join(' ');
        if (currentGymWalls[potentialWall] || gymUserMappings[potentialWall]) {
            recognized.push(potentialWall);
            buffer = [];
        }
    }

    for (const part of buffer) {
        if (currentGymWalls[part] || gymUserMappings[part]) {
            recognized.push(part);
        } else if (part !== 'rope' && part !== 'boulder' && part !== 'ropes' && part !== 'boulders') {
            unrecognized.push(part);
        } else {
            recognized.push(part);
        }
    }

    return { recognized, unrecognized };
};

const getSafeDateObj = (val: any) => {
    if (typeof val === 'string' && val.length === 10) return new Date(val + 'T12:00:00');
    return new Date(val);
};

const getGymNameFromRow = (row: any) => {
    const loc = (row['Location'] || '').toUpperCase();
    const match = GYMS.find(g => 
        loc.includes(g.name.toUpperCase()) || 
        g.searchKeywords.some(kw => loc.includes(kw.toUpperCase()))
    );
    return match ? match.name : null;
};

const formatSetterName = (fullName: string, formatSetting: 'first' | 'full') => {
    if (!fullName) return '';
    const cleanName = fullName.replace('Open Shift', '').trim();
    if (!cleanName) return '';
    if (formatSetting === 'first') return cleanName.split(' ')[0];
    return cleanName;
};

const formatZones = (zonesList: string[]) => {
    if (!zonesList || zonesList.length === 0) return "";
    
    const toTitleCase = (str: string) => {
        return str.split(/\s+/).map(word => {
            return word.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-');
        }).join(' ');
    };

    let uniqueZones = [...new Set(zonesList)].map(toTitleCase);
    
    const groups: Record<string, number[]> = {};
    const standalone: string[] = [];
    
    const regex = /^([A-Za-z]+)(\d+)$/;
    uniqueZones.forEach(zone => {
        const match = zone.match(regex);
        if (match) {
            const prefix = match[1].toUpperCase();
            const num = parseInt(match[2], 10);
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(num);
        } else {
            standalone.push(zone);
        }
    });
    
    const formattedGroups: string[] = [];
    Object.keys(groups).sort().forEach(prefix => {
        const nums = groups[prefix].sort((a, b) => a - b);
        const min = nums[0];
        const max = nums[nums.length - 1];
        
        if (min === max) {
            formattedGroups.push(`${prefix}${min}`);
        } else {
            formattedGroups.push(`${prefix}${min}-${prefix}${max}`);
        }
    });

    return [...formattedGroups, ...standalone].join(', ');
};

export const parseWSPCSV = (
    csvText: string,
    nameFormat: 'first' | 'full',
    userWallMappings: Record<string, Record<string, { type: 'rope' | 'boulder' | 'ignored' }>>,
    includeDefaultText: boolean = true
): ParseWSPResult => {
    const parsed = Papa.parse<any>(csvText.trim(), { header: true, skipEmptyLines: true });
    
    if (parsed.errors.length > 0) {
        console.error("CSV Parsing Errors for WSP:", parsed.errors);
    }

    const data = parsed.data;
    const dataByGym: Record<string, any[]> = {};
            
    data.forEach(row => {
        const gym = getGymNameFromRow(row);
        if (gym) {
            if (!dataByGym[gym]) dataByGym[gym] = [];
            dataByGym[gym].push(row);
        }
    });

    const unrecognized: Record<string, string[]> = {};
    const processedGyms: Record<string, any> = {};

    Object.keys(dataByGym).forEach(gymName => {
        const gymData = dataByGym[gymName];
        const gymObj = GYMS.find(g => g.name === gymName);
        const gymCode = gymObj ? gymObj.code : '';
        const userMappings = userWallMappings[gymCode] || {};
        
        let validDates: Date[] = [];
        let scheduleByDay: Record<number, { setters: Set<string>, blocks: any[] }> = {};
        for(let i=1; i<=5; i++) {
            scheduleByDay[i] = { setters: new Set(), blocks: [] };
        }

        let gymUnrecognized = new Set<string>();
        
        gymData.forEach(row => {
            const dateStr = row['Start Date'];
            if (!dateStr) return;

            const title = (row['Title'] || '').toLowerCase();
            if (SKIP_TITLES.some(skip => title.includes(skip))) return;

            const dateObj = getSafeDateObj(dateStr);
            if (isNaN(dateObj.getTime())) return;
            
            validDates.push(dateObj);

            const dayOfWeek = dateObj.getDay(); 
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Mon-Fri
                const names = (row['Employee Names'] || '').split(/[/,]+/)
                    .map((n: string) => formatSetterName(n.trim(), nameFormat))
                    .filter((n: string) => n);
                
                names.forEach((n: string) => scheduleByDay[dayOfWeek].setters.add(n));

                if (names.length > 0 || row['Title']) {
                    const { recognized, unrecognized: unrec } = parseWallsAndFindUnrecognized(title, gymCode, userMappings);
                    unrec.forEach((u: string) => gymUnrecognized.add(u));

                    scheduleByDay[dayOfWeek].blocks.push({
                        title: row['Title'] || '',
                        parsedWalls: recognized.concat(unrec),
                        isRope: title.includes('rope'),
                        isBoulder: title.includes('boulder'),
                        note: row['Note'] || row['note'] || ''
                    });
                }
            }
        });

        if (gymUnrecognized.size > 0) {
            unrecognized[gymCode] = Array.from(gymUnrecognized);
        }
        processedGyms[gymName] = { validDates, scheduleByDay, gymCode, userMappings };
    });

    const plans: Record<string, WSPGymData> = {};
    const daysMap = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

    Object.keys(processedGyms).forEach(gymName => {
        const { validDates, scheduleByDay, gymCode, userMappings } = processedGyms[gymName];
        if (validDates.length === 0) return;

        validDates.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        const firstDate = new Date(validDates[0]);

        const day = firstDate.getDay();
        const diff = firstDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(firstDate.setDate(diff));
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        const formatDate = (d: Date) => `${d.getMonth()+1}.${d.getDate()}`;
        const dateRangeStr = `${formatDate(monday)} - ${formatDate(friday)}`;

        const rows: WSPScheduleRow[] = [];
        
        for (let i = 1; i <= 5; i++) {
            const dayData = scheduleByDay[i];
            const dayStr = daysMap[i-1];
            
            if (dayData.setters.size === 0 && dayData.blocks.length === 0) {
                rows.push({
                    id: `${gymCode}-${dayStr}`,
                    day: dayStr,
                    setters: 'No setting',
                    type: '',
                    zones: '',
                    notes: ''
                });
            } else {
                const settersArr = Array.from(dayData.setters) as string[];
                const validBlocks = dayData.blocks;
                
                let isRope = false;
                let isBoulder = false;
                const validZones: string[] = [];

                validBlocks.forEach((b: any) => {
                    if (b.isRope) isRope = true;
                    if (b.isBoulder) isBoulder = true;

                    b.parsedWalls.forEach((wall: string) => {
                        let type: string | null = null;
                        if (wall.includes('rope')) type = 'rope';
                        else if (wall.includes('boulder')) type = 'boulder';
                        else if (gymCode && GYM_WALLS[gymCode] && GYM_WALLS[gymCode][wall]) type = GYM_WALLS[gymCode][wall].type;
                        else if (userMappings[wall]) type = userMappings[wall].type;

                        if (type === 'rope') isRope = true;
                        if (type === 'boulder') isBoulder = true;

                        if (type !== 'ignored' && wall !== 'rope' && wall !== 'boulder' && wall !== 'ropes' && wall !== 'boulders') {
                            validZones.push(wall);
                        }
                    });
                });
                
                let typeStr = "Boulders";
                if (isRope && isBoulder) typeStr = "Boulders & Ropes";
                else if (isRope) typeStr = "Ropes";
                else if (isBoulder) typeStr = "Boulders";

                let zones = formatZones(validZones);
                let notes = validBlocks.map((b: any) => b.note)
                    .filter((n: string) => n !== undefined && n !== '')
                    .join(', ');

                rows.push({
                    id: `${gymCode}-${dayStr}`,
                    day: dayStr,
                    setters: settersArr.join(', '),
                    type: typeStr,
                    zones: zones,
                    notes: notes.length > 0 ? notes : ""
                });
            }
        }

        plans[gymName] = {
            rows,
            generalNotes: includeDefaultText
                ? [
                    "[Use this bulleted section to say things that are relevant to the week such as goals, activations, asks from other departments, or reminders for the setting teams.]",
                    "Zeffie is out of town this week so production will be down slightly",
                    "Planning to set a mega route on the back TR wall on Friday!"
                ]
                : [''],
            settersChoice: includeDefaultText
                ? ["[Use this line to include specific notes for the Marketing Lead]"]
                : [''],
            // Adding dateRange for convenience inside the UI
            dateRange: dateRangeStr
        } as WSPGymData & { dateRange: string };
    });

    return { plans, unrecognized };
};
