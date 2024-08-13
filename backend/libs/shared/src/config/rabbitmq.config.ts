export const rabbitmqConfig = {
    exchanges: {
      projectExchange: 'project_exchange',
      userExchange: 'user_exchange',
    },
    queues: {
      projectQueue: 'project_queue',
      userQueue: 'user_queue',
    },
    routingKeys: {
      projectRouting: 'project_routing',
      userRouting: 'user_routing',
    },
  };