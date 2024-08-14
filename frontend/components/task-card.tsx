import React from 'react';
import { Card, CardBody, CardFooter, Chip, Textarea, Progress } from "@nextui-org/react";
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
}

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const getStatusColor = (status: string | undefined): ChipColor => {
        switch (status) {
          case 'To Do': return "warning";
          case 'In Progress': return "primary";
          case 'Done': return "success";
          default: return "default";
        }
    };

    const getProgressValue = (status: string | undefined): number => {
        switch (status) {
          case 'To Do': return 0;
          case 'In Progress': return 50;
          case 'Done': return 100;
          default: return 0;
        }
    };

    const cardColor = getStatusColor(task.status);

    return (
        <Card 
            className="w-80 hover:scale-105 transition-transform duration-200"
            shadow="sm"
        >
            <CardBody className="gap-3 p-4">
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold">{task.name}</h4>
                    <Chip color={cardColor} size="sm" variant="flat">
                        {task.status}
                    </Chip>
                </div>
                
                <Progress 
                    value={getProgressValue(task.status)} 
                    color={cardColor}
                    className="mt-2"
                    size="sm"
                />
                
                <div className="flex items-center text-sm text-default-500 mt-2">
                    <CalendarIcon size={16} className="mr-2" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>

                <Textarea
                    placeholder="No description available"
                    value={task.description || ''}
                    isReadOnly
                    className="w-full"
                    minRows={2}
                    maxRows={4}
                    variant="bordered"
                />
            </CardBody>

            <CardFooter className="text-xs text-default-400">
                <div className="flex items-center">
                    <ClockIcon size={14} className="mr-1" />
                    <span>Updated {new Date().toLocaleDateString()}</span>
                </div>
            </CardFooter>
        </Card>
    );
};

export default TaskCard;