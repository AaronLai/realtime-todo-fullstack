// backend/libs/shared/src/config/rabbitmq.config.ts

export const rabbitmqConfig = {
  exchanges: {
    projectExchange: 'project_exchange',
    userExchange: 'user_exchange',
    taskExchange: 'task_exchange',  // Added task exchange
  },
  queues: {
    projectQueue: 'project_queue',
    userQueue: 'user_queue',
    taskQueue: 'task_queue',  // Added task queue
  },
  routingKeys: {
    projectRouting: 'project_routing',
    userRouting: 'user_routing',
    taskRouting: 'task_routing',  // Added task routing key
  },
};
