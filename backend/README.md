# Realtime TodoList Microservices App

## Project Overview

This project is a realtime todolist application built using a microservices architecture. It allows users to create projects, manage tasks within those projects, and collaborate in real-time. The application is designed to be scalable, maintainable, and efficient.

## Features

- User authentication (sign in and registration)
- Project management (create, update, delete projects)
- Task management (create, update, delete tasks within projects)
- Real-time updates using WebSockets
- Microservices architecture for improved scalability and maintainability

## Tech Stack

- Backend: NestJS
- Database: Not specified (likely PostgreSQL or MongoDB)
- Message Broker: RabbitMQ
- Real-time Communication: WebSockets (Socket.io)
- API Documentation: Swagger
- Authentication: JWT (JSON Web Tokens)

## Microservices

The application is divided into several microservices:

1. **User Service**: Handles user authentication and registration.
2. **Project Service**: Manages projects and user assignments.
3. **Task Service**: Handles task creation, updates, and deletion.
4. **Gateway Service**: Acts as an API Gateway and handles WebSocket connections.

## API Endpoints

### User Service

- `POST /users/signin`: User sign in
- `POST /users/register`: User registration

### Project Service

- `POST /projects`: Create a new project
- `POST /projects/:id/assign/:role`: Assign a user to a project with a specific role
- `GET /projects/mine`: Get projects for the authenticated user
- `PUT /projects/:id`: Update a project
- `GET /projects/:id/users`: Get users for a specific project

### Task Service

- `POST /tasks`: Create a new task
- `GET /tasks/:id`: Get a task by id
- `PUT /tasks/:id`: Update a task
- `DELETE /tasks/:id`: Delete a task
- `GET /tasks/project/:projectId`: Get tasks by project

## Real-time Features

The application uses WebSockets to provide real-time updates:

- Task updates are broadcast to all users in the project
- Project assignments are communicated in real-time

## Message Queue

RabbitMQ is used for asynchronous communication between microservices:

- Creating default projects for new users
- Handling project assignments
- Broadcasting task updates

## API Documentation

API documentation is available through Swagger. After starting the application, visit `/api` to view the interactive API documentation.

## Environment Variables

To set up the environment variables:

1. Locate the `.env.local.example` file in the project root.
2. Copy the file and rename it to `.env.local`.
3. Update the values in `.env.local` according to your local setup.

Here's an example of the contents of `.env.local`:

```
JWT_SECRET=local-secret-key
USER_SERVICE_PORT=4001
PROJECT_SERVICE_PORT=4002
TASK_SERVICE_PORT=4003
DB_NAME=tododb
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_SYNC=true
RABBITMQ_URL=amqp://localhost:5672
DEFAULT_PROJECT_ROLE=Admin
```

Make sure to adjust these values based on your local development environment.

