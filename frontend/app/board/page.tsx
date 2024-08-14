"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Card, CardBody, Button, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Avatar, Select, SelectItem } from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import { api } from "@/service/restful";
import { Task, User } from '../../types';
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
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [newUserRole, setNewUserRole] = useState("");


  useEffect(() => {
    fetchProjects();
  }, []);



  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
      fetchProjectUsers(selectedProject);

    }
  }, [selectedProject]);

  const fetchProjectUsers = async (projectId: string) => {
    try {
      const response = await api.getProjectUsers(projectId);
      if (response.status === 200 && Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project users:", error);
    }
  };

  
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

  // New component for avatar list
  const AvatarList: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="flex gap-3 items-center mb-8">
      {users.map((user) => (
        <Avatar
          isBordered
          key={user.id}
          name={user.username}
        />
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



  const handleAddUser = async () => {
    if (!newUsername.trim() || !newUserRole || !selectedProject) {
      console.error("Username, role, and selected project are required");
      return;
    }
  
    try {
      // First, create the user (you might need to adjust this part based on your actual user creation API)
      const newUser: User = {
        id: (users.length + 1).toString(),
        username: newUsername.trim()
      };
  
      // Then, assign the role to the user
      const response = await api.assignRoleToUser(selectedProject, newUserRole, newUsername.trim());
  
      if (response.status === 200) {
        setUsers([...users, newUser]);
        setNewUsername("");
        setNewUserRole("");
        setIsAddUserModalOpen(false);
        console.log(`User ${newUsername} added with role ${newUserRole} to project ${selectedProject}`);
      } else {
        console.error('Failed to assign role to user:', response.error);
      }
    } catch (error) {
      console.error("Failed to add user or assign role:", error);
    }
  };
  const roles = ["Admin", "Member", "Viewer"];


  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      console.error("Project name cannot be empty");
      return;
    }

    try {
      const response = await api.createProject({ name: newProjectName, description: "" });
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
          <AvatarList users={users} />


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
              {roles.map((role) => (
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