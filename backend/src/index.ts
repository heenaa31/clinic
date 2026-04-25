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

// Returns the Socket.IO server URL so the frontend can discover it dynamically
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
