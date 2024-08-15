import { useState, useEffect } from 'react';
import { api } from "@/service/restful";
import { Project } from '../../types';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.getProjects();
      if (response.status === 200 && Array.isArray(response.data)) {
        setProjects(response.data);
        if (!selectedProject && response.data.length > 0) {
          setSelectedProject(response.data[0].id as string);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleAddProject = async (projectName: string, closeModal: () => void) => {
    if (!projectName.trim()) {
      console.error("Project name cannot be empty");
      return;
    }

    try {
      const response = await api.createProject({ name: projectName, description: "" });
      if (response.status === 201 && response.data) {
        setProjects(prevProjects => [...prevProjects, response.data]);
        setSelectedProject(response.data.id);
        closeModal();
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  };

  return { projects, selectedProject, setSelectedProject, handleAddProject };
};