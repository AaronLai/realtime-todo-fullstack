import io from 'socket.io-client';
import { setCookie, getCookie } from 'cookies-next';
const PROJECT_API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL || 'http://localhost:4002';

const token = getCookie('authToken');

export const createSocket = () => {
    return  io(PROJECT_API_BASE_URL, {
      auth: {
        token: `${token}`
      }
    });
  };