import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const initSocket = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      (socket as Socket & { user: JwtPayload }).user = payload;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user;

    if (user.role === 'doctor') {
      socket.join(`doctor:${user.userId}`);
    }

    socket.on('disconnect', () => {
      // Socket.IO handles room cleanup automatically
    });
  });
};
