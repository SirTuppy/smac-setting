import { Climb, GymSchedule, ScheduleEntry } from '../types';
import { normalizeGrade, getGradeScore } from './gradeUtils';
import { GYM_WALLS, TEMPLATE_COORDS, getGymCode } from '../constants/mapTemplates';
import { SKIP_TITLES } from '../constants/gyms';
import Papa from 'papaparse';

/**
 * Strips the 'GMT' and timezone suffix from KAYA date strings to ensure
 * compatibility with standard Date parsing.
 */
const cleanKayaDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const cleanStr = dateStr.split('GMT')[0].trim();
  const parsedDate = new Date(cleanStr);
  if (isNaN(parsedDate.getTime())) {
    const originalDate = new Date(dateStr);
    return isNaN(originalDate.getTime()) ? new Date() : originalDate;
  }
  return parsedDate;
};

export const parseKayaCSV = (csvText: string, gymName?: string): Climb[] => {
  const parsed = Papa.parse<any>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/_/g, '').replace(/ /g, '')
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV Parsing Issues:", parsed.errors);
  }

  const data = parsed.data;
  if (data.length === 0) return [];

  // Find the actual keys used in the objects based on our transformed headers
  const getIndex = (possibleKeys: string[]) => Object.keys(data[0]).find(h => possibleKeys.some(k => h === k.toLowerCase()));

  const nameKey = getIndex(['name', 'climbname']);
  const gradeKey = getIndex(['grade', 'difficulty', 'gradename']);
  const setterKey = getIndex(['setter', 'setby', 'setters']);
  const wallKey = getIndex(['wall', 'location', 'wallname']);
  const dateKey = getIndex(['dateset', 'date', 'createdat']);
  const colorKey = getIndex(['color', 'holdcolor']);
  const typeKey = getIndex(['climbtype', 'type']);
  const gymKey = getIndex(['gym', 'location', 'gymname']);

  if (!nameKey || !gradeKey || !setterKey) {
    throw new Error("Invalid CSV format. Missing required columns (Name, Grade, Setter).");
  }

  const climbs: Climb[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const rawGrade = row[gradeKey] || 'Unrated';
    const normalizedGrade = normalizeGrade(rawGrade);

    // Resolve gym: check CSV column first, then fallback to argument
    const rawGymName = gymKey ? (row[gymKey] || gymName) : gymName;
    const resolvedGymCode = getGymCode(rawGymName || '') || rawGymName;

    const rawType = row[typeKey] || '';
    const isRoute = rawType.toLowerCase().includes('route') || rawGrade.startsWith('5.');

    climbs.push({
      id: `climb-${resolvedGymCode}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      name: row[nameKey] || 'Untitled',
      grade: rawGrade,
      setter: (row[setterKey] || 'N/A').trim(),
      wall: row[wallKey] || 'General',
      dateSet: cleanKayaDate(row[dateKey]),
      color: colorKey ? row[colorKey] : undefined,
      climbType: rawType,
      gym: rawGymName,
      gymCode: resolvedGymCode,
      isRoute,
      normalizedGrade,
      gradeScore: getGradeScore(normalizedGrade)
    });
  }
  return climbs;
};

// --- Humanity Schedule Parsing Logic (Ported from yellowMapsV2) ---

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

const parseWalls = (titleStr: string, gymCode: string, userMappings?: Record<string, Record<string, { type: 'rope' | 'boulder' | 'ignored' }>>) => {
  const currentGymWalls = GYM_WALLS[gymCode] || {};
  const gymUserMappings = userMappings?.[gymCode] || {};

  if (!titleStr) return [];

  const expandedTitle = expandWallRanges(titleStr);
  // Remove known noise prefixes
  const cleanTitle = expandedTitle.toLowerCase()
    .replace('jcca - ', '')
    .replace('setting - ', '')
    .replace('set - ', '')
    .replace(gymCode.toLowerCase(), '')
    .replace(/\./g, '');

  const parts = cleanTitle.split(/[,\/\s+]+/g).filter(s => s);
  const walls: string[] = [];
  let buffer: string[] = [];

  for (const part of parts) {
    buffer.push(part);
    const potentialWall = buffer.join(' ');
    if (currentGymWalls[potentialWall] || gymUserMappings[potentialWall]) {
      walls.push(potentialWall);
      buffer = [];
    }
  }

  for (const part of buffer) {
    if (currentGymWalls[part] || gymUserMappings[part]) walls.push(part);
  }

  return [...new Set(walls)];
};

const getWallType = (walls: string[], gymCode: string, userMappings?: Record<string, Record<string, { type: 'rope' | 'boulder' | 'ignored' }>>) => {
  if (walls.includes('ropes')) return 'rope';
  if (walls.includes('boulders')) return 'boulder';

  const currentGymWalls = GYM_WALLS[gymCode] || {};
  const gymUserMappings = userMappings?.[gymCode] || {};

  const firstWall = walls.find(w => currentGymWalls[w] || gymUserMappings[w]);

  if (firstWall) {
    if (currentGymWalls[firstWall]) return currentGymWalls[firstWall].type;
    if (gymUserMappings[firstWall]) {
      const mapping = gymUserMappings[firstWall];
      return mapping.type === 'ignored' ? 'ignored' : mapping.type;
    }
  }

  // Fallback for unrecognized walls or generic "Setting" shifts
  return 'boulder';
};

const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
const formatDateFile = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

interface ParseHumanityResult {
  schedules: Record<string, GymSchedule>;
  unrecognized: Record<string, string[]>;
  newGyms: Record<string, string>; // code -> fullName
}

export const parseHumanityCSV = (
  csvText: string,
  userWallMappings: Record<string, Record<string, { type: 'rope' | 'boulder' | 'ignored' }>> = {}
): ParseHumanityResult => {
  const parsed = Papa.parse<any>(csvText.trim(), {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    console.error("CSV Parsing Errors:", parsed.errors);
  }

  const rows = parsed.data;
  const allSchedules: Record<string, GymSchedule> = {};
  const unrecognized: Record<string, string[]> = {};
  const newGyms: Record<string, string> = {};

  const locations = [...new Set(rows.map(r => r['Location']).filter(Boolean))];

  locations.forEach(location => {
    let gymCode = getGymCode(location as string);
    const isNewGym = !gymCode;

    if (isNewGym) {
      gymCode = (location as string).replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
      if (allSchedules[gymCode]) gymCode += '2';
      newGyms[gymCode] = location as string;
    }

    const gymRows = rows.filter(row => row['Location'] === location);
    if (gymRows.length === 0) return;

    const scheduleByDate: Record<string, { date: Date, entries: any[] }> = {};

    gymRows.forEach(row => {
      const dateStr = row['Start Date'];
      const title = (row['Title'] || '').toLowerCase();

      // Only drop rows missing a date or matching your global SKIP_TITLES array
      if (!dateStr || SKIP_TITLES.some(skip => title.includes(skip))) return;

      const setterCount = (row['Employee Names'] || '')
        .split(/[/\,&]+/)
        .filter((n: string) => n.trim().length > 1)
        .length;

      if (setterCount === 0) return;

      let walls = parseWalls(title, gymCode!, userWallMappings);

      // FORGIVING FALLBACK: If no exact walls match, format the string nicely or default to "Setting"
      if (walls.length === 0) {
        if (title.includes('rope')) {
          walls = ['ropes'];
        } else if (title.includes('boulder')) {
          walls = ['boulders'];
        } else {
          if (!unrecognized[gymCode!]) unrecognized[gymCode!] = [];
          const cleanTitle = title.replace('jcca - ', '').replace('setting - ', '').trim();
          if (cleanTitle && !unrecognized[gymCode!].includes(cleanTitle)) {
            unrecognized[gymCode!].push(cleanTitle);
          }

          const fallbackStr = cleanTitle
            ? cleanTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : 'Setting';
          walls = [fallbackStr];
        }
      }

      // Anchor date to noon to prevent UTC timezone drift
      const safeDateStr = `${dateStr} 12:00:00`;
      const parsedDate = new Date(safeDateStr);

      const dateKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;

      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = { date: parsedDate, entries: [] };
      }

      scheduleByDate[dateKey].entries.push({
        walls,
        setterCount,
        rawId: Math.random().toString(36).substr(2, 9)
      });
    });

    const dates = Object.values(scheduleByDate)
      .map(d => d.date)
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return;

    const gymConfig = TEMPLATE_COORDS[gymCode!] || { weekStartDay: 'Monday', displayMode: 'separate', ropeTypeName: 'Rope' };

    const firstDate = dates[0];
    const startDay = new Date(firstDate);
    if (gymConfig.weekStartDay === 'Monday') {
      const adjustment = (startDay.getDay() === 0) ? 6 : startDay.getDay() - 1;
      startDay.setDate(startDay.getDate() - adjustment);
    } else {
      startDay.setDate(startDay.getDate() - startDay.getDay());
    }

    const endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + (gymConfig.weekStartDay === 'Monday' ? 11 : 13));

    const scheduleByDay = Array(14).fill(null).map(() => ({ routes: [] as ScheduleEntry[], boulders: [] as ScheduleEntry[] }));

    Object.values(scheduleByDate).forEach(day => {
      // Math.round protects against daylight saving time shifts
      const dayIdx = Math.round((day.date.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));

      if (dayIdx >= 0 && dayIdx < 14) {
        day.entries.forEach(entry => {
          const type = getWallType(entry.walls, gymCode!, userWallMappings);
          if (!type || type === 'ignored') return;

          const climbTypeLabel = type.charAt(0).toUpperCase() + type.slice(1);
          const target = (type === 'rope') ? scheduleByDay[dayIdx].routes : scheduleByDay[dayIdx].boulders;

          // MERGE LOGIC: Smash all same-day shifts together to prevent vertical UI overflow
          if (target.length > 0) {
            target[0].walls = [...new Set([...target[0].walls, ...entry.walls])];
            target[0].setterCount += entry.setterCount;
          } else {
            target.push({
              id: entry.rawId,
              walls: entry.walls,
              setterCount: entry.setterCount,
              climbType: climbTypeLabel
            });
          }
        });
      }
    });

    allSchedules[gymCode!] = {
      scheduleByDay,
      dateRange: `${formatDate(startDay)}-${formatDate(endDay)}`,
      fileDateRange: `${formatDateFile(startDay)}-${formatDateFile(endDay)}`,
      startDay
    };
  });

  return { schedules: allSchedules, unrecognized, newGyms };
};
