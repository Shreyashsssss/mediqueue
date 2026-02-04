
export enum UserRole {
  PATIENT = 'PATIENT',
  STAFF = 'STAFF',
  DOCTOR = 'DOCTOR'
}

export enum TriageLevel {
  NORMAL = 'NORMAL',
  INTERMEDIATE = 'INTERMEDIATE',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  education: string;
  experience: number;
  availability: { [key: string]: string[] }; // 'YYYY-MM-DD': ['09:00', ...]
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  symptoms: string;
  urgencyScale: number; // 1-10
  triageLevel: TriageLevel;
  triageScore: number;
  timeSlot: string;
  doctorId: string;
  registeredAt: string;
  isOffline: boolean;
}

export interface MutationState {
  isVolumeDoubled: boolean;
  isStaffShortage: boolean;
}
