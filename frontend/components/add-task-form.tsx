import React, { useState } from 'react';
import { Input, Button, Textarea, Select, SelectItem, Chip } from "@nextui-org/react";
import { format } from 'date-fns';
import { Task } from '../types'; 

const priorities = ["Low", "Medium", "High"] as const;
type Priority = typeof priorities[number];

// export interface Task {
//   name: string;
//   description: string;
//   dueDate: string;
//   tags: string[];
//   priority: Priority;
// }

interface AddTaskFormProps {
  onAddTask: (task: Task) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
    const [task, setTask] = useState<Task>({
        name: '',
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        tags: [],
        priority: 'Medium',
        status: 'Todo'
      });
  const [newTag, setNewTag] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() !== '' && !task.tags.includes(newTag.trim())) {
      setTask(prevTask => ({ ...prevTask, tags: [...prevTask.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTask(prevTask => ({
      ...prevTask,
      tags: prevTask.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(task);
    setTask({
      name: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      tags: [],
      priority: 'Medium'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Task Name"
          name="name"
          value={task.name}
          onChange={handleChange}
          required
          size="sm"
        />
        <div className="flex gap-2">
          <Input
            label="Due Date"
            name="dueDate"
            type="date"
            value={task.dueDate}
            onChange={handleChange}
            size="sm"
            className="flex-grow"
          />
          <Select
            label="Priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            size="sm"
            className="w-1/3"
          >
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Textarea
          label="Description"
          name="description"
          value={task.description}
          onChange={handleChange}
          size="sm"
          rows={3}
        />
        <div>
          <div className="flex gap-2 mb-2">
            <Input
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              size="sm"
              className="flex-grow"
            />
            <Button size="sm" onClick={handleAddTag} type="button">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Chip key={tag} onClose={() => handleRemoveTag(tag)} size="sm">
                {tag}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <Button type="submit" color="primary" className="w-full">
        Add Task
      </Button>
    </form>
  );
};

export default AddTaskForm;