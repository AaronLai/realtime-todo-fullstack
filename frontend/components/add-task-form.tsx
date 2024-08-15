import React, { useState } from 'react';
import { Input, Button, Textarea, Select, SelectItem, Chip } from "@nextui-org/react";
import { Task } from '../types';
import { format, addHours } from 'date-fns';

const priorities = ["Low", "Medium", "High"] as const;

interface AddTaskFormProps {
  onAddTask: (task: Task) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [task, setTask] = useState<Task>({
    name: '',
    description: '',
    dueDate: format(addHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm:ss"),
    tags: [], // no time to handle tags
    priority: 'Low',  // default priority to 'Low'
    status: 'Todo'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(task);
    setTask({
      name: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      tags: [],
      priority: 'Low',
      status: 'Todo'
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
            label="Due Date and Time"
            name="dueDate"
            type="datetime-local"
            value={task.dueDate}
            onChange={handleChange}
            size="sm"
            className="flex-grow"
          />
          <Select
            label="Priority"
            name="priority"
            defaultSelectedKeys={[task.priority]}
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
      <div className="grid grid-cols-1 gap-4">
        <Textarea
          label="Description"
          name="description"
          value={task.description}
          onChange={handleChange}
          size="sm"
          rows={3}
        />
      </div>
      <Button type="submit" color="primary" className="w-full">
        Add Task
      </Button>
    </form>
  );
};

export default AddTaskForm;
