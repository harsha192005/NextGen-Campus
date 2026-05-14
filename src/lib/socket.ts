import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    socket = io(apiUrl.replace('/api', ''), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }

  return socket;
};
