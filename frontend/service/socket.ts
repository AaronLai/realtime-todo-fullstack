import io from 'socket.io-client';
import { setCookie, getCookie } from 'cookies-next';

const PROJECT_SOCKET_URL = 'http://localhost:4002';
const token = getCookie('authToken');

export const createSocket = () => {
    return  io(PROJECT_SOCKET_URL, {
      auth: {
        token: `${token}`
      }
    });
  };