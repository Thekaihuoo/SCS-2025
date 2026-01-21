
export enum Status {
  NORMAL = 'NORMAL',
  RISK = 'RISK',
  PROBLEM = 'PROBLEM'
}

export enum EQLevel {
  NEEDS_IMPROVEMENT = 'ปรับปรุง',
  NORMAL = 'ปกติ',
  HIGH = 'สูงกว่าปกติ'
}

export interface SDQResult {
  emotional: number;
  conduct: number;
  hyperactivity: number;
  peer: number;
  prosocial: number;
  totalDifficulties: number;
  status: Status;
  updatedAt: string;
}

export interface EQResult {
  good: number;
  smart: number;
  happy: number;
  total: number;
  level: EQLevel;
  updatedAt: string;
}

export interface RiskResult {
  academic: boolean;
  health: boolean;
  family: boolean;
  behavior: boolean;
  status: Status;
  updatedAt: string;
}

export interface HomeVisit {
  date: string;
  condition: string;
  googleMapsLink: string;
  needsScholarship: boolean;
  photos: string[]; // Base64
}

export interface CounselingRecord {
  id: string;
  date: string;
  topic: string;
  detail: string;
  result: string;
}

export interface Student {
  id: string;
  name: string;
  nickname: string;
  grade: string;
  room: string;
  teacherId: string;
  sdq?: SDQResult;
  eq?: EQResult;
  risk?: RiskResult;
  homeVisit?: HomeVisit;
  counseling?: CounselingRecord[];
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
}

export interface User {
  username: string;
  role: 'admin' | 'teacher';
  teacherId?: string;
}
