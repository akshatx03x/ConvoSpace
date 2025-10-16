import React, {createContext, useMemo, useContext } from 'react'
import {io} from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket=()=>{
  const socket= useContext(SocketContext);
  return socket;
}

const SocketProvider = (props) => {
  const socket = useMemo(() => io(import.meta.env.VITE_API_BASE_URL, {
    auth: {
      token: localStorage.getItem('token')
    }
  }), [])
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  )
}

export default SocketProvider