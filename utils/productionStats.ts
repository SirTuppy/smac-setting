import { Climb, ProductionStats, SetterProduction } from '../types';

export const calculateProductionStats = (
    data: Record<string, Climb[]>,
    selectedGyms: string[],
    dateRange: { start: Date; end: Date }
): ProductionStats => {
    const gymsToProcess = selectedGyms.includes("Regional Overview") ? Object.keys(data) : selectedGyms;
    const filteredClimbs = gymsToProcess.flatMap(gym => {
        const gClimbs = data[gym] || [];
        return gClimbs.map(c => ({
            ...c,
            gymCode: gym,
            localDate: new Date(c.dateSet)
        }));
    }).filter(climb => {
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        return climb.localDate >= start && climb.localDate <= end;
    });

    const total = filteredClimbs.length;
    const routes = filteredClimbs.filter(c => c.isRoute).length;
    const boulders = total - routes;

    const setterMap: Record<string, { total: number; routes: number; boulders: number; gyms: Set<string>; shifts: number }> = {};
    const shiftMap: Record<string, { type: 'rope' | 'boulder' | 'split' }> = {};

    filteredClimbs.forEach(c => {
        const d = c.localDate;
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const names = c.setter.split(',').map(s => s.trim());

        names.forEach(name => {
            if (!setterMap[name]) setterMap[name] = { total: 0, routes: 0, boulders: 0, gyms: new Set(), shifts: 0 };
            setterMap[name].total++;
            setterMap[name].gyms.add(c.gymCode!);
            if (c.isRoute) setterMap[name].routes++;
            else setterMap[name].boulders++;

            const shiftKey = `${name}_${dateKey}_${c.gymCode}`;
            if (!shiftMap[shiftKey]) {
                shiftMap[shiftKey] = { type: c.isRoute ? 'rope' : 'boulder' };
                setterMap[name].shifts++;
            } else {
                const currentType = shiftMap[shiftKey].type;
                if ((currentType === 'rope' && !c.isRoute) || (currentType === 'boulder' && c.isRoute)) {
                    shiftMap[shiftKey].type = 'split';
                }
            }
        });
    });

    const setterData: SetterProduction[] = Object.entries(setterMap)
        .map(([name, s]) => ({
            name, ...s,
            gymCodes: Array.from(s.gyms).join(', ')
        }))
        .sort((a, b) => b.total - a.total);

    const totalShifts = Object.keys(shiftMap).length;
    const ropeShifts = Object.values(shiftMap).filter(s => s.type === 'rope').length;
    const boulderShifts = Object.values(shiftMap).filter(s => s.type === 'boulder').length;
    const splitShifts = Object.values(shiftMap).filter(s => s.type === 'split').length;

    const dailyMap: Record<string, { date: Date, dateKey: string, [gymCode: string]: Date | string | number }> = {};
    const weekdayMap: Record<string, { day: string, routes: number, boulders: number, total: number }> = {
        'Mon': { day: 'Mon', routes: 0, boulders: 0, total: 0 },
        'Tue': { day: 'Tue', routes: 0, boulders: 0, total: 0 },
        'Wed': { day: 'Wed', routes: 0, boulders: 0, total: 0 },
        'Thu': { day: 'Thu', routes: 0, boulders: 0, total: 0 },
        'Fri': { day: 'Fri', routes: 0, boulders: 0, total: 0 },
        'Sat': { day: 'Sat', routes: 0, boulders: 0, total: 0 },
        'Sun': { day: 'Sun', routes: 0, boulders: 0, total: 0 }
    };

    filteredClimbs.forEach(c => {
        const d = c.localDate;
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dispKey = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const weekKey = d.toLocaleDateString(undefined, { weekday: 'short' });

        if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = { date: d, dateKey: dispKey };
        }
        dailyMap[dateKey][c.gymCode!] = ((dailyMap[dateKey][c.gymCode!] as number) || 0) + 1;

        weekdayMap[weekKey].total++;
        if (c.isRoute) weekdayMap[weekKey].routes++;
        else weekdayMap[weekKey].boulders++;
    });

    const dailyData = Object.values(dailyMap).sort((a, b) => a.date.getTime() - b.date.getTime());
    const weekdayData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => weekdayMap[day]);

    return {
        total, routes, boulders,
        totalShifts, ropeShifts, boulderShifts, splitShifts,
        setterData, dailyData, weekdayData,
        activeGymCodes: Array.from(new Set(filteredClimbs.map(c => c.gymCode!)))
    };
};

export const getPreviousPeriod = (
    currentRange: { start: Date; end: Date },
    mode: 'pop' | 'yoy'
): { start: Date; end: Date } => {
    const start = new Date(currentRange.start);
    const end = new Date(currentRange.end);

    if (mode === 'yoy') {
        const prevStart = new Date(start);
        prevStart.setFullYear(start.getFullYear() - 1);
        const prevEnd = new Date(end);
        prevEnd.setFullYear(end.getFullYear() - 1);
        return { start: prevStart, end: prevEnd };
    } else {
        const durationMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - durationMs);
        return { start: prevStart, end: prevEnd };
    }
};

export interface ComparisonDelta {
    absolute: number;
    percent: number;
    trend: 'up' | 'down' | 'neutral';
}

export const calculateDelta = (current: number, previous: number): ComparisonDelta => {
    const absolute = current - previous;
    const percent = previous === 0 ? (current > 0 ? 100 : 0) : (absolute / previous) * 100;

    return {
        absolute,
        percent,
        trend: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'neutral'
    };
};

export const aggregateProductionData = (climbs: Climb[]) => {
    const total = climbs.length;
    const routes = climbs.filter(c => c.isRoute).length;
    const boulders = total - routes;

    return {
        total,
        routes,
        boulders
    };
};
