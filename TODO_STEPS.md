# ClinicFlow — Build It From Scratch (Step by Step)


## What are we building?

A small web app for a clinic where:
- An **Admin** logs in and books appointments for patients
- A **Doctor** logs in and sees their upcoming appointments
- When admin books something, it appears on the doctor's screen **instantly** (no refresh needed)

The app has two parts:
- **Backend** = the server. Lives in `backend/` folder. Written in Node.js + TypeScript. Talks to the database.
- **Frontend** = the web page. Lives in `frontend/` folder. Written in React + TypeScript. What the user sees in a browser.

Both parts talk to each other over HTTP (normal web requests) and WebSockets (for live updates).

---

## The folder structure you will end up with

```
clinicflows/                    ← the main project folder
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts         ← what a user looks like in the database
│   │   │   └── Appointment.ts  ← what an appointment looks like
│   │   ├── routes/
│   │   │   ├── auth.ts         ← handles login
│   │   │   ├── appointments.ts ← handles booking + listing appointments
│   │   │   └── doctors.ts      ← handles adding + listing doctors
│   │   ├── middleware/
│   │   │   └── auth.ts         ← checks if the person is logged in (JWT)
│   │   ├── socket/
│   │   │   └── index.ts        ← handles live updates (WebSocket)
│   │   ├── types/
│   │   │   └── index.ts        ← TypeScript type definitions
│   │   ├── index.ts            ← starts the server
│   │   └── seed.ts             ← creates starter accounts in the database
│   ├── .env                    ← secret config (not on GitHub!)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AppointmentCard.tsx  ← one appointment shown as a card
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           ← saves login state
│   │   │   └── useSocket.ts         ← connects to live updates
│   │   ├── lib/
│   │   │   ├── api.ts               ← all HTTP calls to backend
│   │   │   └── auth.ts              ← saves login token to browser storage
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        ← the login screen
│   │   │   ├── AdminPage.tsx        ← admin: book appointments + manage doctors
│   │   │   └── DoctorDashboard.tsx  ← doctor: see upcoming appointments
│   │   ├── types/
│   │   │   └── index.ts             ← TypeScript type definitions
│   │   ├── App.tsx                  ← decides which page to show
│   │   └── main.tsx                 ← entry point (starts React)
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
├── README.md
├── SETUP_GUIDE.md
└── TODO_STEPS.md                ← this file
```

---

## PHASE 1 — Install the tools you need (do this once, ever)

### Step 1 — Install Node.js

Node.js is what runs JavaScript code on your computer (outside a browser).

1. Go to https://nodejs.org
2. Click the big green **LTS** button to download
3. Open the downloaded file and click Next → Next → Install → Finish
4. Open a terminal (in VS Code: press `Ctrl + ~`) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`. If you do, Node.js is installed. ✅

---

### Step 2 — Install MongoDB

MongoDB is the database. It stores all your data (users, appointments).

1. Go to https://www.mongodb.com/try/download/community
2. Choose: Version = 7.0, Platform = Windows, Package = msi
3. Download and open the `.msi` file
4. Click Next → Accept license → Complete → Next
5. On the "Service Configuration" screen:
   - Keep "Install MongoDB as a Service" checked ✅
   - Everything else: leave as default
6. Uncheck "Install MongoDB Compass" (we install that separately)
7. Click Install → Finish

**Check it worked:** Open a terminal and type:
```
sc query MongoDB
```
You should see `STATE: 4 RUNNING` ✅  
If it says STOPPED, run: `net start MongoDB`

---

### Step 3 — Install MongoDB Compass (the visual tool to see your data)

MongoDB Compass is like a spreadsheet viewer but for your database.

1. Go to https://www.mongodb.com/try/download/compass
2. Download and install (click Next through everything)
3. Open Compass
4. In the connection box, type: `mongodb://localhost:27017`
5. Click **Save & Connect**
6. You will see a list of databases on the left side ✅

---

### Step 4 — Make sure Git is installed

Git is what saves and uploads your code to GitHub.

```
git --version
```
If you see `git version 2.x.x`, you're good ✅  
If not, go to https://git-scm.com/download/win and install it.

---

## PHASE 2 — Create the project folders

Open VS Code. Open a terminal inside it (`Ctrl + ~`).

```bash
mkdir clinicflows
cd clinicflows
mkdir backend
mkdir frontend
```

Now you have an empty project folder with two empty sub-folders.

---

## PHASE 3 — Set up the Backend

The backend is the "engine" of the app. It handles logins, saves appointments, talks to MongoDB, and sends live updates.

