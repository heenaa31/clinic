export type UserRole = 'admin' | 'doctor';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  token: string;
  user: AuthUser;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
}

export interface Appointment {
  _id: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  duration: 15 | 30 | 45 | 60;
  createdAt: string;
}

export interface BookingFormValues {
  patientName: string;
  doctorId: string;
  date: string;
  startTime: string;
  duration: 15 | 30 | 45 | 60;
}
