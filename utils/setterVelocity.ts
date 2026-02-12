import { Climb, GymSchedule, SimulatorSetter } from '../types';

export const calculateHistoricalMetrics = (
    climbData: Record<string, Climb[]>,
    gymSchedules: Record<string, GymSchedule> | null,
    lookbackDays: number = 90
): Record<string, SimulatorSetter> => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - lookbackDays);

    const setterStats: Record<string, { totalClimbs: number; shifts: Set<string>; scheduledShifts: number }> = {};

    // 1. Process Actual Production (Velocity)
    Object.values(climbData).flat().forEach(climb => {
        const d = new Date(climb.dateSet);
        if (d < cutoff) return;

        const dateKey = d.toISOString().split('T')[0];
        const names = climb.setter.split(/[,&/]+/).map(s => s.trim()).filter(Boolean);
        const weight = 1 / names.length;

        names.forEach(name => {
            if (!setterStats[name]) {
                setterStats[name] = { totalClimbs: 0, shifts: new Set(), scheduledShifts: 0 };
            }
            setterStats[name].totalClimbs += weight;
            setterStats[name].shifts.add(`${dateKey}_${climb.gymCode}`);
        });
    });

    // 2. Process Schedules (Variance Baseline)
    if (gymSchedules) {
        Object.entries(gymSchedules).forEach(([gymCode, schedule]) => {
            schedule.scheduleByDay.forEach((day, idx) => {
                const d = new Date(schedule.startDay);
                d.setDate(d.getDate() + idx);
                if (d < cutoff || d > now) return;

                const combinedEntries = [...day.routes, ...day.boulders];
                // In humanity schedules, setterCount is usually a number, but names aren't explicitly listed in the ScheduleEntry type?
                // Wait, humanity parser in csvParser.ts uses "Employee Names" to get setterCount.
                // We might need to revisit humanity parsing if we want individual setter attendance.
                // For now, let's assume we can only calculate aggregate gym variance if individual names aren't in ScheduleEntry.
            });
        });
    }

    const results: Record<string, SimulatorSetter> = {};
    Object.entries(setterStats).forEach(([name, stats]) => {
        const shiftCount = stats.shifts.size;
        const avgOutput = shiftCount > 0 ? stats.totalClimbs / shiftCount : 0;

        results[name] = {
            name,
            avgWeeklyOutput: Number(avgOutput.toFixed(1)),
            attendanceVariance: 0, // Placeholder for now
            active: true,
            baseSchedule: [1, 2, 3, 4], // Default Mon-Thu
        };
    });

    return results;
};
