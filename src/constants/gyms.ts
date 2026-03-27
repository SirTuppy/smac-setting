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
        tier: 'Tier 2',
        facilityCode: '12800',
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
        tier: 'Tier 2',
        facilityCode: '13700',
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
        tier: 'Tier 1B',
        facilityCode: '13800',
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
        tier: 'Tier 3',
        facilityCode: '13500',
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
        tier: 'Tier 4',
        facilityCode: '12900',
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
        tier: 'Tier 3',
        facilityCode: '11500',
        searchKeywords: ['Boulder'],
        displayMode: 'merged',
        weekStartDay: 'Sunday',
        isBoulderOnly: true
    },
    {
        code: 'BKR',
        name: 'Baker',
        region: 'Colorado',
        tier: 'Tier 2',
        facilityCode: '11700',
        searchKeywords: ['Baker', 'Denver Baker'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'CEN',
        name: 'Centennial',
        region: 'Colorado',
        tier: 'Tier 3',
        facilityCode: '12100',
        searchKeywords: ['Centennial'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'ENG',
        name: 'Englewood',
        region: 'Colorado',
        tier: 'Tier 2',
        facilityCode: '11400',
        searchKeywords: ['Englewood'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'DEN',
        name: 'Golden',
        region: 'Colorado',
        tier: 'Tier 3',
        facilityCode: '11800',
        searchKeywords: ['Golden'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'RNO',
        name: 'RiNo',
        region: 'Colorado',
        tier: 'Tier 3',
        facilityCode: '11600',
        searchKeywords: ['RiNo', 'Denver RiNo'],
        displayMode: 'merged',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },

    // CALIFORNIA
    {
        code: 'MTV',
        name: 'Mountain View',
        region: 'Bay Area',
        tier: 'Tier 2B',
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
        region: 'Chicago',
        tier: 'Tier 1A',
        facilityCode: '12200',
        searchKeywords: ['Lincoln Park', 'Chicago Lincoln'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'WRI',
        name: 'Wrigleyville',
        region: 'Chicago',
        tier: 'Tier 2',
        facilityCode: '12300',
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
        code: 'HAM',
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
        region: 'NY/PA',
        tier: 'Tier 3',
        facilityCode: '13000',
        searchKeywords: ['Gowanus', 'Brooklyn Gowanus'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'HLM',
        name: 'Harlem',
        region: 'NY/PA',
        tier: 'Tier 1B',
        facilityCode: '13200',
        searchKeywords: ['Harlem', 'NYC Harlem'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: true
    },
    {
        code: 'LIC',
        name: 'Long Island City',
        region: 'NY/PA',
        tier: 'Tier 4',
        facilityCode: '13100',
        searchKeywords: ['LIC', 'Long Island', 'Long'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'VAL',
        name: 'Valhalla',
        region: 'NY/PA',
        tier: 'Tier 2',
        facilityCode: '13300',
        searchKeywords: ['Valhalla'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },

    // PENNSYLVANIA
    {
        code: 'CAL',
        name: 'Callowhill',
        region: 'NY/PA',
        tier: 'Tier 3',
        facilityCode: '13400',
        searchKeywords: ['Callowhill', 'Philadelphia Callowhill'],
        displayMode: 'separate',
        weekStartDay: 'Monday',
        isBoulderOnly: false
    },
    {
        code: 'FSH',
        name: 'Fishtown',
        region: 'NY/PA',
        tier: 'Tier 2',
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
        region: 'DMV',
        tier: 'Tier 3',
        facilityCode: '12700',
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
