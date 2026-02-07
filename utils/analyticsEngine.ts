import { Climb, ProductionStats, SetterProduction } from '../types';
import { calculateProductionStats as calculateProductionStatsInternal } from './productionStats';

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
    wallStats: Record<string, {
        totalClimbs: number;
        totalSetterShifts: number; // Sum of crewSize for every shift including this wall
        shiftCount: number;
        avgEfficiency: number;
    }>;
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
        walls: Set<string>;
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
                boulders: 0,
                walls: new Set()
            };
        }

        const setterList = climb.setter.split(',').map(s => s.trim());
        setterList.forEach(s => shifts[dateKey].setters.add(s || 'Unknown'));

        shifts[dateKey].climbCount++;
        if (climb.isRoute) shifts[dateKey].routes++;
        else shifts[dateKey].boulders++;
        if (climb.wall) shifts[dateKey].walls.add(climb.wall.toLowerCase().trim());
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
        totalShifts: shiftArray.length,
        wallStats: (() => {
            const stats: Record<string, { totalClimbs: number; totalSetterShifts: number; shiftCount: number; avgEfficiency: number }> = {};

            // 1. Process RAW climbs for totals per wall
            filteredClimbs.forEach(climb => {
                if (!climb.wall) return;
                const wall = climb.wall.toLowerCase().trim();
                if (!stats[wall]) stats[wall] = { totalClimbs: 0, totalSetterShifts: 0, shiftCount: 0, avgEfficiency: 0 };
                stats[wall].totalClimbs++;
            });

            // 2. Process SHIFTS for setter-shifts per wall
            shiftArray.forEach(s => {
                s.walls.forEach(wall => {
                    if (!stats[wall]) return; // Should exist from step 1
                    stats[wall].totalSetterShifts += s.setters.size;
                    stats[wall].shiftCount++;
                });
            });

            // 3. Finalize Efficiency
            Object.keys(stats).forEach(wall => {
                const s = stats[wall];
                s.avgEfficiency = s.totalSetterShifts > 0 ? s.totalClimbs / s.totalSetterShifts : 0;
            });

            return stats;
        })()
    };
};

export const calculateProductionStats = (
    data: Record<string, Climb[]>,
    selectedGyms: string[],
    dateRange: { start: Date; end: Date }
): ProductionStats => {
    return calculateProductionStatsInternal(data, selectedGyms, dateRange);
};
