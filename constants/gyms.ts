import { GymMeta } from '../types';

export const SKIP_TITLES = [
    'admin', 'personal training', 'washing', 'forerunning', 'climb time',
    '@hill', '@design', '@plano', '@dtn', '@ftw', 'meeting', 'workshop'
];

export const GYMS: GymMeta[] = [
    // TEXAS
    {
        code: 'DSN',
        name: 'Design District',
        region: 'Texas',
        searchKeywords: ['Design District', 'Dallas Design', 'Design', 'DSN'],
        displayMode: 'merged',
        weekStartDay: 'Sunday',
        isBoulderOnly: false,
        ropeTypeName: 'Rope'
    },
    {
        code: 'PLN',
        name: 'Plano',
        region: 'Texas',
        searchKeywords: ['Plano'],
        displayMode: 'merged',
        weekStartDay: 'Sunday',
        isBoulderOnly: false,
        ropeTypeName: 'Rope'
    },
    {
        code: 'GVN',
        name: 'Grapevine',
        region: 'Texas',
        searchKeywords: ['Grapevine'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false,
        ropeTypeName: 'Sport'
    },
    {
        code: 'DTN',
        name: 'Denton',
        region: 'Texas',
        searchKeywords: ['Denton'],
        displayMode: 'merged',
        weekStartDay: 'Sunday',
        isBoulderOnly: true
    },
    {
        code: 'FTW',
        name: 'Fort Worth',
        region: 'Texas',
        searchKeywords: ['Fort Worth'],
        displayMode: 'merged',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'HIL',
        name: 'The Hill',
        region: 'Texas',
        searchKeywords: ['The Hill', 'Dallas Hill'],
        displayMode: 'merged',
        weekStartDay: 'Sunday',
        isBoulderOnly: true
    },
    {
        code: 'TTX',
        name: 'Team Texas',
        region: 'Texas',
        searchKeywords: ['Team Texas'],
        displayMode: 'merged',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },

    // COLORADO
    {
        code: 'BDR',
        name: 'Boulder',
        region: 'Colorado',
        searchKeywords: ['Boulder'],
        displayMode: 'merged',
        weekStartDay: 'Sunday',
        isBoulderOnly: true
    },
    {
        code: 'BKR',
        name: 'Baker',
        region: 'Colorado',
        searchKeywords: ['Baker', 'Denver Baker'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'CEN',
        name: 'Centennial',
        region: 'Colorado',
        searchKeywords: ['Centennial'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'ENG',
        name: 'Englewood',
        region: 'Colorado',
        searchKeywords: ['Englewood'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'DEN',
        name: 'Golden',
        region: 'Colorado',
        searchKeywords: ['Golden'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'RNO',
        name: 'RiNo',
        region: 'Colorado',
        searchKeywords: ['RiNo', 'Denver RiNo'],
        displayMode: 'merged',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },

    // CALIFORNIA
    {
        code: 'MTV',
        name: 'Mountain View',
        region: 'California',
        searchKeywords: ['Mountain View'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'BEL',
        name: 'Belmont',
        region: 'California',
        searchKeywords: ['Belmont'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'FTV',
        name: 'Fountain Valley',
        region: 'California',
        searchKeywords: ['Fountain Valley'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'SFO',
        name: 'San Francisco',
        region: 'California',
        searchKeywords: ['San Francisco'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'SCA',
        name: 'Santa Clara',
        region: 'California',
        searchKeywords: ['Santa Clara'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'SNY',
        name: 'Sunnyvale',
        region: 'California',
        searchKeywords: ['Sunnyvale'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },

    // OREGON
    {
        code: 'PDX',
        name: 'Portland',
        region: 'Oregon',
        searchKeywords: ['Portland'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },

    // ILLINOIS
    {
        code: 'LIN',
        name: 'Lincoln Park',
        region: 'Illinois',
        searchKeywords: ['Lincoln Park', 'Chicago Lincoln'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'WRI',
        name: 'Wrigleyville',
        region: 'Illinois',
        searchKeywords: ['Wrigleyville', 'Chicago Wrigley'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },

    // MARYLAND
    {
        code: 'COL',
        name: 'Columbia',
        region: 'Maryland',
        searchKeywords: ['Columbia'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'HMD',
        name: 'Hampden',
        region: 'Maryland',
        searchKeywords: ['Hampden', 'Baltimore Hampden'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'ROC',
        name: 'Rockville',
        region: 'Maryland',
        searchKeywords: ['Rockville'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'TIM',
        name: 'Timonium',
        region: 'Maryland',
        searchKeywords: ['Timonium'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },

    // NEW YORK
    {
        code: 'GOW',
        name: 'Gowanus',
        region: 'New York',
        searchKeywords: ['Gowanus', 'Brooklyn Gowanus'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'HAR',
        name: 'Harlem',
        region: 'New York',
        searchKeywords: ['Harlem', 'NYC Harlem'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'LIC',
        name: 'Long Island City',
        region: 'New York',
        searchKeywords: ['LIC', 'Long Island', 'Long'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'VAL',
        name: 'Valhalla',
        region: 'New York',
        searchKeywords: ['Valhalla'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },

    // PENNSYLVANIA
    {
        code: 'CAL',
        name: 'Callowhill',
        region: 'Pennsylvania',
        searchKeywords: ['Callowhill', 'Philadelphia Callowhill'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'FIS',
        name: 'Fishtown',
        region: 'Pennsylvania',
        searchKeywords: ['Fishtown', 'Philadelphia Fishtown'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },

    // VIRGINIA
    {
        code: 'CRY',
        name: 'Crystal City',
        region: 'Virginia',
        searchKeywords: ['Crystal City', 'Arlington Crystal'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'FFX',
        name: 'Fairfax',
        region: 'Virginia',
        searchKeywords: ['Fairfax'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    }
];

export const getGymByCode = (code: string): GymMeta | undefined => {
    return GYMS.find(g => g.code === code);
};

export const getAllGymCodes = (): string[] => {
    return GYMS.map(g => g.code);
};

export const getGymDisplayName = (code: string): string => {
    const gym = getGymByCode(code);
    return gym ? gym.name : code;
};
