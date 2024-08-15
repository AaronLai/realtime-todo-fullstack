"use client";

import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Avatar, Select, SelectItem } from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import { api } from "@/service/restful";
import { Task, User, Project } from '../../types';
import AddTaskForm from '../../components/add-task-form';
import TaskCard from '../../components/task-card';
import toast, { Toaster } from 'react-hot-toast';
import { createSocket } from '@/service/socket';

const BoardPage: React.FC = () => {
  // State declarations
  // Projects: Array of all projects
  const [projects, setProjects] = useState<Project[]>([]);
  // Tasks: Array of tasks for the currently selected project
  const [tasks, setTasks] = useState<Task[]>([]);
  // SelectedProject: ID of the currently selected project
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  // Users: Array of users associated with the current project
  const [users, setUsers] = useState<User[]>([]);
  // Socket: WebSocket connection for real-time updates
  const [socket, setSocket] = useState<any>(null);

  // Modal states
  // Controls visibility of the "New Project" modal
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  // Controls visibility of the "Add User" modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  // Stores the name of the new project being created
  const [newProjectName, setNewProjectName] = useState("");
  // Stores the username of the new user being added
  const [newUsername, setNewUsername] = useState("");
  // Stores the role of the new user being added
  const [newUserRole, setNewUserRole] = useState("");

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Set up socket connection
  useEffect(() => {
    // Create a new socket connection
    const newSocket = createSocket();
    setSocket(newSocket);

    // Set up event listeners for the socket
    newSocket.on('connect', () => console.log('Connected to Socket.IO server'));
    newSocket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));
    newSocket.on('taskUpdate', handleUpdate);
    newSocket.on('projectAssginedUpdate', handleProjectUpdate);

    // Clean up function to remove event listeners and disconnect socket when component unmounts
    return () => {
      newSocket.off('taskUpdate');
      newSocket.off('projectAssignedUpdate');
      newSocket.disconnect();
    };
  }, []);

  // Join/leave project room when selectedProject changes
  useEffect(() => {
    if (socket && selectedProject) {
      // Join the room for the selected project
      socket.emit('joinProject', selectedProject);
      // Return a cleanup function to leave the room when the project changes or component unmounts
      return () => socket.emit('leaveProject', selectedProject);
    }
  }, [socket, selectedProject]);

  // Fetch tasks and users when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
      fetchProjectUsers(selectedProject);
    }
  }, [selectedProject]);

  // Socket event handlers
  // Handles updates for project assignments
  const handleProjectUpdate = (update: any) => {
    fetchProjects(); // Refetch projects to get the latest data
    toast.success(`A new TodoList is shared with you!`);
  };

  // Handles various types of task updates
  const handleUpdate = (update: any) => {
    switch (update.type) {
      case 'taskUpdate':
        // Update an existing task
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === update.data.taskId ? { ...task, ...update.data.update } : task
        ));
        toast.success(`Task "${update.data.update.name}" updated!`);
        break;
      case 'taskAdded':
        // Add a new task
        setTasks(prevTasks => [...prevTasks, update.data.update]);
        toast.success(`New task "${update.data.update.name}" added!`);
        break;
      case 'taskDelete':
        // Remove a deleted task
        setTasks(prevTasks => prevTasks.filter(task => task.id !== update.data.taskId));
        toast.success(`Task deleted successfully!`);
        break;
      default:
        console.log('Unhandled update type:', update.type);
    }
  };

  // API calls
  // Fetches all projects for the current user
  const fetchProjects = async () => {
    try {
      const response = await api.getProjects();
      if (response.status === 200 && Array.isArray(response.data)) {
        setProjects(response.data);
        // If there's no selected project and we have projects, select the first one
        if (response.data.length > 0 && !selectedProject) {
          setSelectedProject(response.data[0].id as string);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects. Please try again.");
    }
  };

  // Fetches tasks for a specific project
  const fetchTasks = async (projectId: string) => {
    try {
      const response = await api.getTasksByProjectId(projectId);
      if (response.status === 200 && Array.isArray(response.data)) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks. Please try again.");
    }
  };

  // Fetches users associated with a specific project
  const fetchProjectUsers = async (projectId: string) => {
    try {
      const response = await api.getProjectUsers(projectId);
      if (response.status === 200 && Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project users:", error);
      toast.error("Failed to load project users. Please try again.");
    }
  };

  // Task handlers
  // Adds a new task to the current project
  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    if (!selectedProject) {
      console.error("No project selected");
      toast.error("Please select a project before adding a task.");
      return;
    }
    try {
      const taskWithProject = { ...newTask, projectId: selectedProject };
      await api.createTask(taskWithProject);
      // Note: We don't update the local state here because the socket will handle that
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Failed to add task. Please try again.");
    }
  };

  // Deletes a task
  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await api.deleteTask(taskId);
      if (response.status === 200) {
        // Note: We don't update the local state here because the socket will handle that
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  // Updates an existing task
  const handleTaskUpdate = async (taskId: string, updateData: Partial<Task>) => {
    try {
      const response = await api.updateTask(taskId, updateData);
      if (response.status === 200 && response.data) {
        // Note: We don't update the local state here because the socket will handle that
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  // Project and user handlers
  // Adds a new project
  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      console.error("Project name cannot be empty");
      toast.error("Project name cannot be empty.");
      return;
    }
    try {
      const response = await api.createProject({ name: newProjectName, description: "" });
      if (response.status === 201 && response.data) {
        setProjects(prevProjects => [...prevProjects, response.data]);
        setSelectedProject(response.data.id);
        setIsNewProjectModalOpen(false);
        setNewProjectName("");
        toast.success("New project created successfully!");
      }
    } catch (error) {
      console.error("Failed to add project:", error);
      toast.error("Failed to create new project. Please try again.");
    }
  };

  // Adds a new user to the current project
  const handleAddUser = async () => {
    if (!newUsername.trim() || !newUserRole || !selectedProject) {
      console.error("Username, role, and selected project are required");
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const response = await api.assignRoleToUser(selectedProject, newUserRole, newUsername.trim());
      if (response.status === 200) {
        setUsers([...users, { id: (users.length + 1).toString(), username: newUsername.trim() }]);
        setNewUsername("");
        setNewUserRole("");
        setIsAddUserModalOpen(false);
        toast.success("New user added successfully!");
      }
    } catch (error) {
      console.error("Failed to add user or assign role:", error);
      toast.error("Failed to add new user. Please try again.");
    }
  };

  // UI Components
  // Renders a list of user avatars with an "add user" button
  const AvatarList: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="flex gap-3 items-center mb-8">
      {users.map((user) => (
        <Avatar key={user.id} name={user.username} isBordered />
      ))}
      <Button
        isIconOnly
        color="primary"
        className="text-default-500"
        radius="full"
        size="md"
        onClick={() => setIsAddUserModalOpen(true)}
        endContent={<PlusIcon size={16} color="white" />}
      />
    </div>
  );

  // Render
  return (
    <div className="w-full p-4">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Welcome to ToDo List!</h2>
      
      {/* Project tabs and new project button */}
      <div className="flex justify-between items-center mb-4">
        <Tabs
          variant="underlined"
          aria-label="Projects"
          selectedKey={selectedProject}
          onSelectionChange={(key) => setSelectedProject(key as string)}
          className="flex-grow"
        >
          {projects.map((project) => (
            <Tab key={project.id} title={project.name} />
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

      {/* Project content */}
      {selectedProject && (
        <div className="mt-4 w-full">
          <h3 className="text-xl font-semibold mb-4">{projects.find(p => p.id === selectedProject)?.name}</h3>
          <AvatarList users={users} />

          {/* Task list */}
          {tasks.length === 0 ? (
            <p className="mt-4">No tasks yet. Add some above!</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {tasks.map((task: Task) => (
                <TaskCard
                  key={task.id + task.description}
                  task={task}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
              ))}
            </div>
          )}

          {/* Add task form */}
          <div className="mt-8">
            <AddTaskForm onAddTask={handleAddTask} />
          </div>
        </div>
      )}

      {/* New Project Modal */}
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

      {/* Add User Modal */}
      <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalBody>
            <Input
              label="Username"
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mb-4"
            />
            <Select
              label="Role"
              placeholder="Select a role"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
            >
              {["Admin", "Member", "Viewer"].map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleAddUser}>
              Add User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BoardPage;