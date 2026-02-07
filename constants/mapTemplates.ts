import { GYMS } from './gyms';

export const GYM_WALLS: Record<string, Record<string, { type: 'rope' | 'boulder', climb_type: string }>> = {
    'DSN': {
        "ziggy": { "type": "rope", "climb_type": "Slab" },
        "stardust": { "type": "rope", "climb_type": "Slab" },
        "sandy beaches": { "type": "rope", "climb_type": "Vert" },
        "beaches": { "type": "rope", "climb_type": "Vert" },
        "sunset slab": { "type": "rope", "climb_type": "Slab" },
        "cardinal": { "type": "rope", "climb_type": "Slab" },
        "sunrise": { "type": "rope", "climb_type": "Vert" },
        "arete": { "type": "rope", "climb_type": "Vert" },
        "easter island": { "type": "rope", "climb_type": "Vert" },
        "island": { "type": "rope", "climb_type": "Vert" },
        "undertow": { "type": "rope", "climb_type": "Steep" },
        "hang 10": { "type": "rope", "climb_type": "Vert" },
        "hang": { "type": "rope", "climb_type": "Vert" },
        "tidal wave": { "type": "rope", "climb_type": "Overhang" },
        "marianas trench": { "type": "rope", "climb_type": "Vert" },
        "trench": { "type": "rope", "climb_type": "Vert" },
        "arch": { "type": "rope", "climb_type": "Steep" },
        "the reef": { "type": "rope", "climb_type": "Vert" },
        "reef": { "type": "rope", "climb_type": "Vert" },
        "a1": { "type": "boulder", "climb_type": "Slab" },
        "a2": { "type": "boulder", "climb_type": "Slab" },
        "a3": { "type": "boulder", "climb_type": "Vert" },
        "a4": { "type": "boulder", "climb_type": "Vert" },
        "a5": { "type": "boulder", "climb_type": "Overhang" },
        "a6": { "type": "boulder", "climb_type": "Steep" },
        "a7": { "type": "boulder", "climb_type": "Steep" },
        "b1": { "type": "boulder", "climb_type": "Vert" },
        "b2": { "type": "boulder", "climb_type": "Slab" },
        "b3": { "type": "boulder", "climb_type": "Slab" },
        "b4": { "type": "boulder", "climb_type": "Vert" },
        "b5": { "type": "boulder", "climb_type": "Overhang" },
        "b6": { "type": "boulder", "climb_type": "Overhang" },
        "b7": { "type": "boulder", "climb_type": "Overhang" },
        "c1": { "type": "boulder", "climb_type": "Slab" },
        "c2": { "type": "boulder", "climb_type": "Slab" },
        "c3": { "type": "boulder", "climb_type": "Vert" },
        "c4": { "type": "boulder", "climb_type": "Vert" },
        "c5": { "type": "boulder", "climb_type": "Overhang" },
        "c6": { "type": "boulder", "climb_type": "Overhang" },
        "c7": { "type": "boulder", "climb_type": "Overhang" },
    },
    'GVN': {
        "spray wall": { "type": "boulder", "climb_type": "Vert" },
        "canyon left": { "type": "rope", "climb_type": "Vert" },
        "canyon right": { "type": "rope", "climb_type": "Vert" },
        "cove": { "type": "rope", "climb_type": "Vert" },
        "flank": { "type": "rope", "climb_type": "Vert" },
        "peninsula left": { "type": "rope", "climb_type": "Vert" },
        "peninsula mid": { "type": "rope", "climb_type": "Vert" },
        "peninsula right": { "type": "rope", "climb_type": "Vert" },
        "pen right": { "type": "rope", "climb_type": "Vert" },
        "speed wall": { "type": "rope", "climb_type": "Vert" },
        "steep left": { "type": "rope", "climb_type": "Vert" },
        "steep right": { "type": "rope", "climb_type": "Vert" },
        "the slab": { "type": "rope", "climb_type": "Slab" },
        "b1": { "type": "boulder", "climb_type": "Slab" },
        "b2": { "type": "boulder", "climb_type": "Slab" },
        "b3": { "type": "boulder", "climb_type": "Vert" },
        "b4": { "type": "boulder", "climb_type": "Vert" },
        "b5": { "type": "boulder", "climb_type": "Overhang" },
        "b6": { "type": "boulder", "climb_type": "Overhang" },
        "b7": { "type": "boulder", "climb_type": "Overhang" },
        "b8": { "type": "boulder", "climb_type": "Vert" },
        "b9": { "type": "boulder", "climb_type": "Vert" },
        "b10": { "type": "boulder", "climb_type": "Vert" },
        "b11": { "type": "boulder", "climb_type": "Vert" },
        "b12": { "type": "boulder", "climb_type": "Vert" }
    },
    'PLN': {
        "kids wall": { "type": "rope", "climb_type": "Vert" },
        "north a": { "type": "rope", "climb_type": "Vert" },
        "north b": { "type": "rope", "climb_type": "Vert" },
        "north c": { "type": "rope", "climb_type": "Vert" },
        "north d": { "type": "rope", "climb_type": "Vert" },
        "north e": { "type": "rope", "climb_type": "Vert" },
        "south left": { "type": "rope", "climb_type": "Vert" },
        "south mid": { "type": "rope", "climb_type": "Vert" },
        "south right": { "type": "rope", "climb_type": "Vert" },
        "the slab": { "type": "rope", "climb_type": "Vert" },
        "tower a": { "type": "rope", "climb_type": "Vert" },
        "tower b": { "type": "rope", "climb_type": "Vert" },
        "tower c": { "type": "rope", "climb_type": "Vert" },
        "tower d": { "type": "rope", "climb_type": "Vert" },
        "b1": { "type": "boulder", "climb_type": "Vert" },
        "b2": { "type": "boulder", "climb_type": "Vert" },
        "b3": { "type": "boulder", "climb_type": "Steep" },
        "b4": { "type": "boulder", "climb_type": "Vert" },
        "b5": { "type": "boulder", "climb_type": "Overhang" },
        "b6": { "type": "boulder", "climb_type": "Slab" },
        "b7": { "type": "boulder", "climb_type": "Slab" },
        "b8": { "type": "boulder", "climb_type": "Vert" },
        "b9": { "type": "boulder", "climb_type": "Vert" },
        "b10": { "type": "boulder", "climb_type": "Vert" },
        "b11": { "type": "boulder", "climb_type": "Overhang" },
        "b12": { "type": "boulder", "climb_type": "Steep" }
    },
    'DTN': {
        "b1-titanic": { "type": "boulder", "climb_type": "Vert" }, "titanic": { "type": "boulder", "climb_type": "Vert" },
        "b2-ned": { "type": "boulder", "climb_type": "Vert" }, "ned": { "type": "boulder", "climb_type": "Vert" },
        "b3-dusty": { "type": "boulder", "climb_type": "Vert" }, "dusty": { "type": "boulder", "climb_type": "Vert" },
        "b4-lucky": { "type": "boulder", "climb_type": "Vert" }, "lucky": { "type": "boulder", "climb_type": "Vert" },
        "b5-three rivers": { "type": "boulder", "climb_type": "Vert" }, "three rivers": { "type": "boulder", "climb_type": "Vert" },
        "b6-corner office": { "type": "boulder", "climb_type": "Vert" }, "corner office": { "type": "boulder", "climb_type": "Vert" },
        "b7-goiter": { "type": "boulder", "climb_type": "Vert" }, "goiter": { "type": "boulder", "climb_type": "Vert" },
        "b8-deception": { "type": "boulder", "climb_type": "Vert" }, "deception": { "type": "boulder", "climb_type": "Vert" },
        "b9-prowl": { "type": "boulder", "climb_type": "Vert" }, "prowl": { "type": "boulder", "climb_type": "Vert" },
        "b10-aaa": { "type": "boulder", "climb_type": "Vert" }, "aaa": { "type": "boulder", "climb_type": "Vert" },
        "b11-aab": { "type": "boulder", "climb_type": "Vert" }, "b12-aab": { "type": "boulder", "climb_type": "Vert" }, "aab": { "type": "boulder", "climb_type": "Vert" }
    },
    'HIL': {
        "a1": { "type": "boulder", "climb_type": "Vert" },
        "a2": { "type": "boulder", "climb_type": "Vert" },
        "a3": { "type": "boulder", "climb_type": "Vert" },
        "a4": { "type": "boulder", "climb_type": "Vert" },
        "a5": { "type": "boulder", "climb_type": "Vert" },
        "a6": { "type": "boulder", "climb_type": "Vert" },
        "a7": { "type": "boulder", "climb_type": "Vert" },
        "a8": { "type": "boulder", "climb_type": "Vert" },
        "b1": { "type": "boulder", "climb_type": "Vert" },
        "b2": { "type": "boulder", "climb_type": "Vert" },
        "b3": { "type": "boulder", "climb_type": "Vert" },
        "b4": { "type": "boulder", "climb_type": "Vert" },
        "b5": { "type": "boulder", "climb_type": "Vert" },
        "b6": { "type": "boulder", "climb_type": "Vert" },
        "b7": { "type": "boulder", "climb_type": "Vert" },
        "b8": { "type": "boulder", "climb_type": "Vert" },
        "b9": { "type": "boulder", "climb_type": "Vert" },
        "b10": { "type": "boulder", "climb_type": "Vert" },
        "c1": { "type": "boulder", "climb_type": "Vert" },
        "c2": { "type": "boulder", "climb_type": "Vert" },
        "c3": { "type": "boulder", "climb_type": "Vert" },
        "c4": { "type": "boulder", "climb_type": "Vert" },
        "d1": { "type": "boulder", "climb_type": "Vert" },
        "d2": { "type": "boulder", "climb_type": "Vert" },
        "d3": { "type": "boulder", "climb_type": "Vert" },
        "d4": { "type": "boulder", "climb_type": "Vert" },
        "d5": { "type": "boulder", "climb_type": "Vert" },
        "d6": { "type": "boulder", "climb_type": "Vert" },
        "d7": { "type": "boulder", "climb_type": "Vert" },
        "d8": { "type": "boulder", "climb_type": "Vert" },
        "d9": { "type": "boulder", "climb_type": "Vert" },
        "d10": { "type": "boulder", "climb_type": "Vert" },
        "d11": { "type": "boulder", "climb_type": "Vert" },
        "d12": { "type": "boulder", "climb_type": "Vert" },
        "d13": { "type": "boulder", "climb_type": "Vert" },
        "d14": { "type": "boulder", "climb_type": "Vert" }
    },
    'FTW': {
        "a1": { "type": "boulder", "climb_type": "Vert" },
        "a2": { "type": "boulder", "climb_type": "Vert" },
        "a3": { "type": "boulder", "climb_type": "Vert" },
        "a4": { "type": "boulder", "climb_type": "Vert" },
        "a5": { "type": "boulder", "climb_type": "Vert" },
        "a6": { "type": "boulder", "climb_type": "Vert" },
        "a7": { "type": "boulder", "climb_type": "Vert" },
        "a8": { "type": "boulder", "climb_type": "Vert" },
        "b1": { "type": "boulder", "climb_type": "Vert" },
        "b2": { "type": "boulder", "climb_type": "Vert" },
        "b3": { "type": "boulder", "climb_type": "Vert" },
        "b4": { "type": "boulder", "climb_type": "Vert" },
        "b5": { "type": "boulder", "climb_type": "Vert" },
        "b6": { "type": "boulder", "climb_type": "Vert" },
        "b7": { "type": "boulder", "climb_type": "Vert" },
        "b8": { "type": "boulder", "climb_type": "Vert" },
        "b9": { "type": "boulder", "climb_type": "Vert" },
        "b10": { "type": "boulder", "climb_type": "Vert" },
        "b11": { "type": "boulder", "climb_type": "Vert" },
        "b12": { "type": "boulder", "climb_type": "Vert" }
    }
};

