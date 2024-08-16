# Real-time Todo List Webapp

This is a real-time collaborative todo list application built with Next.js 14 (app directory) and NextUI (v2). It allows users to create projects, manage tasks, and collaborate in real-time with other users.

## Features

- Create and manage multiple projects
- Add, update, and delete tasks in real-time
- Collaborate with other users on projects
- Real-time updates using WebSocket connections
- User authentication and role-based access control

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [NextUI v2](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.IO](https://socket.io/) for real-time communication
- [React Hot Toast](https://react-hot-toast.com/) for notifications

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/realtime-todo-list.git
   cd realtime-todo-list
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   - Locate the `.env.local.example` file in the root directory of the project.
   - Copy this file and rename it to `.env.local`.
   - Open `.env.local` and modify the following variables:
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
     NEXT_PUBLIC_PROJECT_API_BASE_URL=http://localhost:4002
     NEXT_PUBLIC_TASK_API_BASE_URL=http://localhost:4003
     ```
   - Adjust these URLs if your API services are running on different ports or hosts.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   This will start the development server on all network interfaces using Turbo mode.

5. Open `http://localhost:3000` in your browser to see the application.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode on all network interfaces using Turbo mode.
- `npm run build`: Builds the app for production.
- `npm start`: Runs the built app in production mode on all network interfaces.
- `npm test`: Runs the test suite using Jest.
- `npm run lint`: Lints the project files and fixes issues where possible.

## Project Structure

```
realtime-todo-list/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── add-task-form.tsx
│   ├── task-card.tsx
│   └── [other component files]
├── config/
│   └── [configuration files]
├── lib/
│   └── [utility functions]
├── pages/
│   └── [page components]
├── public/
│   └── [static files]
├── service/
│   ├── restful.ts
│   └── socket.ts
├── styles/
│   └── globals.css
├── types/
│   ├── index.ts
│   └── [type definition files]
├── .env.local.example
├── .eslintrc.json
├── next.config.js
├── package.json
├── README.md
```

### Key Directories and Files

- `app/`: Contains the main application files for Next.js 14 app directory structure.
  - `layout.tsx`: The main layout component for the app.
  - `page.tsx`: The main page component.

- `components/`: Houses reusable React components.
  - `add-task-form.tsx`: Component for adding new tasks.
  - `task-card.tsx`: Component for displaying individual tasks.

- `config/`: Contains configuration files for the project.

- `lib/`: Utility functions and helper modules.

- `pages/`: Additional page components (if using a hybrid approach with app directory).

- `public/`: Static files served by Next.js.

- `service/`:
  - `restful.ts`: API service functions for RESTful calls.
  - `socket.ts`: WebSocket service functions for real-time communication.

- `styles/`: CSS files, including global styles.

- `types/`: TypeScript type definitions.

- `.env.local.example`: Example environment variables file.


## Main Components

- `BoardPage`: The main component that renders the todo list interface, located in `app/page.tsx`.
- `AddTaskForm`: Component for adding new tasks, found in `components/add-task-form.tsx`.
- `TaskCard`: Component for displaying and managing individual tasks, located in `components/task-card.tsx`.

## Key Features Implementation

### Real-time Updates
The application uses Socket.IO for real-time communication. The `createSocket` function in `service/socket.ts` establishes the WebSocket connection, and the `BoardPage` component sets up event listeners for various updates.

### Project Management
Users can create new projects and switch between them using the tabs interface in the `BoardPage` component. The `handleAddProject` function manages the creation of new projects.

### Task Management
Tasks can be added, updated, and deleted in real-time. The `AddTaskForm` component handles task creation, while the `TaskCard` component manages individual task updates and deletions.

### User Collaboration
The application supports adding users to projects with different roles. The `handleAddUser` function in `BoardPage` manages this process.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

