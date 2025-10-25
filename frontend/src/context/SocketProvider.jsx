import React, {createContext, useMemo, useContext, useEffect, useState } from 'react'
import {io} from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket=()=>{
  const socket= useContext(SocketContext);
  return socket;
}

const SocketProvider = (props) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: {
          token: token
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
