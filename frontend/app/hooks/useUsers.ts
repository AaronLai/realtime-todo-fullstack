import { useState, useEffect } from 'react';
import { api } from "@/service/restful";
import { User } from '../../types';

export const useUsers = (selectedProject: string | null) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (selectedProject) {
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

  const handleAddUser = async (username: string, role: string, closeModal: () => void) => {
    if (!username.trim() || !role || !selectedProject) {
      console.error("Username, role, and selected project are required");
      return;
    }

    try {
      const response = await api.assignRoleToUser(selectedProject, role, username.trim());

      if (response.status === 200) {
        const newUser: User = {
          id: (users.length + 1).toString(),
          username: username.trim()
        };
        setUsers([...users, newUser]);
        closeModal();
        console.log(`User ${username} added with role ${role} to project ${selectedProject}`);
      } else {
        console.error('Failed to assign role to user:', response.error);
      }
    } catch (error) {
      console.error("Failed to add user or assign role:", error);
    }
  };

  return { users, handleAddUser };
};