### Step 5 — Initialize the backend

```bash
cd backend
npm init -y
```
This creates a `package.json` file (the list of all packages/tools this project uses).

---

### Step 6 — Install backend packages

```bash
npm install express cors mongoose jsonwebtoken bcryptjs dotenv socket.io zod
npm install --save-dev typescript ts-node-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken
```

**What each package does (in plain English):**
- `express` → creates the web server (receives HTTP requests, sends responses)
- `cors` → allows the frontend (port 5173) to talk to the backend (port 5000)
- `mongoose` → lets you work with MongoDB using JavaScript objects instead of raw database commands
- `jsonwebtoken` → creates and reads JWT tokens (like a stamped ID card that proves you're logged in)
- `bcryptjs` → scrambles passwords before saving them (so even if someone hacks the database, they can't read passwords)
- `dotenv` → reads your `.env` file (secret config like database address and secret key)
- `socket.io` → handles WebSocket connections (the "live update" channel)
- `zod` → validates incoming data (e.g. "is this actually an email? is this number within range?")
- `typescript` → adds type checking so you catch bugs before running the code
- `ts-node-dev` → runs TypeScript directly (no need to manually compile to JavaScript first)

---

### Step 7 — Create tsconfig.json (TypeScript config)

Create a new file: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

### Step 8 — Add scripts to package.json

Open `backend/package.json` and find the `"scripts"` section. Replace it with:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "seed": "ts-node-dev --transpile-only src/seed.ts"
}
```

- `npm run dev` → starts the server and auto-restarts when you save a file
- `npm run seed` → runs the seed script to create starter accounts

---

### Step 9 — Create the .env file (secret config)

Create a new file: `backend/.env`

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clinicflow
JWT_SECRET=clinicflow_jwt_secret_2024
CLIENT_URL=http://localhost:5173
SOCKET_URL=http://localhost:5000
```

> ⚠️ This file must NEVER be uploaded to GitHub. It contains secrets.

**What each line means:**
- `PORT=5000` → the backend server runs on port 5000
- `MONGO_URI` → the address of your local MongoDB database. "clinicflow" is the database name (MongoDB creates it automatically on first use)
- `JWT_SECRET` → a secret string used to sign login tokens. Change this to anything random.
- `CLIENT_URL` → the address of the frontend (used to allow cross-origin requests)
- `SOCKET_URL` → the address of the backend socket server (returned to frontend via /api/config)

---

### Step 10 — Create the folder structure inside src/

```bash
mkdir src
mkdir src\models
mkdir src\routes
mkdir src\middleware
mkdir src\socket
mkdir src\types
```

---

### Step 11 — Create the TypeScript types (src/types/index.ts)

This file defines the shapes of data used across the backend.

```typescript
import { Request } from 'express';

export type UserRole = 'admin' | 'doctor';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface AppointmentPayload {
  patientName: string;
  doctorId: string;
  date: string;
  startTime: string;
  duration: 15 | 30 | 45 | 60;
}
```

---

### Step 12 — Create the User model (src/models/User.ts)

This defines what a "user" looks like in MongoDB.

```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor'], required: true },
  },
  { timestamps: true }
);

// Before saving a user, hash their password automatically
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
```

**What is hashing?**  
Hashing turns a password like "admin123" into a scrambled string like "$2b$10$abc...xyz". Even if someone steals the database, they cannot reverse it back to "admin123".

---

### Step 13 — Create the Appointment model (src/models/Appointment.ts)

```typescript
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },       // "2026-04-25"
    startTime: { type: String, required: true },  // "09:30"
    duration: { type: Number, enum: [15, 30, 45, 60], required: true },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
```

---

### Step 14 — Create the auth middleware (src/middleware/auth.ts)

This file checks: "Is this person logged in before I let them access a route?"

```typescript
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, UserRole } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
```

---

### Step 15 — Create the auth route (src/routes/auth.ts)

Handles login for both admin and doctor.

```typescript
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
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export default router;
```

---

### Step 16 — Create the appointments route (src/routes/appointments.ts)

```typescript
import { Router, Response } from 'express';
import { z } from 'zod';
import { Server } from 'socket.io';
import Appointment from '../models/Appointment';
import User from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';

const bookingSchema = z.object({
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().refine((n): n is 15 | 30 | 45 | 60 => [15, 30, 45, 60].includes(n)),
});

export function createAppointmentRouter(io: Server) {
  const router = Router();
  router.use(authenticate);

  // Admin: get list of doctors (for the dropdown)
  router.get('/doctors', requireRole('admin'), async (_req, res: Response) => {
    const doctors = await User.find({ role: 'doctor' }).select('name email');
    res.json(doctors);
  });

  // Admin: book a new appointment
  router.post('/', requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() });
      return;
    }
    const { patientName, doctorId, date, startTime, duration } = parsed.data;
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) { res.status(404).json({ message: 'Doctor not found' }); return; }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) { res.status(400).json({ message: 'Cannot book past dates' }); return; }

    const appointment = await Appointment.create({ patientName, doctorId, date, startTime, duration });
    // Send live update to that doctor's browser
    io.to(`doctor:${doctorId}`).emit('appointment:new', {
      _id: appointment._id,
      patientName,
      doctorId,
      date,
      startTime,
      duration,
    });
    res.status(201).json(appointment);
  });

  // Doctor: get their upcoming appointments
  router.get('/my', requireRole('doctor'), async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const doctorId = req.user.userId;
    const today = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: today },
    }).sort({ date: 1, startTime: 1 });
    res.json(appointments);
  });

  return router;
}
```

---

### Step 17 — Create the doctors route (src/routes/doctors.ts)

Admin can create and list doctor accounts.

```typescript
import { Router, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticate, requireRole('admin'));

const createDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createDoctorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }
  const { name, email, password } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) { res.status(409).json({ message: 'Email already in use' }); return; }
  const doctor = await User.create({ name, email, password, role: 'doctor' });
  res.status(201).json({ _id: doctor._id, name: doctor.name, email: doctor.email });
});

router.get('/', async (_req, res: Response) => {
  const doctors = await User.find({ role: 'doctor' }).select('name email').sort({ name: 1 });
  res.json(doctors);
});

export default router;
```

---

### Step 18 — Create the socket handler (src/socket/index.ts)

This manages the WebSocket connections. When a doctor logs in, their browser "joins a room" so the backend knows where to send their live updates.

```typescript
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export function initSocket(io: Server) {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    if (user.role === 'doctor') {
      socket.join(`doctor:${user.userId}`);
    }
  });
}
```

---

### Step 19 — Create the seed file (src/seed.ts)

This creates starter accounts. Run it once to populate MongoDB with an admin and two doctors.

```typescript
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  await User.deleteMany({});
  await User.create([
    { name: 'Admin User', email: 'admin@clinic.com', password: 'admin123', role: 'admin' },
    { name: 'Dr. Smith', email: 'dr.smith@clinic.com', password: 'doctor123', role: 'doctor' },
    { name: 'Dr. Jones', email: 'dr.jones@clinic.com', password: 'doctor123', role: 'doctor' },
  ]);
  console.log('Seeded: admin@clinic.com / admin123');
  console.log('Seeded: dr.smith@clinic.com / doctor123');
  console.log('Seeded: dr.jones@clinic.com / doctor123');
  await mongoose.disconnect();
}

seed().catch(console.error);
```

---

### Step 20 — Create the main server file (src/index.ts)

This is what starts everything: the web server, the database connection, and the WebSocket server.

```typescript
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import authRouter from './routes/auth';
import { createAppointmentRouter } from './routes/appointments';
import doctorsRouter from './routes/doctors';
import { initSocket } from './socket';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/appointments', createAppointmentRouter(io));
app.use('/api/doctors', doctorsRouter);

// Frontend fetches this to know the socket server address
app.get('/api/config', (_req, res) => {
  const socketUrl = process.env.SOCKET_URL || `http://localhost:${process.env.PORT || 5000}`;
  res.json({ socketUrl });
});

