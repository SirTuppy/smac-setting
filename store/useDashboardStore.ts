import { create } from 'zustand';
import {
    Climb,
    GymSchedule,
    EmailSettings,
    AppView,
    BaselineSettings
} from '../types';
import { RangeOption } from '../components/UnifiedHeader';

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
    gymSchedules: Record<string, GymSchedule> | null;

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

    // Settings
    emailSettings: EmailSettings;
    baselineSettings: BaselineSettings;

    // Actions
    setClimbData: (data: Record<string, Climb[]> | null) => void;
    setGymSchedules: (schedules: Record<string, GymSchedule> | null) => void;
    setGymSchedule: (gymCode: string, schedule: GymSchedule) => void;
    setActiveView: (view: AppView) => void;
    setSelectedGyms: (gyms: string[]) => void;
    toggleGymSelection: (gymName: string) => void;
    setIsCompareMode: (isCompare: boolean) => void;
    setDateRange: (range: { start: Date; end: Date }) => void;
    setRangeOption: (option: RangeOption) => void;

    // Modal Actions
    setShowSettings: (show: boolean) => void;
    setShowInstructions: (show: boolean) => void;
    setShowUploadOverlay: (show: boolean) => void;
    setShowBaselineSettings: (show: boolean) => void;
    setShowCommentModal: (show: boolean) => void;

    setEmailSettings: (settings: EmailSettings) => void;
    setBaselineSettings: (settings: BaselineSettings) => void;
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
    gymSchedules: null,
    activeView: 'analytics',
    selectedGyms: [],
    isCompareMode: false,
    dateRange: getInitialDateRange(),
    rangeOption: '14d',

    // Modal States
    showSettings: false,
    showInstructions: false,
    showUploadOverlay: false,
    showBaselineSettings: false,
    showCommentModal: false,

    emailSettings: (() => {
        const saved = localStorage.getItem('email_settings');
        return saved ? JSON.parse(saved) : DEFAULT_EMAIL_SETTINGS;
    })(),
    baselineSettings: (() => {
        const saved = localStorage.getItem('baseline_settings');
        if (!saved) return DEFAULT_BASELINE_SETTINGS;
        try {
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_BASELINE_SETTINGS, ...parsed };
        } catch (e) {
            return DEFAULT_BASELINE_SETTINGS;
        }
    })(),

    // Actions
    setClimbData: (climbData) => {
        set({ climbData });
        const currentOption = get().rangeOption;
        if (currentOption !== 'custom') {
            get().setRangeOption(currentOption);
        }
    },
    setGymSchedules: (gymSchedules) => set({ gymSchedules }),
    setGymSchedule: (gymCode, schedule) => set((state) => ({
        gymSchedules: { ...state.gymSchedules, [gymCode]: schedule }
    })),
    setActiveView: (activeView) => set({ activeView }),
    setSelectedGyms: (selectedGyms) => set({ selectedGyms }),

    toggleGymSelection: (name) => set((state) => {
        if (!state.isCompareMode || name === "Regional Overview") {
            return { selectedGyms: [name] };
        }

        const prev = state.selectedGyms;
        if (prev.includes("Regional Overview")) return { selectedGyms: [name] };

        if (prev.includes(name)) {
            return { selectedGyms: prev.length > 1 ? prev.filter(g => g !== name) : prev };
        }
        return { selectedGyms: [...prev, name] };
    }),

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

    // Modal Actions
    setShowSettings: (showSettings) => set({ showSettings }),
    setShowInstructions: (showInstructions) => set({ showInstructions }),
    setShowUploadOverlay: (showUploadOverlay) => set({ showUploadOverlay }),
    setShowBaselineSettings: (showBaselineSettings) => set({ showBaselineSettings }),
    setShowCommentModal: (showCommentModal) => set({ showCommentModal }),

    setEmailSettings: (emailSettings) => {
        localStorage.setItem('email_settings', JSON.stringify(emailSettings));
        set({ emailSettings });
    },

    setBaselineSettings: (baselineSettings) => {
        localStorage.setItem('baseline_settings', JSON.stringify(baselineSettings));
        set({ baselineSettings });
    },

    resetAll: () => set({
        climbData: null,
        gymSchedules: null,
        selectedGyms: [],
        isCompareMode: false,
        activeView: 'analytics',
        dateRange: getInitialDateRange(),
        rangeOption: '14d',
        showSettings: false,
        showInstructions: false,
        showUploadOverlay: false,
        showBaselineSettings: false,
        showCommentModal: false
    })
}));