export const TEMPLATE_COORDS: any = {
    'DSN': {
        weekStartDay: 'Sunday',
        displayMode: 'merged',
        ropeTypeName: 'Rope',
        'combined': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 94, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 454, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    },
    'GVN': {
        weekStartDay: 'Monday',
        displayMode: 'separate',
        ropeTypeName: 'Sport',
        'combined': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 100, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 460, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    },
    'PLN': {
        weekStartDay: 'Sunday',
        displayMode: 'merged',
        ropeTypeName: 'Rope',
        'combined': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 100, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 460, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    },
    'HIL': {
        weekStartDay: 'Sunday',
        displayMode: 'merged',
        ropeTypeName: 'Rope',
        'boulders': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 94, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 454, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    },
    'DTN': {
        weekStartDay: 'Sunday',
        displayMode: 'merged',
        ropeTypeName: 'Rope',
        'boulders': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 94, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 454, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    },
    'FTW': {
        weekStartDay: 'Monday',
        displayMode: 'merged',
        ropeTypeName: 'Rope',
        'boulders': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 94, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 454, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    },
    'GENERIC': {
        weekStartDay: 'Monday',
        displayMode: 'merged',
        ropeTypeName: 'Rope',
        'combined': {
            header: { x: 740, y: 115 },
            tableTop: 775,
            rowHeight: 27,
            leftTable: { date: { x: 48, width: 42 }, location: { x: 100, width: 142 }, climbType: { x: 252, width: 67 }, setters: { x: 335, width: 52 } },
            rightTable: { date: { x: 408, width: 42 }, location: { x: 460, width: 142 }, climbType: { x: 612, width: 67 }, setters: { x: 695, width: 52 } }
        }
    }
};

/**
 * Returns the 3-letter code for a given gym name or keyword.
 */
export const getGymCode = (name: string): string | null => {
    const search = name.toLowerCase().trim();
    if (!search) return null;

    // 1. Exact Name/Code Match (Highest Priority)
    for (const gym of GYMS) {
        if (search === gym.code.toLowerCase() || search === gym.name.toLowerCase()) {
            return gym.code;
        }
    }

    // 2. Keyword Match (Middle Priority)
    for (const gym of GYMS) {
        if (gym.searchKeywords.some(kw => {
            const lowKw = kw.toLowerCase();
            return search.includes(lowKw) || lowKw.includes(search);
        })) {
            return gym.code;
        }
    }

    // 3. Code Segment Match (Lowest Priority)
    for (const gym of GYMS) {
        if (search.includes(gym.code.toLowerCase())) {
            return gym.code;
        }
    }

    return null;
};