initSocket(io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinicflow';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
```

---

## PHASE 4 — Set up the Frontend

The frontend is the web page the user sees. It is a React application.

### Step 21 — Create the React app

Open a NEW terminal tab, go back to the project root:

```bash
cd c:\Users\YourName\clinicflows
npm create vite@latest frontend -- --template react-ts
```

This creates a React + TypeScript project using Vite (a fast build tool).

---

### Step 22 — Install frontend packages

```bash
cd frontend
npm install react-hook-form @hookform/resolvers zod socket.io-client
```

**What each package does:**
- `react-hook-form` → manages form state (tracks what you typed, validation results)
- `@hookform/resolvers` → connects react-hook-form to Zod for validation
- `zod` → validates form input (same as backend — "is this a real email?")
- `socket.io-client` → the browser side of the live update connection

---

### Step 23 — Set up the Vite proxy (vite.config.ts)

The frontend runs on port 5173. The backend runs on port 5000. Normally the browser would block requests between different ports (CORS). The proxy fixes this by making the frontend forward `/api` requests to the backend.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

Now any call to `/api/anything` from the frontend automatically goes to `http://localhost:5000/api/anything`. No CORS issues.

---

### Step 24 — Fix TypeScript for Vite (tsconfig.json)

Open `frontend/tsconfig.json` and make sure `compilerOptions` includes `"types": ["vite/client"]`. This lets TypeScript know about `import.meta.env`.

---

### Step 25 — Create the files inside frontend/src/

You need to create these files in order:

#### 1. frontend/src/types/index.ts

Defines the shape of data the frontend works with.

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor';
}

