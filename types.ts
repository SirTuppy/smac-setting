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

export type AppView = 'analytics' | 'generator' | 'mapper' | 'report' | 'shift-analyzer' | 'orbit-targets' | 'executive' | 'simulator';

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

export interface ScheduleEntry {
  id: string;
  walls: string[];
  setterCount: number;
  climbType: string;
}

export interface GymSchedule {
  scheduleByDay: { routes: ScheduleEntry[], boulders: ScheduleEntry[] }[];
  dateRange: string;
  fileDateRange: string;
  startDay: Date;
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

// --- Executive & Financial Data Models ---

/**
 * Tracks the "All Orbits" targets for a specific gym/discipline.
 * Source: "All Orbits Log" Excel Sheet
 */
export interface OrbitTarget {
  id: string;
  gymCode: string;
  region: string;
  orbitName: string;
  discipline: 'Routes' | 'Boulders';
  totalClimbs: number; // Aggregated from assigned walls
  assignedWalls: string[]; // List of wallNames
  rps: number; // Routes Per Setter (Baseline)
  shiftDuration: number;
  rotationTarget: number; // in weeks
  rationale?: string; // Ryan's "Turnaround Decisions"
  lastAdjusted?: string; // ISO Date

  // Derived metrics from Excel
  weeklyProductionGoal: number;
  weeklyShiftGoal: number;
  payPeriodHoursGoal: number;
  hoursPerClimbGoal: number;
  gymHoursRatioTotal?: number; // % of total gym labor
  rpsWeighted?: number; // RPS * ratio
}

/**
 * Raw data from Ryan's Payroll/P&L CSVs.
 * Source: "Production X Wage Ledger" & "Monthly P&L"
 */
export interface FinancialRecord {
  gymCode: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  totalHours: number; // XYZ data
  totalWages: number; // XYZ data
  budgetWages?: number;
  variance?: number;
  glAccount?: string;
}

/**
 * The Master Record: Merged data from Kaya (Production) and Payroll (Financial).
 * This powers the "Production Wage Dashboard" rows.
 */
export interface GymPeriodPerformance {
  gymCode: string;
  payPeriodEnd: string;
  dateRange: { start: string; end: string };

  // Financials
  actualHours: number;
  actualWages: number;
  budgetWages: number;

  // Production (Actuals from Kaya)
  bouldersSet: number;
  routesSet: number;
  uniqueSetters: number;

  // Efficiency Metrics (The "Ryan Metrics")
  costPerClimb: number;
  hoursPerClimbActual: number;
  productionContributionRatio: number; // Percentage

  // Variance & Context
  boulderDensity: number;
  boulderRotation: number; // calculated weeks
  wageVariancePercent: number;
  notes?: string;
}

export interface GymSettings {
  displayMode: 'merged' | 'separate';
  climbTypeDisplay: 'type' | 'steepness';
}

export interface GymMeta {
  code: string;
  name: string;
  region: string;
  searchKeywords: string[];
  displayMode: 'separate' | 'merged';
  weekStartDay: 'Monday' | 'Sunday';
  isBoulderOnly: boolean;
  ropeTypeName?: string;
}


// --- Simulator Models ---

export interface SimulatorSetter {
  name: string;
  avgWeeklyOutput: number; // Historical Climbs per Shift
  attendanceVariance: number; // % variance vs scheduled
  active: boolean;
  baseSchedule: number[]; // days of week [0-6]
  specialDateModifiers?: Record<string, 'pto' | 'guest' | 'standard'>; // ISO Date -> Mod
}

export interface SimulatorShift {
  dateKey: string;
  gymCode: string;
  setterNames: string[];
  type: 'rope' | 'boulder';
  isOverride: boolean;
  modifier?: 'pto' | 'guest' | 'heavy-forerunning';
}
