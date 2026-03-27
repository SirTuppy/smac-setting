import { Climb, SetterStats } from '../types';

export const generateRegionalSummary = (
    gymData: Record<string, Climb[]>,
    dateRange: { start: Date; end: Date }
): string[] => {
    const gymNames = Object.keys(gymData);
    const flattened = Object.values(gymData).flat();
    const filtered = flattened.filter(c => c.dateSet >= dateRange.start && c.dateSet <= dateRange.end);

    if (filtered.length === 0) return ["No production data found for this period."];

    const lines: string[] = [];

    // 1. Overall Stats
    const ropes = filtered.filter(c => c.climbType?.toLowerCase().includes('route') || c.grade.startsWith('5.')).length;
    const boulders = filtered.length - ropes;
    lines.push(`Regional total: ${filtered.length} climbs (${ropes} Ropes, ${boulders} Boulders).`);

    // 2. Top Gym
    const gymTotals: Record<string, number> = {};
    filtered.forEach(c => {
        if (c.gym) gymTotals[c.gym] = (gymTotals[c.gym] || 0) + 1;
    });
    const topGym = Object.entries(gymTotals).sort((a, b) => b[1] - a[1])[0];
    if (topGym) {
        lines.push(`Most active location: ${topGym[0]} with ${topGym[1]} climbs set.`);
    }

    // 3. Peak Day
    const dayCounts: Record<number, number> = {};
    filtered.forEach(c => {
        const day = c.dateSet.getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const peakDayEntry = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (peakDayEntry) {
        lines.push(`Regional peak production day: ${weekdays[parseInt(peakDayEntry[0])]}.`);
    }

    // 4. Distribution Analysis
    const highGradeRopes = filtered.filter(c => {
        const isRoute = c.climbType?.toLowerCase().includes('route') || c.grade.startsWith('5.');
        if (!isRoute) return false;
        // Simple check for 5.12+ 
        const grade = c.grade.split('.')[1];
        if (!grade) return false;
        const num = parseInt(grade.match(/\d+/)?.[0] || "0");
        return num >= 12;
    }).length;

    if (highGradeRopes > 0) {
        lines.push(`Development focus: ${highGradeRopes} advanced ropes (5.12+) were introduced this period.`);
    }

    return lines;
};
