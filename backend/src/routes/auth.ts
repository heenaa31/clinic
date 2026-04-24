import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Invalid input', errors: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

export default router;
