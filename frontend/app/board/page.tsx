'use client'

import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Avatar, Select, SelectItem } from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import { api } from "@/service/restful";
import { Task, User, Project } from '../../types';
import AddTaskForm from '../../components/add-task-form';
import TaskCard from '../../components/task-card';
import { createSocket } from '@/service/socket';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useSocketListeners } from "../hooks/useSocketListeners";

const BoardPage: React.FC = () => {
  const { projects, selectedProject, setSelectedProject, handleAddProject } = useProjects();
  const { tasks, handleAddTask, handleTaskDelete, handleTaskUpdate } = useTasks(selectedProject);
  const { users, handleAddUser } = useUsers(selectedProject);
  const socket = useSocketListeners(selectedProject);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserRole, setNewUserRole] = useState("");

  const roles = ["Admin", "Member", "Viewer"];

  const AvatarList: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="flex gap-3 items-center mb-8">
      {users.map((user) => (
        <Avatar key={user.id} isBordered name={user.username} />
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

  return (
    <div className="w-full p-4">
      <Toaster position="top-right" />
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

      {selectedProject && (
        <div className="mt-4 w-full">
          <h3 className="text-xl font-semibold mb-4">
            {projects.find(p => p.id === selectedProject)?.name}
          </h3>
          <AvatarList users={users} />

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
            <Button color="primary" onClick={() => handleAddProject(newProjectName, () => setIsNewProjectModalOpen(false))}>
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
            <Button color="primary" onClick={() => handleAddUser(newUsername, newUserRole, () => setIsAddUserModalOpen(false))}>
  Add User
</Button>

          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BoardPage;