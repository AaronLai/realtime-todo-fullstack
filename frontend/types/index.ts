import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ApiResponse<T> {
  status: number;
  data: T;
  error: string | null;
}

export interface Task {
  id?: string;
  name: string;
  description: string;
  status?: 'Todo' | 'In_Progress' | 'Done';
  dueDate: string;
  tags: string[];
  priority: 'Low' | 'Medium' | 'High';
  createdAt?: string;
  updatedAt?: string;
  projectId?: string;  
  assignedToId?: string;
  createdById?: string;
}