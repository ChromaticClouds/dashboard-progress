import { createContext, useContext, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider = ({ children }: React.PropsWithChildren) => {
  const socket = useMemo(() => io(import.meta.env.VITE_SERVER_URL), []);

  useEffect(() => {
    return () => { socket.disconnect(); };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
