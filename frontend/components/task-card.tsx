import React, { useState } from 'react';
import { Card, CardBody, CardFooter, Chip, Textarea, Progress, Input } from "@nextui-org/react";
import { CalendarIcon, ClockIcon, XIcon, CheckIcon } from 'lucide-react';
import { Task } from '../types';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";

interface TaskCardProps {
    task: Task;
    onTaskUpdate: (taskId: string, updateData: Partial<Task>) => void;
    onTaskDelete: (taskId: string) => void;

}

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type TaskPriority = "Low" | "Medium" | "High";
type TaskStatus = "Todo" | "In Progress" | "Done";

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate, onTaskDelete }) => {
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState(task.description || '');

    const handleDescriptionChange = (text: string) => {
        setTempDescription(text);
        if (!isEditingDescription) {
            setIsEditingDescription(true);
        }
    };

    const handleConfirmDescription = () => {
        onTaskUpdate(task.id as string, { description: tempDescription });
        setIsEditingDescription(false);
    };

    const handleCancelDescription = () => {
        setTempDescription(task.description || '');
        setIsEditingDescription(false);
    };

    const getStatusColor = (status: string | undefined): ChipColor => {
        switch (status) {
            case 'Todo': return "secondary";
            case 'In Progress': return "primary";
            case 'Done': return "success";
            default: return "default";
        }
    };

    const getPriorityColor = (priority: string | undefined): ChipColor => {
        switch (priority) {
            case 'Low': return "default";
            case 'Medium': return "warning";
            case 'High': return "danger";
            default: return "default";
        }
    };

    const getProgressValue = (status: string | undefined): number => {
        switch (status) {
            case 'Todo': return 0;
            case 'In Progress': return 50;
            case 'Done': return 100;
            default: return 0;
        }
    };

    const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onTaskUpdate(task.id as string, { dueDate: event.target.value });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        // Get the time zone offset in minutes
        const offsetMinutes = now.getTimezoneOffset();

        // Convert offset to milliseconds and adjust the date
        date.setTime(date.getTime() - offsetMinutes * 60 * 1000);

        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
        return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onTaskDelete(task.id as string);
        }
    };

    const cardColor = getStatusColor(task.status);
    const priorityColor = getPriorityColor(task.priority);

    return (
        <div className="relative w-80">
            <Card
                className="w-full hover:scale-105 transition-transform duration-200"
                shadow="sm"
            >
                <CardBody className="gap-3 p-4">
                    <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold">{task.name}</h4>
                        <Dropdown>
                            <DropdownTrigger>
                                <Chip color={priorityColor} size="sm" variant="flat" className="cursor-pointer">
                                    {task.priority}
                                </Chip>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Task Priority"
                                onAction={(key) => onTaskUpdate(task.id as string, { priority: key as TaskPriority })}
                            >
                                <DropdownItem key="Low">Low</DropdownItem>
                                <DropdownItem key="Medium">Medium</DropdownItem>
                                <DropdownItem key="High">High</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>

                    <Progress
                        value={getProgressValue(task.status)}
                        color={cardColor}
                        className="mt-2"
                        size="sm"
                    />

                    <div className="flex items-center text-sm text-default-500 mt-2">
                        <CalendarIcon size={16} className="mr-2" />
                        <Input
                            type="datetime-local"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
                            onChange={handleDueDateChange}
                            className="w-full"
                        />
                    </div>

                    <div className="relative">
                        <Textarea
                            placeholder="Enter description"
                            value={tempDescription}
                            onValueChange={handleDescriptionChange}
                            className="w-full"
                            minRows={2}
                            maxRows={4}
                            variant="bordered"
                        />
                        {isEditingDescription && (
                            <div className="absolute bottom-2 right-2 flex space-x-2">
                                <Button
                                    size="sm"
                                    color="success"
                                    isIconOnly
                                    variant="bordered"
                                    onClick={handleConfirmDescription}
                                >
                                    <CheckIcon size={16} />
                                </Button>
                                <Button
                                    size="sm"
                                    color="danger"
                                    isIconOnly
                                    variant="bordered"
                                    onClick={handleCancelDescription}
                                >
                                    <XIcon size={16} />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardBody>

                <CardFooter className="flex justify-between items-center">
                    <div className="text-xs text-default-400 flex items-center">
                        <ClockIcon size={14} className="mr-1" />
                        <span>
                            Updated {formatTimeAgo(task.updatedAt ?? new Date().toISOString())}
                        </span>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                color={cardColor}
                                variant="bordered"
                                size="sm"
                            >
                                {task.status}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Task Status"
                            color={cardColor}
                            variant="bordered"
                            onAction={(key) => onTaskUpdate(task.id as string, { status: key as TaskStatus })}
                        >
                            <DropdownItem key="Todo">To Do</DropdownItem>
                            <DropdownItem key="In Progress">In Progress</DropdownItem>
                            <DropdownItem key="Done">Done</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </CardFooter>
            </Card>
            <Button
                isIconOnly
                color="danger"
                variant="solid"
                size="sm"
                className="absolute -top-4 -right-4 z-10 rounded-full"
                onClick={handleDelete}
            >
                <XIcon size={16} />
            </Button>
        </div>
    );
};

export default TaskCard;