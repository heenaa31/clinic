import { Router, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

const createDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Admin: create a new doctor account
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const result = createDoctorSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', errors: result.error.flatten() });
      return;
    }

    const { name, email, password } = result.data;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'A user with this email already exists' });
      return;
    }

    const doctor = await User.create({ name, email, password, role: 'doctor' });
    res.status(201).json({ id: doctor._id, name: doctor.name, email: doctor.email, role: doctor.role });
  }
);

// Admin: list all doctors
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    const doctors = await User.find({ role: 'doctor' }, '_id name email createdAt').sort({ name: 1 });
    res.json(doctors);
  }
);

export default router;
