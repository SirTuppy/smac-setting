import { Climb, GymSchedule, ScheduleEntry } from '../types';
import { normalizeGrade, getGradeScore } from './gradeUtils';
import { GYM_WALLS, TEMPLATE_COORDS, GYM_DISPLAY_NAMES, GYM_SEARCH_KEYWORDS } from '../constants/mapTemplates';

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
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/_/g, '').replace(/ /g, ''));
  const getIndex = (possibleKeys: string[]) => headers.findIndex(h => possibleKeys.some(k => h === k.toLowerCase()));

  const nameIdx = getIndex(['name', 'climbname']);
  const gradeIdx = getIndex(['grade', 'difficulty']);
  const setterIdx = getIndex(['setter', 'setby']);
  const wallIdx = getIndex(['wall', 'location']);
  const dateIdx = getIndex(['dateset', 'date', 'createdat']);
  const colorIdx = getIndex(['color', 'holdcolor']);
  const typeIdx = getIndex(['climbtype', 'type']);

  if (nameIdx === -1 || gradeIdx === -1 || setterIdx === -1) {
    throw new Error("Invalid CSV format. Missing required columns (Name, Grade, Setter).");
  }

  const climbs: Climb[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, ''));
    if (row.length < 3) continue;

    const rawGrade = row[gradeIdx] || 'Unrated';
    const normalizedGrade = normalizeGrade(rawGrade);

    climbs.push({
      id: `climb-${i}`,
      name: row[nameIdx] || 'Untitled',
      grade: rawGrade,
      setter: (row[setterIdx] || 'N/A').trim(),
      wall: row[wallIdx] || 'General',
      dateSet: cleanKayaDate(row[dateIdx]),
      color: colorIdx !== -1 ? row[colorIdx] : undefined,
      climbType: row[typeIdx],
      gym: gymName,
      isRoute: (row[typeIdx] || '').toLowerCase().includes('route') || rawGrade.startsWith('5.'),
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

const parseWalls = (titleStr: string, gymCode: string) => {
  const currentGymWalls = GYM_WALLS[gymCode];
  if (!titleStr || !currentGymWalls) return [];
  const expandedTitle = expandWallRanges(titleStr);
  const cleanTitle = expandedTitle.toLowerCase().replace('jcca - ', '');
  const parts = cleanTitle.replace(/\./g, '').split(/[,\/\s+]+/g).filter(s => s);
  const walls: string[] = [];
  let buffer: string[] = [];
  for (const part of parts) {
    buffer.push(part);
    const potentialWall = buffer.join(' ');
    if (currentGymWalls[potentialWall]) {
      walls.push(potentialWall);
      buffer = [];
    }
  }
  for (const part of buffer) {
    if (currentGymWalls[part]) walls.push(part);
  }
  return [...new Set(walls)];
};

const getWallType = (walls: string[], gymCode: string) => {
  if (walls.includes('ropes')) return 'rope';
  if (walls.includes('boulders')) return 'boulder';
  const firstWall = walls.find(w => GYM_WALLS[gymCode][w]);
  return firstWall ? GYM_WALLS[gymCode][firstWall].type : null;
};

const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
const formatDateFile = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const parseHumanityCSV = (csvText: string): Record<string, GymSchedule> => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return {};

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    const entry: any = {};
    headers.forEach((h, i) => entry[h] = values[i]);
    return entry;
  });

  const allSchedules: Record<string, GymSchedule> = {};
  const gymCodes = Object.keys(GYM_DISPLAY_NAMES);

  gymCodes.forEach(gymCode => {
    const gymRows = rows.filter(row => (row['Location'] || '').includes(GYM_SEARCH_KEYWORDS[gymCode]));
    if (gymRows.length === 0) return;

    const scheduleByDate: Record<string, { date: Date, entries: any[] }> = {};
    gymRows.forEach(row => {
      const dateStr = row['Start Date'];
      const title = (row['Title'] || '').toLowerCase();
      const skipTitles = ['admin', 'personal training', 'washing', 'forerunning', 'climb time', '@hill', '@design', '@plano', '@dtn', '@ftw'];
      if (skipTitles.some(skip => title.includes(skip)) || !dateStr) return;

      const setterCount = (row['Employee Names'] || '').split('/').filter((n: string) => n.trim()).length;
      if (setterCount === 0) return;

      let walls = parseWalls(title, gymCode);
      if (walls.length === 0) {
        if (title.includes('rope')) walls = ['ropes'];
        else if (title.includes('boulder')) walls = ['boulders'];
        else return;
      }

      if (!scheduleByDate[dateStr]) scheduleByDate[dateStr] = { date: new Date(dateStr), entries: [] };
      scheduleByDate[dateStr].entries.push({ walls, setterCount });
    });

    const dates = Object.values(scheduleByDate).map(d => d.date).sort((a, b) => a.getTime() - b.getTime());
    if (dates.length === 0) return;

    const gymConfig = TEMPLATE_COORDS[gymCode];
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
      const dayIdx = Math.floor((day.date.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIdx >= 0 && dayIdx < 14) {
        day.entries.forEach(entry => {
          const type = getWallType(entry.walls, gymCode);
          if (!type) return;
          const target = (type === 'rope') ? scheduleByDay[dayIdx].routes : scheduleByDay[dayIdx].boulders;
          target.push({
            id: Math.random().toString(36).substr(2, 9),
            walls: entry.walls,
            setterCount: entry.setterCount,
            climbType: type.charAt(0).toUpperCase() + type.slice(1)
          });
        });
      }
    });

    allSchedules[gymCode] = {
      scheduleByDay,
      dateRange: `${formatDate(startDay)}-${formatDate(endDay)}`,
      fileDateRange: `${formatDateFile(startDay)}-${formatDateFile(endDay)}`,
      startDay
    };
  });

  return allSchedules;
};
