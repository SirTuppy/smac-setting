import { create } from 'zustand';
import {
    Climb,
    EmailSettings,
    AppView,
    BaselineSettings,
    GymSettings,
    ScheduleOverride,
    WallTarget,
    WSPSettings,
    BudgetState,
    BudgetCategory,
    BudgetExpense
} from '../types';
import { GYMS } from '../constants/gyms';
import { RangeOption } from '../components/UnifiedHeader';
import { getGymCode } from '../constants/mapTemplates';
// @ts-ignore
import defaultNationalTargets from '../public/data/master_national_targets.json';

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
    to: '',
    cc: '',
    subject: '[GYM_NAME] Setting Schedule: [DATE_RANGE]',
    body: 'Hi Team,\n\nPlease find the setting schedule for [GYM_NAME] for the weeks of [DATE_RANGE].\n\n(Please remember to attach the schedule image to this email before sending.)\n\nThanks!'
};

export const DEFAULT_BASELINE_SETTINGS: BaselineSettings = {
    boulderTargetPerShift: 4.0,
    ropeTargetPerShift: 1.5,
    shiftsPerWeek: 16,
    totalVolumePerWeek: 33,
    routesPerWeek: 8,
    bouldersPerWeek: 25,
    settingDays: [1, 2, 3, 4], // Mon, Tue, Wed, Thu
    idealDailySplit: [
        { day: 0, routes: 0, boulders: 0 },   // Sun
        { day: 1, routes: 4, boulders: 0 }, // Mon
        { day: 2, routes: 0, boulders: 12 }, // Tue
        { day: 3, routes: 0, boulders: 12 }, // Wed
        { day: 4, routes: 4, boulders: 0 }, // Thu
        { day: 5, routes: 0, boulders: 0 },   // Fri
        { day: 6, routes: 0, boulders: 0 }    // Sat
    ],
    showBaselines: true,
    showSummary: true,
    showReferencePage: true,
    reportComments: ''
};

interface DashboardState {
    // Data
    climbData: Record<string, Climb[]> | null;

    // UI State
    activeView: AppView;
    selectedGyms: string[];
    isCompareMode: boolean;
    dateRange: { start: Date; end: Date };
    rangeOption: RangeOption;

    // Modal States
    showSettings: boolean;
    showInstructions: boolean;
    showUploadOverlay: boolean;
    showBaselineSettings: boolean;
    showCommentModal: boolean;
    showDiscoveryModal: boolean;
    selectedBaselineGym: string; // 'DEFAULT' or a specific code

    // Settings
    emailSettings: EmailSettings;
    baselineConfigs: Record<string, BaselineSettings>; // Keyed by gym code or 'DEFAULT'
    userWallMappings: Record<string, Record<string, { type: 'rope' | 'boulder' | 'ignored' }>>;
    gymSettings: Record<string, GymSettings>;
    gymDisplayNames: Record<string, string>;
    unrecognizedWalls: Record<string, string[]>;
    scheduleOverrides: Record<string, ScheduleOverride>; // Key: gymCode-dateKey-dataType-field
    comparisonMode: 'none' | 'pop' | 'yoy';
    wallTargets: Record<string, Record<string, WallTarget>>; // gymCode -> wallName -> Target

    // WSP State
    wspSettings: WSPSettings;
    setWspSettings: (settings: Partial<WSPSettings>) => void;

    // Budget State
    budgetState: BudgetState;
    setBudgetState: (budgetState: Partial<BudgetState>) => void;
    addBudgetExpense: (expense: BudgetExpense) => void;
    updateBudgetExpense: (expense: BudgetExpense) => void;
    deleteBudgetExpense: (id: string) => void;


    // Actions
    setClimbData: (data: Record<string, Climb[]> | null) => void;
    setActiveView: (view: AppView) => void;
    setSelectedGyms: (gyms: string[]) => void;
    toggleGymSelection: (gymName: string) => void;
    setIsCompareMode: (isCompare: boolean) => void;
    setDateRange: (range: { start: Date; end: Date }) => void;
    setRangeOption: (option: RangeOption) => void;
    setComparisonMode: (mode: 'none' | 'pop' | 'yoy') => void;

