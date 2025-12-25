export type Step =
  | 'INTRO'
  | 'HOURS'
  | 'SHIFTS'
  | 'ROLES'
  | 'STAFFING'
  | 'COVERAGE'
  | 'GENERATING'
  | 'FINISHED';

export interface TimeRange {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface OperatingHours {
  weekdays: TimeRange;
  weekends: TimeRange;
}

export interface ShiftDefinition {
  id: string;
  name: string; // "Morning", "Evening"
  start: string;
  end: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface StaffCount {
  roleId: string;
  count: number;
}

// shiftId -> roleId -> count needed
export type CoverageMatrix = Record<string, Record<string, number>>;

export interface SchedulerData {
  businessName: string;
  operatingHours: OperatingHours;
  shifts: ShiftDefinition[];
  roles: Role[];
  staffCounts: StaffCount[];
  coverage: CoverageMatrix;
}

export interface Message {
  id: string;
  sender: 'bot' | 'user';
  content: React.ReactNode; // Can be text or a summary component
  timestamp: number;
}

export interface SchedulerState {
  currentStep: Step;
  data: SchedulerData;
  history: Message[];
}
