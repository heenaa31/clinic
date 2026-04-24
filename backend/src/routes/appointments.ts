import { Router, Response } from 'express';
import { z } from 'zod';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import User from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest, AppointmentPayload } from '../types';

const router = Router();

const createSchema = z.object({
  patientName: z.string().min(2),
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  duration: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
});

export const createAppointmentRouter = (io: Server) => {
  // Admin: get all doctors (for the dropdown)
  router.get(
    '/doctors',
    authenticate,
    requireRole('admin'),
    async (_req: AuthRequest, res: Response): Promise<void> => {
      const doctors = await User.find({ role: 'doctor' }, '_id name email');
      res.json(doctors);
    }
  );

  // Admin: create appointment
  router.post(
    '/',
    authenticate,
    requireRole('admin'),
    async (req: AuthRequest, res: Response): Promise<void> => {
      const result = createSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: 'Validation failed', errors: result.error.flatten() });
        return;
      }

      const { patientName, doctorId, date, startTime, duration } = result.data;

      // Verify doctor exists
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        res.status(400).json({ message: 'Invalid doctor ID' });
        return;
      }
      const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
      if (!doctor) {
        res.status(404).json({ message: 'Doctor not found' });
        return;
      }

      // Reject past dates
      const today = new Date().toISOString().split('T')[0];
      if (date < today) {
        res.status(400).json({ message: 'Date must not be in the past' });
        return;
      }

      const appointment = await Appointment.create({ patientName, doctorId, date, startTime, duration });

      const payload: AppointmentPayload = {
        _id: appointment._id.toString(),
        patientName: appointment.patientName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: appointment.date,
        startTime: appointment.startTime,
        duration: appointment.duration,
        createdAt: appointment.createdAt.toISOString(),
      };

      // Emit to the doctor's private room
      io.to(`doctor:${doctorId}`).emit('appointment:new', payload);

      res.status(201).json(payload);
    }
  );

  // Doctor: get upcoming appointments (today onwards), scoped to self
  // Client sends ?date=YYYY-MM-DD (local date) so timezone is always correct
  router.get(
    '/my',
    authenticate,
    requireRole('doctor'),
    async (req: AuthRequest, res: Response): Promise<void> => {
      const doctorId = req.user!.userId;
      const dateParam = typeof req.query.date === 'string' ? req.query.date : null;
      const today = dateParam ?? new Date().toISOString().split('T')[0];

      const appointments = await Appointment.find({
        doctorId,
        date: { $gte: today },
      }).sort({ date: 1, startTime: 1 });

      res.json(appointments);
    }
  );

  return router;
};