    // Modal Actions
    setShowSettings: (show: boolean) => void;
    setShowInstructions: (show: boolean) => void;
    setShowUploadOverlay: (show: boolean) => void;
    setShowBaselineSettings: (show: boolean, gymCode?: string) => void;
    setShowCommentModal: (show: boolean) => void;
    setShowDiscoveryModal: (show: boolean) => void;
    setSelectedBaselineGym: (gymCode: string) => void;

    setEmailSettings: (settings: EmailSettings) => void;
    setBaselineSettings: (settings: BaselineSettings, gymCode?: string) => void;
    getBaseline: (gymCode?: string) => BaselineSettings;
    addUserWallMapping: (gymCode: string, wallName: string, type: 'rope' | 'boulder' | 'ignored') => void;
    updateGymSettings: (gymCode: string, settings: Partial<GymSettings>) => void;
    setGymDisplayName: (gymCode: string, name: string) => void;
    clearUnrecognizedWalls: () => void;
    setUnrecognizedWalls: (walls: Record<string, string[]>) => void;
    setScheduleOverride: (override: ScheduleOverride) => void;
    clearScheduleOverrides: (gymCode?: string) => void;
    setWallTarget: (gymCode: string, wallName: string, target: Partial<WallTarget>) => void;
    resetWallTargets: (gymCode?: string) => void;


    resetAll: () => void;
}

const getInitialDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);
    return { start, end };
};


