# Team-Based Todo List Application

A modern, scalable todo list application designed for team collaboration using cutting-edge technologies.

## Technologies Used

- Frontend: Next.js, NextUI
- Backend: NestJS (Microservices architecture)
- Database: PostgreSQL
- Message Queue: RabbitMQ

## Features

- User authentication and authorization
- Real-time task updates
- Project(todoliat) creation and management
- Task assignment and tracking

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Docker 

# How to Run

## Prerequisites

1. Install Node.js on your machine
2. Install Docker on your machine

## Setup

1. Modify the values in `.env.local.example` file
2. Rename `.env.local.example` to `.env.local`

## Running the Application

1. Run the following command in your terminal:docker compose up --build

## Accessing the Services

Once the application is running, you can access the following services:

- Frontend: [http://localhost:4000](http://localhost:4000)
- User Service: [http://localhost:4001](http://localhost:4001)
- Project Service: [http://localhost:4002](http://localhost:4002)
- Task Service: [http://localhost:4003](http://localhost:4003)

## Swagger Documentation

You can access the Swagger documentation for the services at:

- [http://localhost:4001/api](http://localhost:4001/api)
- [http://localhost:4002/api](http://localhost:4002/api)
- [http://localhost:4003/api](http://localhost:4003/api)
  


## Backend Stucture 

### Key Files and Their Roles

### 1. `controller.ts`
Handles external connections, requests, and responses. This is where the application's endpoints are defined, making it the entry point for processing incoming HTTP requests.

### 2. `service.ts`
Responsible for the business logic within the application. This layer processes data, applies business rules, and interacts with other layers, such as the database, to fulfill requests from the controllers.

### 3. `gateway.ts`
Manages WebSocket connections. This file is crucial for handling real-time communication between the client and server, enabling features like live updates and notifications.

### 4. `spec.ts`
Contains testing cases for the respective module. These files are used for writing unit and integration tests to verify that the application’s code functions as expected.


#### Architecture
[Architecture Diagram](architecture.md)


#### Erdiagram
[Erdiagram ](erdiagram.md)