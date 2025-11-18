# Vibecoding Dashboard

The frontend control room for the Vibecoding Project Manager system. This is Layer 2 of the system architecture.

## Features

- Visual Kanban board for task management
- Project selection and management
- Drag-and-drop task status updates
- Real-time synchronization with backend API
- Modern, responsive UI with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:4000/api
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`.

## Project Structure

```
vibecoding-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/      # React components
│   ├── services/        # API client
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
└── package.json
```

## Features

- **Project List**: Sidebar showing all projects
- **Kanban Board**: Drag-and-drop task management with 4 columns (Ready, In Progress, Done, Blocked)
- **Create Project**: Modal form to create new projects
- **Task Cards**: Visual representation of tasks with agent assignments

## Development

The app uses:
- React 18 for UI
- Tailwind CSS for styling
- react-beautiful-dnd for drag-and-drop
- Axios for API communication
- Lucide React for icons

