"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Card, CardBody, Button, Textarea } from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import { api } from "@/service/restful";
import { Task } from '../../types';
import AddTaskForm from '../../components/add-task-form';
import TaskCard from '../../components/task-card';

interface Project {
  id: string;
  name: string;
}

const BoardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await api.getProjects();
      if (response.status === 200 && Array.isArray(response.data)) {
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProject(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

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

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome to ToDo List!</h2>
      <Tabs
        aria-label="Projects"
        selectedKey={selectedProject}
        onSelectionChange={(key) => setSelectedProject(key as string)}
        className="w-full"
      >
        {projects.map((project) => (
          <Tab key={project.id} title={project.name} className="w-full">
            <div className="mt-4 w-full">
              <h3 className="text-xl font-semibold mb-4">{project.name}</h3>
              {tasks.length === 0 ? (
                <p className="mt-4">No tasks yet. Add some above!</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {tasks.map((task: Task) => <TaskCard key={task.id} task={task} />)}
                </div>
              )}
              <div className="mt-8">
                <AddTaskForm onAddTask={handleAddTask} />
              </div>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default BoardPage;
