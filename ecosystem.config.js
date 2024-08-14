module.exports = {
  apps: [
    {
      name: 'user-service',
      cwd: './backend',
      script: 'yarn',
      args: 'user:start:local',
      watch: false,
      env: {
        NODE_ENV: 'local',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'project-service',
      cwd: './backend',
      script: 'yarn',
      args: 'project:start:local',
      watch: false,
      env: {
        NODE_ENV: 'local',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'task-service',
      cwd: './backend',
      script: 'yarn',
      args: 'task:start:local',
      watch: false,
      env: {
        NODE_ENV: 'local',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'yarn',
      args: 'dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};