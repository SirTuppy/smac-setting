import { Climb, ProductionStats, SetterProduction } from '../types';

export interface ShiftAnalysisResult {
    efficiencyData: any[];
    timelineData: any[];
    getSynergyData: (type: 'all' | 'rope' | 'boulder', minShifts: number) => any[];
    distData: { size: number; count: number }[];
    refinedMonthlyData: any[];
    getDowData: (type: 'all' | 'rope' | 'boulder') => any[];
    correlations: {
        all: number;
        rope: number;
        boulder: number;
    };
    predictors: {
        boulder: (size: number) => number;
        rope: (size: number) => number;
        split: (size: number) => number;
        total: (size: number) => number;
    };
    dataHealth: number;
    totalShifts: number;
}

export const processShiftAnalysis = (
    data: Record<string, Climb[]>,
    selectedGym: string,
    dateRange: { start: Date; end: Date }
): ShiftAnalysisResult => {
    // 1. Prepare Filtered Data
    const gymsToProcess = selectedGym === 'all' ? Object.keys(data) : [selectedGym];
    let filteredClimbs: Climb[] = [];
    gymsToProcess.forEach(gym => {
        if (data[gym]) filteredClimbs = [...filteredClimbs, ...data[gym]];
    });

    filteredClimbs = filteredClimbs.filter(climb => {
        const d = new Date(climb.dateSet);
        const climbDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const rangeStartDate = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate());
        const rangeEndDate = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate());
        return climbDate >= rangeStartDate && climbDate <= rangeEndDate;
    });

    // Group by unique shift
    const shifts: Record<string, {
        date: Date;
        gymCode: string;
        setters: Set<string>;
        climbCount: number;
        routes: number;
        boulders: number;
    }> = {};

    filteredClimbs.forEach(climb => {
        const d = new Date(climb.dateSet);
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${climb.gymCode}`;

        if (!shifts[dateKey]) {
            shifts[dateKey] = {
                date: d,
                gymCode: climb.gymCode,
                setters: new Set(),
                climbCount: 0,
                routes: 0,
                boulders: 0
            };
        }

        const setterList = climb.setter.split(',').map(s => s.trim());
        setterList.forEach(s => shifts[dateKey].setters.add(s || 'Unknown'));

        shifts[dateKey].climbCount++;
        if (climb.isRoute) shifts[dateKey].routes++;
        else shifts[dateKey].boulders++;
    });

    const shiftArray = Object.values(shifts)
        .filter(s => {
            const crewSize = s.setters.size || 1;
            const boulderPerSetter = s.boulders / crewSize;
            const routePerSetter = s.routes / crewSize;
            return boulderPerSetter <= 12 && routePerSetter <= 3 && (s.boulders > 0 || s.routes > 0);
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 2. Efficiency Data
    const efficiencyData = shiftArray.map(s => {
        const crewSize = s.setters.size;
        return {
            crewSize,
            outputPerSetter: s.climbCount / crewSize,
            ropeOutputPerSetter: s.routes / crewSize,
            boulderOutputPerSetter: s.boulders / crewSize,
            totalOutput: s.climbCount,
            ropeOutput: s.routes,
            boulderOutput: s.boulders,
            date: s.date.toLocaleDateString(),
            gym: s.gymCode
        };
    });

    // 3. Timeline
    const timelineData = shiftArray.map(s => ({
        date: s.date.getTime(),
        displayDate: s.date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
        crewSize: s.setters.size,
        totalOutput: s.climbCount
    }));

    // 4. Synergy
    const pairings: Record<string, any> = {};
    shiftArray.forEach(s => {
        const names = Array.from(s.setters).sort();
        const outputPerSetter = s.climbCount / s.setters.size;
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                const pairKey = `${names[i]} & ${names[j]}`;
                if (!pairings[pairKey]) pairings[pairKey] = { count: 0, sum: 0, ropeSum: 0, boulderSum: 0, ropeShifts: 0, boulderShifts: 0 };
                pairings[pairKey].count++;
                pairings[pairKey].sum += outputPerSetter;
                if (s.routes > 0) { pairings[pairKey].ropeSum += (s.routes / s.setters.size); pairings[pairKey].ropeShifts++; }
                if (s.boulders > 0) { pairings[pairKey].boulderSum += (s.boulders / s.setters.size); pairings[pairKey].boulderShifts++; }
            }
        }
    });

    const getSynergyData = (type: 'all' | 'rope' | 'boulder', minShifts: number) => {
        return Object.entries(pairings).map(([pair, stats]: [string, any]) => {
            let eff = 0;
            let count = 0;
            if (type === 'all') { eff = stats.sum / stats.count; count = stats.count; }
            else if (type === 'rope') { eff = stats.ropeShifts > 0 ? stats.ropeSum / stats.ropeShifts : 0; count = stats.ropeShifts; }
            else { eff = stats.boulderShifts > 0 ? stats.boulderSum / stats.boulderShifts : 0; count = stats.boulderShifts; }
            return { pair, efficiency: eff, count };
        })
            .filter(p => p.count >= minShifts)
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 15);
    };

    // 5. Rhythm (Day of Week)
    const dayStats: Record<number, any> = {};
    shiftArray.forEach(s => {
        const day = s.date.getDay();
        if (!dayStats[day]) dayStats[day] = { count: 0, sum: 0, rSum: 0, bSum: 0, rCount: 0, bCount: 0 };
        dayStats[day].count++;
        dayStats[day].sum += (s.climbCount / s.setters.size);
        if (s.routes > 0) { dayStats[day].rSum += (s.routes / s.setters.size); dayStats[day].rCount++; }
        if (s.boulders > 0) { dayStats[day].bSum += (s.boulders / s.setters.size); dayStats[day].bCount++; }
    });
    const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getDowData = (type: 'all' | 'rope' | 'boulder') => {
        return Object.entries(dayStats).map(([day, stats]: [string, any]) => {
            let eff = 0;
            if (type === 'all') eff = stats.sum / stats.count;
            else if (type === 'rope') eff = stats.rCount > 0 ? stats.rSum / stats.rCount : 0;
            else eff = stats.bCount > 0 ? stats.bSum / stats.bCount : 0;
            return { day: DAYS_MAP[Number(day)], efficiency: eff };
        }).sort((a, b) => DAYS_MAP.indexOf(a.day) - DAYS_MAP.indexOf(b.day));
    };

    // 6. Health
    let unknownSlots = 0;
    shiftArray.forEach(s => {
        if (Array.from(s.setters).some(name => ['unknown', 'n/a'].includes(name.toLowerCase()))) unknownSlots++;
    });
    const dataHealth = shiftArray.length > 0 ? 100 - (unknownSlots / shiftArray.length * 100) : 0;

    // 7. Predictors
    const calculateModel = (dataPoints: { x: number, y: number }[]) => {
        const count = dataPoints.length;
        if (count <= 1) return (size: number) => 0;
        const sumX = dataPoints.reduce((a, b) => a + b.x, 0);
        const sumY = dataPoints.reduce((a, b) => a + b.y, 0);
        const sumXY = dataPoints.reduce((a, b) => a + (b.x * b.y), 0);
        const sumX2 = dataPoints.reduce((a, b) => a + (b.x * b.x), 0);
        const slope = (count * sumX2 - sumX * sumX) === 0 ? 0 : (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / count;
        return (size: number) => {
            const val = intercept + (slope * size);
            return isNaN(val) ? 0 : Math.max(0, val);
        };
    };

    const predictors = {
        boulder: calculateModel(shiftArray.filter(s => s.boulders > 0 && s.routes === 0).map(s => ({ x: s.setters.size, y: s.boulders / s.setters.size }))),
        rope: calculateModel(shiftArray.filter(s => s.routes > 0 && s.boulders === 0).map(s => ({ x: s.setters.size, y: s.routes / s.setters.size }))),
        split: calculateModel(shiftArray.filter(s => s.routes > 0 && s.boulders > 0).map(s => ({ x: s.setters.size, y: (s.boulders + s.routes) / s.setters.size }))),
        total: calculateModel(efficiencyData.map(d => ({ x: d.crewSize, y: d.outputPerSetter })))
    };

    // 8. Correlations
    const calculateCorrelation = (dataPoints: { x: number, y: number }[]) => {
        const count = dataPoints.length;
        if (count <= 1) return 0;
        const sumX = dataPoints.reduce((a, b) => a + b.x, 0);
        const sumY = dataPoints.reduce((a, b) => a + b.y, 0);
        const sumXY = dataPoints.reduce((a, b) => a + (b.x * b.y), 0);
        const sumX2 = dataPoints.reduce((a, b) => a + (b.x * b.x), 0);
        const sumY2 = dataPoints.reduce((a, b) => a + (b.y * b.y), 0);
        const num = (count * sumXY - sumX * sumY);
        const den = Math.sqrt((count * sumX2 - sumX * sumX) * (count * sumY2 - sumY * sumY));
        return den === 0 ? 0 : num / den;
    };

    const correlations = {
        all: calculateCorrelation(efficiencyData.map(d => ({ x: d.crewSize, y: d.outputPerSetter }))),
        rope: calculateCorrelation(efficiencyData.filter(d => d.ropeOutput > 0).map(d => ({ x: d.crewSize, y: d.ropeOutputPerSetter }))),
        boulder: calculateCorrelation(efficiencyData.filter(d => d.boulderOutput > 0).map(d => ({ x: d.crewSize, y: d.boulderOutputPerSetter })))
    };

    // 9. Monthly Trends
    const monthlyTrends: Record<string, any> = {};
    shiftArray.forEach(s => {
        const key = s.date.getFullYear() + '-' + s.date.getMonth();
        if (!monthlyTrends[key]) monthlyTrends[key] = {
            date: new Date(s.date.getFullYear(), s.date.getMonth(), 1),
            display: s.date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
            avgCrew: 0, totalOutput: 0, avgEff: 0, avgREff: 0, avgBEff: 0, rCount: 0, bCount: 0, splitCount: 0, rSCount: 0, bSCount: 0, count: 0
        };
        const m = monthlyTrends[key];
        m.count++;
        m.avgCrew += s.setters.size;
        m.totalOutput += s.climbCount;
        m.avgEff += (s.climbCount / s.setters.size);
        if (s.routes > 0) { m.avgREff += (s.routes / s.setters.size); m.rSCount++; }
        if (s.boulders > 0) { m.avgBEff += (s.boulders / s.setters.size); m.bSCount++; }
        if (s.routes > 0 && s.boulders === 0) m.rCount++;
        else if (s.boulders > 0 && s.routes === 0) m.bCount++;
        else m.splitCount++;
    });

    const refinedMonthlyData = Object.values(monthlyTrends)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(m => ({
            ...m,
            avgCrew: m.count > 0 ? m.avgCrew / m.count : 0,
            avgEfficiency: m.count > 0 ? m.avgEff / m.count : 0,
            avgRopeEfficiency: m.rSCount > 0 ? m.avgREff / m.rSCount : 0,
            avgBoulderEfficiency: m.bSCount > 0 ? m.avgBEff / m.bSCount : 0,
            ropeCount: m.rCount,
            boulderCount: m.bCount
        }));

    const distribution: Record<number, number> = {};
    efficiencyData.forEach(d => { distribution[d.crewSize] = (distribution[d.crewSize] || 0) + 1; });
    const distData = Object.entries(distribution).map(([size, count]) => ({ size: Number(size), count })).sort((a, b) => a.size - b.size);

    return {
        efficiencyData,
        timelineData,
        getSynergyData,
        distData,
        refinedMonthlyData,
        getDowData,
        correlations,
        predictors,
        dataHealth,
        totalShifts: shiftArray.length
    };
};

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
