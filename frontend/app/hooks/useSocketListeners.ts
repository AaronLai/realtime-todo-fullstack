import { useState, useEffect } from 'react';
import { createSocket } from '@/service/socket';
import toast from 'react-hot-toast';

export const useSocketListeners = (selectedProject: string | null) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    newSocket.on('taskUpdate', handleUpdate);
    newSocket.on('projectAssginedUpdate', handleProjectUpdate);

    return () => {
      newSocket.off('taskUpdate');
      newSocket.off('projectAssignedUpdate');
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && selectedProject) {
      socket.emit('joinProject', selectedProject);

      return () => {
        socket.emit('leaveProject', selectedProject);
      };
    }
  }, [socket, selectedProject]);

  const handleProjectUpdate = (update: any) => {
    console.log('Handling projectAssginedUpdate', update);
    toast.success(`A new TodoList is shared with you!`);
  };

  const handleUpdate = (update: any) => {
    console.log('Received update:', update);

    if (update.type === 'taskUpdate') {
      toast.success(`Task "${update.data.update.name}" updated!`);
    } else if (update.type === 'taskAdded') {
      toast.success(`New task "${update.data.update.name}" added!`);
    } else if (update.type === 'taskDelete') {
      toast.success(`Task deleted successfully!`);
    } else {
      console.log('Unhandled update type:', update.type);
    }
  };

  return socket;
};