import { io } from 'socket.io-client';
import { SERVER_URL } from './api';

/**
 * Creates an authenticated Socket.IO connection.
 * The JWT is sent in the handshake and verified by the server.
 */
export const createSocket = (token) =>
  io(SERVER_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
  });
