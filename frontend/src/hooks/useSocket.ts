import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Appointment } from '../types';

export const useSocket = (token: string | null, onNewAppointment: (a: Appointment) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('appointment:new', (appointment: Appointment) => {
      onNewAppointment(appointment);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onNewAppointment]);

  return socketRef;
};
