import { useState, useEffect } from 'react';
import { createSocket } from '@/service/socket';
import toast from 'react-hot-toast';
import { Task } from '../../types';

export const useSocketListeners = (selectedProject: string | null, fetchProjects: () => void) => {
  const [socket, setSocket] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

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
    fetchProjects();
    toast.success(`A new TodoList is shared with you!`);
  };

  const handleUpdate = (update: any) => {
    console.log('Received update:', update);
    console.log('Received update type:', update.type);

    if (update.type === 'taskUpdate') {
      console.log('Handling taskUpdate');
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === update.data.taskId ? { ...task, ...update.data.update } : task
      ));
      toast.success(`Task "${update.data.update.name}" updated!`);
    } else if (update.type === 'taskAdded') {
      console.log('Handling taskAdded');
      setTasks(prevTasks => [...prevTasks, update.data.update]);
      toast.success(`New task "${update.data.update.name}" added!`);
    } else if (update.type === 'taskDelete') {
      console.log('Handling taskDelete');
      setTasks(prevTasks => prevTasks.filter(task => task.id !== update.data.taskId));
      toast.success(`Task deleted successfully!`);
    } else {
      console.log('Unhandled update type:', update.type);
    }
  };

  return { socket, tasks, setTasks };
};