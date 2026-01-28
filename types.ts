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
  // Pre-calculated fields for performance
  isRoute: boolean;
  normalizedGrade: string;
  gradeScore: number;
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

export type AppView = 'analytics' | 'generator' | 'mapper' | 'report';

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