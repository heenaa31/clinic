import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Appointment } from '../types';

// Fallback URL used if the API call fails or the env var is not set
const FALLBACK_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Ask the backend what URL to use for the Socket.IO connection.
// This lets us change the socket server address in one place (backend .env)
// without touching the frontend at all.
async function fetchSocketUrl(): Promise<string> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('config endpoint returned an error');
    const data = await res.json() as { socketUrl?: string };
    return data.socketUrl || FALLBACK_URL;
  } catch {
    // If the API is unreachable or returns garbage, use the fallback silently
    return FALLBACK_URL;
  }
}

export const useSocket = (token: string | null, onNewAppointment: (a: Appointment) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    let socket: Socket;
    let cancelled = false; // guard: don't connect if the component unmounted while we were fetching

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
