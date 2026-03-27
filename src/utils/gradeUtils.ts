export const BOULDER_GRADES = [
    'V-Intro', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'
];

export const ROPE_GRADES = [
    '5.Intro', '5.6', '5.7', '5.8', '5.9',
    '5.10a', '5.10b', '5.10c', '5.10d',
    '5.11a', '5.11b', '5.11c', '5.11d',
    '5.12a', '5.12b', '5.12c', '5.12d',
    '5.13a', '5.13b', '5.13c', '5.13d',
];

export const ALL_GRADES = [...BOULDER_GRADES, ...ROPE_GRADES];

/**
 * Normalizes a grade string to match our standard keys.
 * Handles variations like 'V Intro', '5.10', etc.
 */
export const normalizeGrade = (grade: string): string => {
    let g = grade.trim().toLowerCase();

    // Handle Intro grades
    if (g.includes('intro')) {
        return g.startsWith('v') ? 'V-Intro' : '5.Intro';
    }

    // Handle Boulders (V0, V1, etc.)
    if (g.startsWith('v')) {
        // Remove 'v', then remove any non-numeric characters (like - or spaces)
        const numMatch = g.substring(1).match(/\d+/);
        if (numMatch) {
            return `V${numMatch[0]}`;
        }
        return 'V-Intro';
    }

    // Handle Ropes (5.10a, etc.)
    if (g.startsWith('5.') || g.startsWith('5')) {
        let clean = g;
        if (!g.startsWith('5.')) clean = '5.' + g.substring(1);

        // Handle 5.10 -> 5.10a
        const parts = clean.match(/5\.(\d+)([a-d]?)/);
        if (parts) {
            const num = parseInt(parts[1]);
            const suffix = parts[2];
            if (num >= 10 && !suffix) return `5.${num}a`;
            return `5.${num}${suffix}`;
        }
    }

    return grade; // Fallback
};

export const getGradeScore = (gradeStr: string): number => {
    const g = gradeStr.toLowerCase().trim();

    if (g.startsWith('v')) {
        if (g.includes('intro')) return 0;
        const num = parseFloat(g.substring(1));
        return 1 + (isNaN(num) ? 99 : num);
    }

    if (g.startsWith('5.')) {
        if (g.includes('intro')) return 200;
        const parts = g.substring(2).match(/(\d+)([a-d]?)/);
        if (parts) {
            const num = parseInt(parts[1]);
            const suffix = parts[2];
            let score = 200 + num;
            if (suffix === 'a') score += 0.2;
            if (suffix === 'b') score += 0.4;
            if (suffix === 'c') score += 0.6;
            if (suffix === 'd') score += 0.8;
            return score;
        }
        return 299;
    }
    return 999;
};