export interface AuthState {
  token: string;
  user: User;
}

export interface Appointment {
  _id: string;
  patientName: string;
  doctorId: string;
  date: string;
  startTime: string;
  duration: number;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
}

export interface BookingFormValues {
  patientName: string;
  doctorId: string;
  date: string;
  startTime: string;
  duration: 15 | 30 | 45 | 60;
}
```

---

#### 2. frontend/src/lib/auth.ts

Saves and loads login state from the browser's localStorage (so you stay logged in after refreshing).

```typescript
import { AuthState } from '../types';
const KEY = 'clinicflow_auth';
export const saveAuth = (auth: AuthState) => localStorage.setItem(KEY, JSON.stringify(auth));
export const loadAuth = (): AuthState | null => {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthState) : null;
};
export const clearAuth = () => localStorage.removeItem(KEY);
```

---

#### 3. frontend/src/lib/api.ts

All HTTP calls to the backend live here. Each function calls a backend route and returns the response data.

```typescript
const BASE = '/api';

async function request<T>(method: string, path: string, body?: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>('GET', path, undefined, token),
  post: <T>(path: string, body: unknown, token?: string | null) => request<T>('POST', path, body, token),
};
```

---

#### 4. frontend/src/hooks/useAuth.ts

Custom React hook that manages login state across the whole app.

```typescript
import { useState } from 'react';
import { AuthState } from '../types';
import { saveAuth, loadAuth, clearAuth } from '../lib/auth';

export const useAuth = () => {
  const [auth, setAuthState] = useState<AuthState | null>(loadAuth);

  const setAuth = (next: AuthState) => {
    saveAuth(next);
    setAuthState(next);
  };

  const logout = () => {
    clearAuth();
    setAuthState(null);
  };

  return { auth, setAuth, logout };
};
```

---

#### 5. frontend/src/hooks/useSocket.ts

Connects to the Socket.IO server. First asks the backend for the socket URL (`/api/config`), falls back to the env var or hardcoded value if that fails.

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Appointment } from '../types';

const FALLBACK_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

async function fetchSocketUrl(): Promise<string> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('failed');
    const data = await res.json() as { socketUrl?: string };
    return data.socketUrl || FALLBACK_URL;
  } catch {
    return FALLBACK_URL;
  }
}

export const useSocket = (token: string | null, onNewAppointment: (a: Appointment) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    let socket: Socket;
    let cancelled = false;

    fetchSocketUrl().then((url) => {
      if (cancelled) return;
      socket = io(url, { auth: { token } });
      socketRef.current = socket;
      socket.on('appointment:new', (appointment: Appointment) => {
        onNewAppointment(appointment);
      });
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [token, onNewAppointment]);

  return socketRef;
};
```

---

#### 6. frontend/src/components/AppointmentCard.tsx

One single appointment displayed as a card.

```typescript
import { Appointment } from '../types';

interface Props {
  appointment: Appointment;
  isNew?: boolean;
}

export default function AppointmentCard({ appointment, isNew }: Props) {
  const endMinutes =
    parseInt(appointment.startTime.split(':')[0]) * 60 +
    parseInt(appointment.startTime.split(':')[1]) +
    appointment.duration;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

  return (
    <div style={{
      background: isNew ? '#e8f0fe' : '#fff',
      border: isNew ? '2px solid #1a73e8' : '1px solid #e0e8f5',
      borderRadius: 10,
      padding: '0.9rem 1.1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s',
    }}>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#222' }}>
          {appointment.patientName}
          {isNew && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#1a73e8', color: '#fff', padding: '2px 8px', borderRadius: 10 }}>NEW</span>}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#666' }}>
          {appointment.startTime} – {endTime} · {appointment.duration} min
        </p>
      </div>
    </div>
  );
}
```

---

#### 7. Create LoginPage, AdminPage, DoctorDashboard

These are the three screens of the app. See the actual source files in `frontend/src/pages/` — they are already built.