export const useDashboardStore = create<DashboardState>((set, get) => ({
    // Initial State
    climbData: null,
    activeView: 'analytics',
    selectedGyms: ["Regional Overview"],
    isCompareMode: false,
    dateRange: getInitialDateRange(),
    rangeOption: '14d',

    // Modal States
    showSettings: false,
    showInstructions: false,
    showUploadOverlay: false,
    showBaselineSettings: false,
    showCommentModal: false,
    showDiscoveryModal: false,
    selectedBaselineGym: 'DEFAULT',

    emailSettings: (() => {
        const saved = localStorage.getItem('email_settings');
        return saved ? JSON.parse(saved) : DEFAULT_EMAIL_SETTINGS;
    })(),
    baselineConfigs: (() => {
        const saved = localStorage.getItem('baseline_configs');
        if (!saved) return { 'DEFAULT': DEFAULT_BASELINE_SETTINGS };
        try {
            const parsed = JSON.parse(saved);
            return { 'DEFAULT': DEFAULT_BASELINE_SETTINGS, ...parsed };
        } catch (e) {
            return { 'DEFAULT': DEFAULT_BASELINE_SETTINGS };
        }
    })(),
    userWallMappings: (() => {
        const saved = localStorage.getItem('user_wall_mappings');
        return saved ? JSON.parse(saved) : {};
    })(),
    gymSettings: (() => {
        const saved = localStorage.getItem('gym_settings');
        return saved ? JSON.parse(saved) : {};
    })(),
    gymDisplayNames: (() => {
        const saved = localStorage.getItem('gym_display_names');
        const initial: Record<string, string> = {};
        GYMS.forEach(gym => {
            initial[gym.code] = gym.name;
        });
        return saved ? { ...initial, ...JSON.parse(saved) } : initial;
    })(),
    unrecognizedWalls: {},
    scheduleOverrides: (() => {
        const saved = localStorage.getItem('schedule_overrides');
        return saved ? JSON.parse(saved) : {};
    })(),
    comparisonMode: 'none',
    wallTargets: (() => {
        const saved = localStorage.getItem('wall_targets');
        if (saved) return JSON.parse(saved);

        // Transform the master payload's flat array into the expected nested Record structure
        const defaultWalls: Record<string, Record<string, WallTarget>> = {};
        for (const [gym, targets] of Object.entries(defaultNationalTargets.wallTargets)) {
            defaultWalls[gym] = {};
            (targets as any[]).forEach(t => {
                defaultWalls[gym][t.wallName] = t;
            });
        }
        return defaultWalls;
    })(),


    // WSP Initial State
    wspSettings: (() => {
        const saved = localStorage.getItem('wsp_app_settings');
        const defaultSettings: WSPSettings = {
            nameFormat: 'first',
            marketingEmail: 'Leslie.Valdez@movementgyms.com',
            includeDefaultText: true,
            gymEmails: {
                'Design District': { gd: 'Chad.Dietz@movementgyms.com', agd: 'Louis.Rodriguez@movementgyms.com' },
                'Grapevine': { gd: 'Carver.Bomboy@movementgyms.com', agd: '' },
                'Plano': { gd: 'David.Moreno@movementgyms.com', agd: 'Ana.Alamilla@movementgyms.com' },
                'The Hill': { gd: 'Adam.Hughes@movementgyms.com', agd: 'Tyler.VanStrien@movementgyms.com' },
                'Fort Worth': { gd: '', agd: '' },
                'Denton': { gd: 'Abbie.Micke@movementgyms.com', agd: '' }
            }
        };
        if (!saved) return defaultSettings;
        try {
            const parsed = JSON.parse(saved);
            return {
                nameFormat: parsed.nameFormat || defaultSettings.nameFormat,
                marketingEmail: parsed.marketingEmail || defaultSettings.marketingEmail,
                includeDefaultText: parsed.includeDefaultText !== undefined ? parsed.includeDefaultText : defaultSettings.includeDefaultText,
                gymEmails: { ...defaultSettings.gymEmails, ...(parsed.gymEmails || {}) }
            };
        } catch {
            return defaultSettings;
        }
    })(),

    // Budget Initial State
    budgetState: (() => {
        const saved = localStorage.getItem('budgetTrackerState');
        const defaultState: BudgetState = {
            config: {
                annualBudget: 0,
                categories: []
            },
            expenses: []
        };
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Backwards compatibility if they used a flat structure temporarily
                if (!parsed.config) {
                    return {
                        config: {
                            annualBudget: parsed.annualBudget || 0,
                            categories: parsed.categories || []
                        },
                        expenses: parsed.expenses || []
                    };
                }
                return parsed;
            } catch (e) { return defaultState; }
        }
        return defaultState;
    })(),


    // Actions
    setClimbData: (climbData) => {
        set({ climbData });
        const currentOption = get().rangeOption;
        if (currentOption !== 'custom') {
            get().setRangeOption(currentOption);
        }
    },
    // ...
    setActiveView: (activeView) => set({ activeView }),
    setSelectedGyms: (selectedGyms) => set({ selectedGyms }),

    toggleGymSelection: (nameOrCode) => {
        const code = getGymCode(nameOrCode) || nameOrCode;

        set((state) => {
            if (!state.isCompareMode || code === "Regional Overview") {
                return { selectedGyms: [code] };
            }

            const prev = state.selectedGyms;
            if (prev.includes("Regional Overview")) return { selectedGyms: [code] };

            if (prev.includes(code)) {
                return { selectedGyms: prev.length > 1 ? prev.filter(g => g !== code) : prev };
            }
            return { selectedGyms: [...prev, code] };
        });
    },

    setIsCompareMode: (isCompareMode) => set((state) => {
        const newState: Partial<DashboardState> = { isCompareMode };
        if (!isCompareMode && state.selectedGyms.length > 1) {
            newState.selectedGyms = [state.selectedGyms[0]];
        }
        return newState;
    }),

    setDateRange: (dateRange) => set({ dateRange, rangeOption: 'custom' }),

    setRangeOption: (rangeOption) => {
        const state = get();
        if (rangeOption === 'custom' || !state.climbData) {
            set({ rangeOption });
            return;
        }

        const allClimbs = Object.values(state.climbData).flat();
        if (allClimbs.length === 0) {
            set({ rangeOption });
            return;
        }

        const dates = allClimbs.map(c => new Date(c.dateSet).getTime());
        const minTime = Math.min(...dates);
        const maxTime = Math.max(...dates);
        const minDate = new Date(minTime);
        const maxDate = new Date(maxTime);

        const end = new Date(maxDate);
        let start = new Date(maxDate);

        switch (rangeOption) {
            case '7d': start.setDate(maxDate.getDate() - 7); break;
            case '14d': start.setDate(maxDate.getDate() - 14); break;
            case '30d': start.setDate(maxDate.getDate() - 30); break;
            case '90d': start.setDate(maxDate.getDate() - 90); break;
            case '180d': start.setDate(maxDate.getDate() - 180); break;
            case 'ytd': start = new Date(maxDate.getFullYear(), 0, 1); break;
            case '1y': start.setFullYear(maxDate.getFullYear() - 1); break;
            case 'all': start = new Date(minDate); break;
        }

        if (start < minDate && rangeOption !== 'all') {
            start = new Date(minDate);
        }

        set({ rangeOption, dateRange: { start, end } });
    },

    setComparisonMode: (comparisonMode) => set({ comparisonMode }),

    // Modal Actions
    setShowSettings: (showSettings) => set({ showSettings }),
    setShowInstructions: (showInstructions) => set({ showInstructions }),
    setShowUploadOverlay: (showUploadOverlay) => set({ showUploadOverlay }),
    setShowBaselineSettings: (showBaselineSettings, gymCode) => set({
        showBaselineSettings,
        selectedBaselineGym: gymCode || 'DEFAULT'
    }),
    setShowCommentModal: (showCommentModal) => set({ showCommentModal }),
    setShowDiscoveryModal: (showDiscoveryModal) => set({ showDiscoveryModal }),
    setSelectedBaselineGym: (selectedBaselineGym) => set({ selectedBaselineGym }),

    setEmailSettings: (emailSettings) => {
        localStorage.setItem('email_settings', JSON.stringify(emailSettings));
        set({ emailSettings });
    },

    setBaselineSettings: (settings, gymCode) => {
        const code = gymCode || get().selectedBaselineGym;
        const newConfigs = { ...get().baselineConfigs, [code]: settings };
        localStorage.setItem('baseline_configs', JSON.stringify(newConfigs));
        set({ baselineConfigs: newConfigs });
    },

    getBaseline: (gymCode) => {
        const configs = get().baselineConfigs;
        // If specific code provided, try that, else fallback to DEFAULT
        if (gymCode && configs[gymCode]) return configs[gymCode];
        return configs['DEFAULT'] || DEFAULT_BASELINE_SETTINGS;
    },

    addUserWallMapping: (gymCode, wallName, type) => {
        const mappings = { ...get().userWallMappings };
        if (!mappings[gymCode]) mappings[gymCode] = {};
        mappings[gymCode][wallName] = { type };
        localStorage.setItem('user_wall_mappings', JSON.stringify(mappings));
        set({ userWallMappings: mappings });
    },
    updateGymSettings: (gymCode, settings) => {
        const current = get().gymSettings[gymCode] || { displayMode: 'merged', climbTypeDisplay: 'type' };
        const newSettings = { ...get().gymSettings, [gymCode]: { ...current, ...settings } };
        localStorage.setItem('gym_settings', JSON.stringify(newSettings));
        set({ gymSettings: newSettings });
    },
    setGymDisplayName: (gymCode, name) => {
        const newNames = { ...get().gymDisplayNames, [gymCode]: name };
        localStorage.setItem('gym_display_names', JSON.stringify(newNames));
        set({ gymDisplayNames: newNames });
    },

    clearUnrecognizedWalls: () => set({ unrecognizedWalls: {} }),
    setUnrecognizedWalls: (unrecognizedWalls) => set({ unrecognizedWalls }),

    setScheduleOverride: (override) => {
        const shiftPart = override.shiftId ? `-${override.shiftId}` : '';
        const key = `${override.gymCode}-${override.dateKey}-${override.dataType}-${override.field}${shiftPart}`;
        const newOverrides = { ...get().scheduleOverrides, [key]: override };
        localStorage.setItem('schedule_overrides', JSON.stringify(newOverrides));
        set({ scheduleOverrides: newOverrides });
    },

    setWallTarget: (gymCode, wallName, target) => {
        const current = get().wallTargets;
        const gymTargets = { ...(current[gymCode] || {}) };

        // Determine initial type if creating new
        const initialType = wallName.toLowerCase().includes('boulder') || wallName.toLowerCase().includes('cave') ? 'boulder' : 'rope';

        // Merge with existing OR create new
        const existing = gymTargets[wallName] || {
            gymCode,
            wallName,
            targetCount: 0,
            targetClimbsPerSetter: initialType === 'rope' ? 1.0 : 4.0,
            type: initialType,
            isManual: target.isManual || false
        };

        // If type is being updated, and efficiency is at a default, update efficiency too
        let finalTarget = { ...existing, ...target };
        if (target.type && target.type !== existing.type) {
            const isAtOldDefault = (existing.type === 'rope' && existing.targetClimbsPerSetter === 1.0) ||
                (existing.type === 'boulder' && existing.targetClimbsPerSetter === 4.0);

            if (isAtOldDefault) {
                finalTarget.targetClimbsPerSetter = target.type === 'rope' ? 1.0 : 4.0;
            }
        }

        gymTargets[wallName] = finalTarget;

        const newWallTargets = { ...current, [gymCode]: gymTargets };

        localStorage.setItem('wall_targets', JSON.stringify(newWallTargets));
        set({ wallTargets: newWallTargets });
    },

    deleteWallTarget: (gymCode, wallName) => {
        const current = get().wallTargets;
        if (!current[gymCode]) return;

        const gymTargets = { ...current[gymCode] };
        delete gymTargets[wallName];

        const newWallTargets = { ...current, [gymCode]: gymTargets };
        localStorage.setItem('wall_targets', JSON.stringify(newWallTargets));
        set({ wallTargets: newWallTargets });
    },

    resetWallTargets: (gymCode) => {
        if (!gymCode) {
            localStorage.removeItem('wall_targets');
            set({ wallTargets: {} });
        } else {
            const current = { ...get().wallTargets };
            delete current[gymCode];
            localStorage.setItem('wall_targets', JSON.stringify(current));
            set({ wallTargets: current });
        }
    },

    clearScheduleOverrides: (gymCode) => {
        if (!gymCode) {
            localStorage.removeItem('schedule_overrides');
            set({ scheduleOverrides: {} });
        } else {
            const current = { ...get().scheduleOverrides };
            Object.keys(current).forEach(key => {
                if (key.startsWith(`${gymCode}-`)) delete current[key];
            });
            localStorage.setItem('schedule_overrides', JSON.stringify(current));
            set({ scheduleOverrides: current });
        }
    },

    resetAll: () => set({
        climbData: null,
        selectedGyms: ["Regional Overview"],
        isCompareMode: false,
        activeView: 'analytics',
        dateRange: getInitialDateRange(),
        rangeOption: '14d',
        showSettings: false,
        showInstructions: false,
        showUploadOverlay: false,
        showBaselineSettings: false,
        showCommentModal: false,
        showDiscoveryModal: false,
        selectedBaselineGym: 'DEFAULT'
    }),

    // WSP & Budget Actions
    setWspSettings: (settings) => {
        const newState = { ...get().wspSettings, ...settings };
        localStorage.setItem('wsp_app_settings', JSON.stringify(newState));
        set({ wspSettings: newState });
    },
    
    setBudgetState: (budgetState) => {
        const newState = { ...get().budgetState, ...budgetState };
        localStorage.setItem('budgetTrackerState', JSON.stringify(newState));
        set({ budgetState: newState });
    },
    
    addBudgetExpense: (expense) => {
        const state = get().budgetState;
        const newState = { ...state, expenses: [...state.expenses, expense].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
        localStorage.setItem('budgetTrackerState', JSON.stringify(newState));
        set({ budgetState: newState });
    },
    updateBudgetExpense: (expense) => {
        const state = get().budgetState;
        const newState = { ...state, expenses: state.expenses.map(e => e.id === expense.id ? expense : e) };
        localStorage.setItem('budgetTrackerState', JSON.stringify(newState));
        set({ budgetState: newState });
    },
    deleteBudgetExpense: (id) => {
        const state = get().budgetState;
        const newState = { ...state, expenses: state.expenses.filter(e => e.id !== id) };
        localStorage.setItem('budgetTrackerState', JSON.stringify(newState));
        set({ budgetState: newState });
    }
}));

