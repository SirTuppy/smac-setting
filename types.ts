export interface Climb {
  id: string;
  name: string;
  grade: string;
  setter: string;
  wall: string;
  dateSet: Date;
  color?: string; // Optional if CSV has it, otherwise derived
  climbType?: string;
  gym?: string;
  gymCode?: string;
  // Pre-calculated fields for performance
  isRoute: boolean;
  normalizedGrade: string;
  gradeScore: number;
  isNobo?: boolean; // New Boulder
  isNew?: boolean;  // General new flag
}

export interface WallTarget {
  gymCode: string;
  wallName: string;
  targetCount: number;         // Total items that should be on the wall
  targetClimbsPerSetter: number; // Efficiency target (Climbs per Setter per Shift) for this wall
  targetGrades?: Record<string, number>; // Distribution (Optional)
  type: 'rope' | 'boulder';
  displayName?: string;
  isManual?: boolean;
  orbitId?: string; // Links to an OrbitTarget
  angle?: 'slab' | 'vert' | 'overhang' | 'steep' | 'none';
}

export interface ScheduleOverride {
  gymCode: string;
  dateKey: string; // ISO Date YYYY-MM-DD to persist across sessions
  dataType: 'routes' | 'boulders';
  field: 'location' | 'climbType' | 'setterCount';
  value: string;
  shiftId?: string;
}

export interface SetterStats {
  name: string;
  totalClimbs: number;
  routes: number;
  boulders: number;
  shifts: number; // Unique (Date + Gym) work instances
  gradeDistribution: Record<string, number>;
  stewardshipHours: number; // Manual input
  settingHours: number; // Manual or calculated default
}

export interface EmailSettings {
  to: string;
  cc: string;
  subject: string;
  body: string;
}

export interface MapperPoint {
  id: number;
  holdX: number;
  holdY: number;
  labelX: number;
  labelY: number;
}

export interface MapperStyle {
  dotColor: string;
  lineColor: string;
  textColor: string;
  circleColor: string;
  circleSize: number;
  dotSize: number;
  lineWidth: number;
  showCircle: boolean;
}

export type AppView = 'analytics' | 'mapper' | 'report' | 'shift-analyzer' | 'wsp-generator' | 'budget-tracker';

export interface WallStats {
  name: string;
  totalClimbs: number;
  lastSet: Date;
  gradeAverage: string;
}

export interface FilterState {
  startDate: Date;
  endDate: Date;
  selectedSetter: string | null;
  selectedWall: string | null;
}


export interface SetterProduction {
  name: string;
  total: number;
  routes: number;
  boulders: number;
  gyms: Set<string>;
  shifts: number;
  gymCodes: string;
}

export interface ProductionStats {
  total: number;
  routes: number;
  boulders: number;
  totalShifts: number;
  ropeShifts: number;
  boulderShifts: number;
  splitShifts: number;
  setterData: SetterProduction[];
  dailyData: any[]; // Using any for now as Recharts data structure is dynamic
  weekdayData: { day: string; routes: number; boulders: number; total: number }[];
  activeGymCodes: string[];
}

export interface BaselineSettings {
  boulderTargetPerShift: number;
  ropeTargetPerShift: number;
  shiftsPerWeek: number;
  totalVolumePerWeek: number;
  routesPerWeek: number;
  bouldersPerWeek: number;
  settingDays: number[]; // [0-6] where 0 is Sunday
  idealDailySplit: { day: number, routes: number, boulders: number }[];
  showBaselines: boolean;
  showSummary: boolean;
  showReferencePage: boolean;
  reportComments: string;
}


export interface GymSettings {
  displayMode: 'merged' | 'separate';
  climbTypeDisplay: 'type' | 'steepness';
}

export interface GymMeta {
  code: string;
  name: string;
  region: string;
  tier?: string;
  facilityCode?: string;
  searchKeywords: string[];
  displayMode: 'separate' | 'merged';
  weekStartDay: 'Monday' | 'Sunday';
  isBoulderOnly: boolean;
  ropeTypeName?: string;
}

// --- WSP Generator Models ---
export interface WSPSettings {
  nameFormat: 'first' | 'full';
  marketingEmail: string;
  includeDefaultText: boolean;
  gymEmails: Record<string, { gd: string; agd: string }>;
}

export interface WSPScheduleRow {
  id: string;
  day: string;
  setters: string;
  type: string;
  zones: string;
  notes: string;
}

export interface WSPGymData {
  rows: WSPScheduleRow[];
  generalNotes: string[];
  settersChoice: string[];
}

// --- Budget Tracker Models ---
export interface BudgetCategory {
  id: string; // usually lower-cased name
  name: string;
  annualLimit: number;
}

export interface BudgetExpense {
  id: string;
  date: string; // YYYY-MM-DD
  location?: string;
  categoryId: string;
  vendor?: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface BudgetState {
  config: {
    annualBudget: number;
    categories: BudgetCategory[];
    yearlyLimits?: Record<number, { annualBudget: number; categories: Record<string, number> }>;
  };
  expenses: BudgetExpense[];
}
