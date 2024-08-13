module.exports = {
    apps: [
      {
        name: 'user-service',
        script: 'npm',
        args: 'run user:start:local',
        watch: false,
        env: {
          NODE_ENV: 'local',
        },
      },
      {
        name: 'project-service',
        script: 'npm',
        args: 'run project:start:local',
        watch: false,
        env: {
          NODE_ENV: 'local',
        },
      },
      {
        name: 'task-service',
        script: 'npm',
        args: 'run task:start:local',
        watch: false,
        env: {
          NODE_ENV: 'local',
        },
      },
    ],
  };
  