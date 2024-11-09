import ioClient from 'socket.io-client';
const BACKEND_URL = 'http://localhost:3000';

const socket = ioClient(BACKEND_URL);

export const io = socket;