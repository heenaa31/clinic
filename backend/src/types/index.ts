import { Request } from 'express';

export type UserRole = 'admin' | 'doctor';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface AppointmentPayload {
  _id: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  duration: 15 | 30 | 45 | 60;
  createdAt: string;
}
