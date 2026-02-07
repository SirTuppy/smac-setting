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

<<<<<<< HEAD
<<<<<<< Updated upstream
export type AppView = 'analytics' | 'generator' | 'mapper' | 'report';
=======
export type AppView = 'analytics' | 'generator' | 'mapper' | 'report' | 'shift-analyzer' | 'wall-targets' | 'executive';
>>>>>>> Stashed changes
=======
export type AppView = 'analytics' | 'generator' | 'mapper' | 'report' | 'shift-analyzer' | 'wall-targets';
>>>>>>> feat/ai-analyst

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

<<<<<<< HEAD
<<<<<<< Updated upstream
=======
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
  totalClimbs: number;
  rps: number; // Routes Per Setter
  shiftDuration: number;
  rotationTarget: number; // in weeks
  // Derived metrics from Excel
  weeklyProductionGoal: number;
  weeklyShiftGoal: number;
  payPeriodHoursGoal: number;
  hoursPerClimbGoal: number;
}

/**
 * Raw data from Ryan's Payroll/P&L CSVs.
 * Source: "Production X Wage Ledger" & "Monthly P&L"
 */
export interface FinancialRecord {
  gymCode: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  totalHours: number;
  totalWages: number;
  budgetWages: number;
  variance: number;
  glAccount?: string; // e.g., "Total for E01"
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

=======
>>>>>>> feat/ai-analyst
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

<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> feat/ai-analyst
// Sample CSV Data for testing (KAYA Format)
export const MOCK_CSV_DATA = `Name,Grade,Setter,Wall,Date_Set,Color,climbType
"Pinch Me I'm Dreaming",V4,"Alex Handhold, Sarah Sendit",Wall A,Wed Jan 14 2026 10:00:00 GMT+0000 (Coordinated Universal Time),Red,Bouldering
"Crimpy Business",V7,Sarah Sendit,Wall B,Wed Jan 14 2026 11:30:00 GMT+0000 (Coordinated Universal Time),Blue,Bouldering
"Jug Haul",V2,Unknown,Wall C,Tue Jan 13 2026 09:15:00 GMT+0000 (Coordinated Universal Time),Green,Bouldering
"The Proj",V10,Alex Handhold,Cave,Tue Jan 13 2026 14:20:00 GMT+0000 (Coordinated Universal Time),Black,Bouldering
"Warmup 1",Vintro,Sarah Sendit,Wall A,Mon Jan 12 2026 08:00:00 GMT+0000 (Coordinated Universal Time),Yellow,Bouldering
"Slab Scary",V5,Alex Handhold,Slab 1,Mon Jan 12 2026 13:00:00 GMT+0000 (Coordinated Universal Time),Purple,Bouldering
"Dynamic Dyno",V6,Newbie Nick,Wall B,Fri Jan 09 2026 10:45:00 GMT+0000 (Coordinated Universal Time),Orange,Bouldering
"Corner Pocket",5.10a,Sarah Sendit,Rope Wall 1,Thu Jan 08 2026 15:00:00 GMT+0000 (Coordinated Universal Time),Pink,Routes
"Newbie Route",5.intro,Newbie Nick,Rope Wall 1,Thu Jan 08 2026 14:00:00 GMT+0000 (Coordinated Universal Time),Green,Routes
"Overhang Beast",5.12c,Alex Handhold,Rope Wall 2,Wed Jan 07 2026 12:00:00 GMT+0000 (Coordinated Universal Time),Red,Routes
"Introduction",V0,Newbie Nick,Kids Wall,Tue Jan 06 2026 09:00:00 GMT+0000 (Coordinated Universal Time),Blue,Bouldering
`;

export const MOCK_HUMANITY_DATA = `Title,Start Date,Location,Employee Names
"Slab Scary / Sandy Beaches",2026-01-14,Movement Design District,Alex Handhold / Sarah Sendit
"ziggy",2026-01-15,Movement Design District,Sarah Sendit
"b1 / b2",2026-01-14,Movement Grapevine,Newbie Nick
"kids wall",2026-01-12,Movement Plano,Alex Handhold
`;