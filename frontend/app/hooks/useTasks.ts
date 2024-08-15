import { useState, useEffect } from 'react';
import { api } from "@/service/restful";
import { Task } from '../../types';

export const useTasks = (selectedProject: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await api.getTasksByProjectId(projectId);
      if (response.status === 200 && Array.isArray(response.data)) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    if (!selectedProject) {
      console.error("No project selected");
      return;
    }

    try {
      const taskWithProject = { ...newTask, projectId: selectedProject };
      const response = await api.createTask(taskWithProject);

      if (response.status === 201 && response.data) {
        setTasks(prevTasks => [...prevTasks, response.data]);
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await api.deleteTask(taskId);
      if (response.status === 200) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        console.error('Failed to delete task:', response.error);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updateData: Partial<Task>) => {
    try {
      const response = await api.updateTask(taskId, updateData);
      if (response.status === 200 && response.data) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, ...updateData } : task
          )
        );
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return { tasks, handleAddTask, handleTaskDelete, handleTaskUpdate };
};