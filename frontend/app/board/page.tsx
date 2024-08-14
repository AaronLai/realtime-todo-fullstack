"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Card, CardBody, Button, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
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
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

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

  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      console.error("Project name cannot be empty");
      return;
    }

    try {
      const response = await api.createProject({ name: newProjectName , description: ""});
      if (response.status === 201 && response.data) {
        setProjects(prevProjects => [...prevProjects, response.data]);
        setSelectedProject(response.data.id);
        setIsNewProjectModalOpen(false);
        setNewProjectName("");
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome to ToDo List!</h2>
      <div className="flex justify-between items-center mb-4">
        <Tabs
          variant="underlined"
          aria-label="Projects"
          selectedKey={selectedProject}
          onSelectionChange={(key) => setSelectedProject(key as string)}
          className="flex-grow"
        >
          {projects.map((project) => (
            <Tab key={project.id} title={project.name}>
              {/* Tab content */}
            </Tab>
          ))}
        </Tabs>
        <Button
          color="primary"
          endContent={<PlusIcon size={16} />}
          onClick={() => setIsNewProjectModalOpen(true)}
          className="ml-4"
        >
          New Project
        </Button>
      </div>
      {selectedProject && (
        <div className="mt-4 w-full">
          <h3 className="text-xl font-semibold mb-4">{projects.find(p => p.id === selectedProject)?.name}</h3>
          {tasks.length === 0 ? (
            <p className="mt-4">No tasks yet. Add some above!</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {tasks.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
              ))}
            </div>
          )}
          <div className="mt-8">
            <AddTaskForm onAddTask={handleAddTask} />
          </div>
        </div>
      )}
      <Modal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalBody>
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleAddProject}>
              Create Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BoardPage;