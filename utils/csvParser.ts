import { Climb } from '../types';
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

