// SocketProvider.jsx (FIXED)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

const SocketProvider = (props) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔌 Connecting socket...');
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Disconnecting socket');
        newSocket.disconnect();
      };
    } else {
      console.warn('⚠️ No token found - socket not initialized');
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;