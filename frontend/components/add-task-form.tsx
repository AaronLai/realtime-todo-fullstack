import React, { useState } from 'react';
import { Input, Button, Textarea, Select, SelectItem } from "@nextui-org/react";
import { Task } from '../types';
import { format, addHours } from 'date-fns';

// Define priorities as a const array for type safety and reusability
const priorities = ["Low", "Medium", "High"] as const;
type Priority = typeof priorities[number];

// Define props interface for AddTaskForm
interface AddTaskFormProps {
  onAddTask: (task: Task) => void;
}

/**
 * AddTaskForm Component
 * 
 * This component renders a form for adding new tasks.
 * It uses NextUI components for the form elements and handles form state and submission.
 */
const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  // Initialize task state with default values
  const [task, setTask] = useState<Task>({
    name: '',
    description: '',
    // Set default due date to 24 hours from now
    dueDate: format(addHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm:ss"),
    tags: [], // TODO: Implement tag handling
    priority: 'Low' as Priority,
    status: 'Todo'
  });

  /**
   * Handle input changes
   * This function updates the task state when form inputs change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  /**
   * Handle form submission
   * This function prevents default form submission, calls the onAddTask prop with the current task,
   * and resets the form to its initial state
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(task);
    // Reset form after submission
    setTask({
      name: '',
      description: '',
      dueDate: format(addHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm:ss"),
      tags: [],
      priority: 'Low' as Priority,
      status: 'Todo'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Task Name Input */}
        <Input
          label="Task Name"
          name="name"
          value={task.name}
          onChange={handleChange}
          required
          size="sm"
        />
        <div className="flex gap-2">
          {/* Due Date and Time Input */}
          <Input
            label="Due Date and Time"
            name="dueDate"
            type="datetime-local"
            value={task.dueDate}
            onChange={handleChange}
            size="sm"
            className="flex-grow"
          />
          {/* Priority Select */}
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
      {/* Description Textarea */}
      <Textarea
        label="Description"
        name="description"
        value={task.description}
        onChange={handleChange}
        size="sm"
        rows={3}
      />
      {/* Submit Button */}
      <Button type="submit" color="primary" className="w-full">
        Add Task
      </Button>
    </form>
  );
};

export default AddTaskForm;