import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const joinExpertRoom = (expertId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-expert-room', expertId);
    }
  };

  const leaveExpertRoom = (expertId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-expert-room', expertId);
    }
  };

  const onSlotBooked = (cb) => {
    socketRef.current?.on('slot-booked', cb);
    return () => socketRef.current?.off('slot-booked', cb);
  };

  const onSlotFreed = (cb) => {
    socketRef.current?.on('slot-freed', cb);
    return () => socketRef.current?.off('slot-freed', cb);
  };

  return (
    <SocketContext.Provider value={{ connected, joinExpertRoom, leaveExpertRoom, onSlotBooked, onSlotFreed }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