---

#### 8. frontend/src/App.tsx

The router — decides which page to show based on who is logged in.

```typescript
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DoctorDashboard from './pages/DoctorDashboard';

export default function App() {
  const { auth, setAuth, logout } = useAuth();

  if (!auth) return <LoginPage onLogin={setAuth} />;
  if (auth.user.role === 'admin') return <AdminPage auth={auth} onLogout={logout} />;
  return <DoctorDashboard auth={auth} onLogout={logout} />;
}
```

---

## PHASE 5 — Connect to MongoDB (what MongoDB actually does)

### What is MongoDB?

Think of MongoDB as a giant filing cabinet. Instead of tables with rows and columns (like Excel), it stores **documents** (like JSON objects).

- Each "drawer" is a **database** (we use one called `clinicflow`)
- Each "folder" inside a drawer is a **collection** (we have `users` and `appointments`)
- Each "sheet of paper" inside a folder is a **document** (one user, one appointment)

Example of one appointment document in MongoDB:
```json
{
  "_id": "664abc123...",
  "patientName": "Jane Doe",
  "doctorId": "664def456...",
  "date": "2026-04-25",
  "startTime": "10:00",
  "duration": 30,
  "createdAt": "2026-04-25T06:30:00.000Z"
}
```

### How does Mongoose connect to MongoDB?

In `index.ts`, this line connects the app to the database:
```typescript
mongoose.connect('mongodb://localhost:27017/clinicflow')
```

- `localhost:27017` = MongoDB is running on your computer, port 27017 (default)
- `clinicflow` = the database name. MongoDB creates it automatically when you first save something.

### How to see your data

1. Open **MongoDB Compass**
2. Connect to `mongodb://localhost:27017`
3. Click **clinicflow** in the left sidebar
4. Click **users** to see all accounts
5. Click **appointments** to see all bookings
6. Click any document to expand it and see all its fields

---

## PHASE 6 — Running the app

### Every single time you want to use the app:

**Step A — Make sure MongoDB is running:**
```bash
sc query MongoDB
```
If STOPPED: `net start MongoDB`

**Step B — Start backend (Terminal 1):**
```bash
cd c:\Users\YourName\clinicflows\backend
npm run dev
```
Wait for: `MongoDB connected` and `Server running on port 5000`

**Step C — Start frontend (Terminal 2 — new window!):**
```bash
cd c:\Users\YourName\clinicflows\frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

**Step D — Open browser:**
Go to: `http://localhost:5173`

### First time only:

After installing, before starting, run:
```bash
cd c:\Users\YourName\clinicflows\backend
npm run seed
```
This creates the starter accounts (admin + 2 doctors) in MongoDB.

---

## PHASE 7 — How the live update works (the WebSocket magic)

Here is exactly what happens when admin books an appointment and it appears on the doctor's screen instantly:

```
1. Admin fills in the booking form and clicks "Book Appointment"
2. Frontend sends: POST /api/appointments (HTTP request)
3. Backend saves the appointment in MongoDB
4. Backend says: io.to('doctor:abc123').emit('appointment:new', {...})
   - "doctor:abc123" is a special room only that doctor's browser is connected to
5. Doctor's browser is already connected via WebSocket (socket.io-client)
   - When it first loaded, useSocket.ts called fetchSocketUrl() → GET /api/config
   - Got back: { socketUrl: "http://localhost:5000" }
   - Connected to that URL with their JWT token
   - Joined the room "doctor:abc123" automatically (backend socket/index.ts does this)
6. Socket.IO delivers 'appointment:new' event to that browser tab instantly
7. useSocket hook calls onNewAppointment(appointment)
8. DoctorDashboard adds it to the list, highlights it blue for 5 seconds
```

No page refresh. No polling every few seconds. True real-time.

---

## Common Problems

| Problem | Fix |
|---------|-----|
| `npm run dev` says "Cannot find module" | Run `npm install` first in that folder |
| "MongoDB connection error" | MongoDB is not running. Run `net start MongoDB` |
| Login says "Invalid email or password" | Run `npm run seed` in the backend folder |
| Doctor dashboard shows nothing | Check that the date is today or future. Check MongoDB Compass → appointments collection |
| Frontend shows blank page | Make sure backend is running first (Terminal 1) |
| "Port 5000 already in use" | Run `npx kill-port 5000` then restart backend |
| Changes not showing in browser | Press `Ctrl + Shift + R` (hard refresh) |

---

*This document covers the entire app build from scratch.*  
*For daily usage instructions, see SETUP_GUIDE.md*
