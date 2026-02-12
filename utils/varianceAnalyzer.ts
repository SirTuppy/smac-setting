import { SimulatorSetter, SimulatorShift, OrbitTarget } from '../types';

export interface OrbitForecast {
    orbitName: string;
    discipline: 'Routes' | 'Boulders';
    targetWeeks: number;
    projectedWeeks: number;
    status: 'on-track' | 'lagging' | 'critical';
}

export interface RotationForecast {
    gymCode: string;
    targetWeeks: number;
    projectedWeeks: number;
    weeklyDebt: number;
    weeklyHorsepower: number;
    status: 'on-track' | 'lagging' | 'critical';
    byOrbit: OrbitForecast[];
    byDiscipline: {
        Boulders: { target: number; projected: number; status: 'on-track' | 'lagging' | 'critical' };
        Routes: { target: number; projected: number; status: 'on-track' | 'lagging' | 'critical' };
    };
}

const getStatus = (projected: number, target: number): RotationForecast['status'] => {
    if (projected > target + 1.5) return 'critical';
    if (projected > target) return 'lagging';
    return 'on-track';
};

export const calculateRotationForecast = (
    gymCode: string,
    setters: Record<string, SimulatorSetter>,
    overrides: Record<string, SimulatorShift>,
    varianceBuffer: number,
    orbitTargets: OrbitTarget[],
    weeksToLookAhead: number = 4
): RotationForecast => {
    // 1. Calculate Total Gym Debt (Volume)
    const totalClimbs = orbitTargets.reduce((sum, o) => sum + o.totalClimbs, 0);
    const avgTargetWeeks = orbitTargets.length > 0
        ? orbitTargets.reduce((sum, o) => sum + o.rotationTarget, 0) / orbitTargets.length
        : 7;

    // 2. Calculate Predicted Weekly Horsepower (Averaged over 4 weeks)
    const startDate = new Date();
    let totalFourWeekHorsepower = 0;

    for (let w = 0; w < weeksToLookAhead; w++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (w * 7));

        Object.values(setters).forEach(setter => {
            if (!setter.active) return;

            let workingDays = 0;
            for (let d = 0; d < 7; d++) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + d);
                const dayKey = dayDate.toISOString().split('T')[0];

                const isScheduled = setter.baseSchedule.includes(dayDate.getDay());
                const isPTO = setter.specialDateModifiers?.[dayKey] === 'pto';

                if (isScheduled && !isPTO) workingDays++;
            }
            totalFourWeekHorsepower += (setter.avgWeeklyOutput * workingDays);
        });
    }

    let avgWeeklyHorsepower = totalFourWeekHorsepower / weeksToLookAhead;

    // Apply Global Variance Buffer
    avgWeeklyHorsepower = avgWeeklyHorsepower * (1 - (varianceBuffer / 100));

    // 3. Projected Weeks (Gym Wide)
    const projectedWeeks = avgWeeklyHorsepower > 0 ? totalClimbs / avgWeeklyHorsepower : Infinity;

    // 4. Per Orbit Forecasts
    const byOrbit: OrbitForecast[] = orbitTargets.map(o => ({
        orbitName: o.orbitName,
        discipline: o.discipline,
        targetWeeks: o.rotationTarget,
        projectedWeeks: Number(projectedWeeks.toFixed(1)),
        status: getStatus(projectedWeeks, o.rotationTarget)
    }));

    // 5. Per Discipline Forecasts
    const boulderOrbits = orbitTargets.filter(o => o.discipline === 'Boulders');
    const routeOrbits = orbitTargets.filter(o => o.discipline === 'Routes');

    const boulderTarget = boulderOrbits.length > 0
        ? boulderOrbits.reduce((sum, o) => sum + o.rotationTarget, 0) / boulderOrbits.length
        : 6;
    const routeTarget = routeOrbits.length > 0
        ? routeOrbits.reduce((sum, o) => sum + o.rotationTarget, 0) / routeOrbits.length
        : 8;

    return {
        gymCode,
        targetWeeks: Number(avgTargetWeeks.toFixed(1)),
        projectedWeeks: Number(projectedWeeks.toFixed(1)),
        weeklyDebt: totalClimbs,
        weeklyHorsepower: Number(avgWeeklyHorsepower.toFixed(1)),
        status: getStatus(projectedWeeks, avgTargetWeeks),
        byOrbit,
        byDiscipline: {
            Boulders: { target: boulderTarget, projected: Number(projectedWeeks.toFixed(1)), status: getStatus(projectedWeeks, boulderTarget) },
            Routes: { target: routeTarget, projected: Number(projectedWeeks.toFixed(1)), status: getStatus(projectedWeeks, routeTarget) }
        }
    };
};

export interface YearlyDataPoint {
    date: string;
    projectedRotation: number;
    capacity: number;
}

export const calculateYearlyOutlook = (
    gymCode: string,
    setters: Record<string, SimulatorSetter>,
    varianceBuffer: number,
    orbitTargets: OrbitTarget[]
): YearlyDataPoint[] => {
    const totalClimbs = orbitTargets.reduce((sum, o) => sum + o.totalClimbs, 0);
    const outlook: YearlyDataPoint[] = [];

    // Start from today, go 52 weeks
    const startDate = new Date();

    for (let i = 0; i < 52; i++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(weekDate.getDate() + (i * 7));

        let weeklyHorsepower = 0;
        Object.values(setters).forEach(setter => {
            if (!setter.active) return;

            // Check if this setter has PTO in this week
            let ptoDays = 0;
            for (let d = 0; d < 7; d++) {
                const dayDate = new Date(weekDate);
                dayDate.setDate(dayDate.getDate() + d);
                const dayKey = dayDate.toISOString().split('T')[0];
                if (setter.specialDateModifiers?.[dayKey] === 'pto') ptoDays++;
            }

            const workingDays = Math.max(0, setter.baseSchedule.length - ptoDays);
            weeklyHorsepower += (setter.avgWeeklyOutput * workingDays);
        });

        // Apply buffer
        weeklyHorsepower = weeklyHorsepower * (1 - (varianceBuffer / 100));

        const projected = weeklyHorsepower > 0 ? totalClimbs / weeklyHorsepower : 52;

        outlook.push({
            date: weekDate.toISOString().split('T')[0],
            projectedRotation: Number(projected.toFixed(1)),
            capacity: Number(weeklyHorsepower.toFixed(0))
        });
    }

    return outlook;
};
