import { create } from 'zustand';
import {
    Climb,
    GymSchedule,
    EmailSettings,
    AppView,
    BaselineSettings,
    GymSettings,
    ScheduleOverride,
    WallTarget,
    OrbitTarget,
    FinancialRecord,
    SimulatorSetter,
    SimulatorShift
} from '../types';
import { GYMS } from '../constants/gyms';
import { RangeOption } from '../components/UnifiedHeader';
import { getGymCode } from '../constants/mapTemplates';

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
    remoteTargetUrl: string | null;

    // Executive / Financial State
    orbitTargets: Record<string, OrbitTarget[]>; // gymCode -> Targets
    financialRecords: FinancialRecord[];
    activeOrbitGym: string | null;

    // Simulator State
    simulatorSetters: Record<string, SimulatorSetter>; // Key: setterName
    simulatorOverrides: Record<string, SimulatorShift>; // Key: dateKey-gymCode-type
    simulatorVarianceBuffer: number; // Global buffer slider %
    simulatorGymDebt: Record<string, number>; // gymCode -> total boulders/routes needed




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
    deleteWallTarget: (gymCode: string, wallName: string) => void;
    setRemoteTargetUrl: (url: string | null) => void;
    fetchRemoteTargets: () => Promise<void>;
    resetWallTargets: (gymCode?: string) => void;

    // Executive Actions
    setOrbitTargets: (gymCode: string, targets: OrbitTarget[]) => void;
    assignWallToOrbit: (gymCode: string, orbitId: string, wallName: string) => void;
    removeWallFromOrbit: (gymCode: string, orbitId: string, wallName: string) => void;
    reorderOrbit: (gymCode: string, orbitId: string, direction: 'up' | 'down') => void;
    updateOrbit: (gymCode: string, orbitId: string, updates: Partial<OrbitTarget>) => void;
    setWallCharacteristic: (gymCode: string, wallName: string, angle: WallTarget['angle']) => void;
    addFinancialRecord: (record: FinancialRecord) => void;
    setFinancialRecords: (records: FinancialRecord[]) => void;
    clearFinancialData: () => void;
    setActiveOrbitGym: (gymCode: string | null) => void;

    // Simulator Actions
    setSimulatorSetter: (setter: SimulatorSetter) => void;
    setSimulatorOverride: (shift: SimulatorShift) => void;
    setSimulatorVarianceBuffer: (buffer: number) => void;
    setSimulatorGymDebt: (gymCode: string, debt: number) => void;

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
        return saved ? JSON.parse(saved) : {};
    })(),
    remoteTargetUrl: localStorage.getItem('remote_target_url'),

    // Executive / Financial Initial State
    orbitTargets: (() => {
        const saved = localStorage.getItem('orbit_targets');
        return saved ? JSON.parse(saved) : {};
    })(),
    financialRecords: (() => {
        const saved = localStorage.getItem('financial_records');
        return saved ? JSON.parse(saved) : [];
    })(),
    activeOrbitGym: localStorage.getItem('active_orbit_gym'),

    // Simulator Initial State
    simulatorSetters: (() => {
        const saved = localStorage.getItem('simulator_setters');
        return saved ? JSON.parse(saved) : {};
    })(),
    simulatorOverrides: (() => {
        const saved = localStorage.getItem('simulator_overrides');
        return saved ? JSON.parse(saved) : {};
    })(),
    simulatorVarianceBuffer: Number(localStorage.getItem('simulator_variance_buffer') || '0'),
    simulatorGymDebt: (() => {
        const saved = localStorage.getItem('simulator_gym_debt');
        return saved ? JSON.parse(saved) : {};
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
    setGymSchedules: (gymSchedules) => set({ gymSchedules }),
    setGymSchedule: (gymCode, schedule) => set((state) => ({
        gymSchedules: { ...state.gymSchedules, [gymCode]: schedule }
    })),
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
        const key = `${override.gymCode}-${override.dateKey}-${override.dataType}-${override.field}`;
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

        // Atomic recalculation of any orbits that contain this wall
        const currentOrbits = get().orbitTargets[gymCode] || [];
        const updatedOrbits = currentOrbits.map(o => {
            if (o.assignedWalls?.includes(wallName)) {
                const vol = o.assignedWalls.reduce((sum, w) => sum + (gymTargets[w]?.targetCount || 0), 0);
                const updated = { ...o, totalClimbs: vol };
                updated.weeklyProductionGoal = Number((updated.totalClimbs / updated.rotationTarget).toFixed(1));
                updated.weeklyShiftGoal = Number((updated.weeklyProductionGoal / updated.rps).toFixed(1));
                updated.payPeriodHoursGoal = Number((updated.weeklyShiftGoal * updated.shiftDuration * 2).toFixed(1));
                updated.hoursPerClimbGoal = Number((updated.shiftDuration / updated.rps).toFixed(1));
                return updated;
            }
            return o;
        });

        localStorage.setItem('wall_targets', JSON.stringify(newWallTargets));
        localStorage.setItem('orbit_targets', JSON.stringify({ ...get().orbitTargets, [gymCode]: updatedOrbits }));
        set({ wallTargets: newWallTargets, orbitTargets: { ...get().orbitTargets, [gymCode]: updatedOrbits } });
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

    setRemoteTargetUrl: (url) => {
        if (url) localStorage.setItem('remote_target_url', url);
        else localStorage.removeItem('remote_target_url');
        set({ remoteTargetUrl: url });
    },

    fetchRemoteTargets: async () => {
        let url = get().remoteTargetUrl;
        if (!url) return;

        // Automatically convert Gist UI URLs to Raw URLs if needed
        if (url.includes('gist.github.com') && !url.includes('/raw')) {
            url = url.replace('gist.github.com', 'gist.githubusercontent.com') + (url.endsWith('/') ? '' : '/') + 'raw/';
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();

            if (!data || typeof data !== 'object') throw new Error('Invalid data format received');

            // Handle dual payload (both walls and orbits) or just walls
            const incomingWalls = data.wallTargets || (data.DSN ? data : {}); // Fallback for old format
            const incomingOrbits = data.orbitTargets || {};

            const currentWalls = get().wallTargets;
            const currentOrbits = get().orbitTargets;

            const newWallTargets = { ...currentWalls, ...incomingWalls };
            const newOrbitTargets = { ...currentOrbits, ...incomingOrbits };

            set({
                wallTargets: newWallTargets,
                orbitTargets: newOrbitTargets
            });

            localStorage.setItem('wall_targets', JSON.stringify(newWallTargets));
            localStorage.setItem('orbit_targets', JSON.stringify(newOrbitTargets));

            console.log('Remote targets (Walls & Orbits) synced successfully');
        } catch (e) {
            console.error('Remote Target Sync Failed:', e);
            throw e;
        }
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
        gymSchedules: null,
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
        selectedBaselineGym: 'DEFAULT',
        financialRecords: []
        // Note: wallTargets and orbitTargets are NOT cleared here as they are configuration.
        // Use resetWallTargets or individual deletes if needed.
    }),

    // Executive Actions
    setOrbitTargets: (gymCode, targets) => {
        const newTargets = { ...get().orbitTargets, [gymCode]: targets };
        localStorage.setItem('orbit_targets', JSON.stringify(newTargets));
        set({ orbitTargets: newTargets });
    },
    assignWallToOrbit: (gymCode: string, orbitId: string, wallName: string) => {
        const { orbitTargets, setOrbitTargets, setWallTarget, wallTargets } = get();

        // 1. Update Orbit
        const gymOrbits = [...(orbitTargets[gymCode] || [])];
        const updatedOrbits = gymOrbits.map(o => {
            let walls = [...(o.assignedWalls || [])];
            if (o.id === orbitId) {
                if (!walls.includes(wallName)) walls.push(wallName);
            } else {
                walls = walls.filter(w => w !== wallName);
            }

            // Recalculate metrics for any orbit that changed
            if (o.id === orbitId || o.assignedWalls?.includes(wallName)) {
                const gymWallTargets = wallTargets[gymCode] || {};
                const vol = walls.reduce((sum, w) => sum + (gymWallTargets[w]?.targetCount || 0), 0);
                const updated = { ...o, assignedWalls: walls, totalClimbs: vol };

                updated.weeklyProductionGoal = Number((updated.totalClimbs / updated.rotationTarget).toFixed(1));
                updated.weeklyShiftGoal = Number((updated.weeklyProductionGoal / updated.rps).toFixed(1));
                updated.payPeriodHoursGoal = Number((updated.weeklyShiftGoal * updated.shiftDuration * 2).toFixed(1));
                updated.hoursPerClimbGoal = Number((updated.shiftDuration / updated.rps).toFixed(1));
                return updated;
            }
            return o;
        });
        setOrbitTargets(gymCode, updatedOrbits);

        // 2. Update Wall
        setWallTarget(gymCode, wallName, { orbitId });
    },
    removeWallFromOrbit: (gymCode, orbitId, wallName) => {
        const { orbitTargets, setOrbitTargets, setWallTarget } = get();
        const gymOrbits = [...(orbitTargets[gymCode] || [])];
        const updatedOrbits = gymOrbits.map(o => {
            if (o.id === orbitId) {
                return { ...o, assignedWalls: (o.assignedWalls || []).filter(w => w !== wallName) };
            }
            return o;
        });
        setOrbitTargets(gymCode, updatedOrbits);
        setWallTarget(gymCode, wallName, { orbitId: undefined });
    },
    reorderOrbit: (gymCode: string, orbitId: string, direction: 'up' | 'down') => {
        const { orbitTargets, setOrbitTargets } = get();
        const orbits = [...(orbitTargets[gymCode] || [])];
        const idx = orbits.findIndex(o => o.id === orbitId);
        if (idx === -1) return;

        if (direction === 'up' && idx > 0) {
            [orbits[idx], orbits[idx - 1]] = [orbits[idx - 1], orbits[idx]];
        } else if (direction === 'down' && idx < orbits.length - 1) {
            [orbits[idx], orbits[idx + 1]] = [orbits[idx + 1], orbits[idx]];
        }

        setOrbitTargets(gymCode, orbits);
    },
    updateOrbit: (gymCode: string, orbitId: string, updates: Partial<OrbitTarget>) => {
        const { orbitTargets, setOrbitTargets, wallTargets } = get();
        const gymWallTargets = wallTargets[gymCode] || {};
        const orbits = [...(orbitTargets[gymCode] || [])];

        const updatedOrbits = orbits.map(o => {
            if (o.id === orbitId) {
                const updated = { ...o, ...updates };
                const vol = (updated.assignedWalls || []).reduce((sum, w) => sum + (gymWallTargets[w]?.targetCount || 0), 0);
                updated.totalClimbs = vol;
                updated.weeklyProductionGoal = Number((updated.totalClimbs / updated.rotationTarget).toFixed(1));
                updated.weeklyShiftGoal = Number((updated.weeklyProductionGoal / updated.rps).toFixed(1));
                updated.payPeriodHoursGoal = Number((updated.weeklyShiftGoal * updated.shiftDuration * 2).toFixed(1));
                updated.hoursPerClimbGoal = Number((updated.shiftDuration / updated.rps).toFixed(1));
                return updated;
            }
            return o;
        });

        setOrbitTargets(gymCode, updatedOrbits);
    },
    setWallCharacteristic: (gymCode, wallName, angle) => {
        get().setWallTarget(gymCode, wallName, { angle });
    },
    addFinancialRecord: (record) => {
        const newRecords = [...get().financialRecords, record];
        localStorage.setItem('financial_records', JSON.stringify(newRecords));
        set({ financialRecords: newRecords });
    },
    setFinancialRecords: (financialRecords) => {
        localStorage.setItem('financial_records', JSON.stringify(financialRecords));
        set({ financialRecords });
    },
    clearFinancialData: () => {
        localStorage.removeItem('financial_records');
        set({ financialRecords: [] });
    },
    setActiveOrbitGym: (gymCode: string | null) => {
        if (gymCode) localStorage.setItem('active_orbit_gym', gymCode);
        else localStorage.removeItem('active_orbit_gym');
        set({ activeOrbitGym: gymCode });
    },

    // Simulator Actions
    setSimulatorSetter: (setter) => {
        const current = get().simulatorSetters;
        const newState = { ...current, [setter.name]: setter };
        localStorage.setItem('simulator_setters', JSON.stringify(newState));
        set({ simulatorSetters: newState });
    },
    setSimulatorOverride: (shift) => {
        const key = `${shift.dateKey}-${shift.gymCode}-${shift.type}`;
        const newState = { ...get().simulatorOverrides, [key]: shift };
        localStorage.setItem('simulator_overrides', JSON.stringify(newState));
        set({ simulatorOverrides: newState });
    },
    setSimulatorVarianceBuffer: (simulatorVarianceBuffer) => {
        localStorage.setItem('simulator_variance_buffer', String(simulatorVarianceBuffer));
        set({ simulatorVarianceBuffer });
    },
    setSimulatorGymDebt: (gymCode, debt) => {
        const newState = { ...get().simulatorGymDebt, [gymCode]: debt };
        localStorage.setItem('simulator_gym_debt', JSON.stringify(newState));
        set({ simulatorGymDebt: newState });
    }
}));

