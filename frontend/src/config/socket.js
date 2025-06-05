import { io } from 'socket.io-client';

let socketInstance = null;



export const initializeSocket = (projectId) => {
  if (!projectId) {
    console.error('Project ID is required to initialize socket.');
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      query: { projectId },
      transports: ['websocket'],
      withCredentials: true, 
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });
  }

  return socketInstance;
};
export const recieveMessage =(eventName, cb)=>{
    socketInstance.on(eventName, cb)
}

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.error('Socket not initialized');
    return;
  }
  socketInstance.emit(eventName, data);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
