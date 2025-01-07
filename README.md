# 🚀 Multi-Tenant Task Management Platform

A modern, enterprise-grade SaaS task management platform built with React 18, Node.js, and PostgreSQL. Features real-time collaboration, multi-tenancy, and beautiful UI with glassmorphism design.

## ✨ Features

### 🏢 Multi-Tenancy & Workspace Management
- **Workspace Isolation**: Complete data separation between workspaces
- **Role-Based Access Control**: Owner, Admin, Member, and Viewer roles
- **Team Collaboration**: Invite members with specific permissions
- **Workspace Settings**: Customizable workspace configurations

### 📋 Task Management
- **Kanban Boards**: Drag-and-drop task organization
- **Project Organization**: Group tasks into projects and boards
- **Priority Levels**: High, Medium, Low, and Urgent priorities
- **Due Dates**: Calendar integration and notifications
- **Labels & Categories**: Customizable tagging system
- **File Attachments**: Drag-and-drop file uploads

### 🔄 Real-Time Collaboration
- **Live Updates**: Real-time task moves and status changes
- **User Presence**: See who's online in your workspace
- **Live Comments**: Real-time comment threads
- **Activity Feed**: Live workspace activity stream

### 📊 Analytics & Reporting
- **Productivity Metrics**: Team performance insights
- **Time Tracking**: Built-in timer and reporting
- **Progress Tracking**: Visual progress indicators
- **Custom Reports**: Generate detailed analytics

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Modern glass effects and blur
- **Dark/Light Themes**: System preference detection
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion transitions
- **Micro-interactions**: Hover effects and loading states

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for sessions and optimization
- **API**: GraphQL with Apollo Server
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io for live updates
- **File Storage**: Cloudinary integration
- **Queue**: Bull Queue with Redis

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand + TanStack Query
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Radix UI + Custom components
- **GraphQL Client**: Apollo Client
- **Real-time**: Socket.io-client
- **Charts**: Recharts
- **Date/Time**: Day.js

### DevOps & Infrastructure
- **Build Tool**: Vite for fast development
- **Package Manager**: npm workspaces
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky for pre-commit checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm 9+

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd multi-tenant-task-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp packages/backend/.env.example packages/backend/.env
   
   # Edit the .env file with your database and Redis credentials
   # Required variables:
   # - DATABASE_URL
   # - REDIS_HOST, REDIS_PORT
   # - JWT_SECRET, JWT_REFRESH_SECRET
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed  # Optional: seed with sample data
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API server on http://localhost:4000
   - Frontend React app on http://localhost:3000

## 📁 Project Structure

```
multi-tenant-task-platform/
├── packages/
│   ├── backend/                 # Node.js API server
│   │   ├── src/
│   │   │   ├── config/         # Database, Redis, logging
│   │   │   ├── controllers/    # API controllers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Auth, validation, etc.
│   │   │   ├── graphql/        # GraphQL schema & resolvers
│   │   │   └── utils/          # Helper functions
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── package.json
│   │
│   └── frontend/               # React application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Route components
│       │   ├── layouts/        # Layout components
│       │   ├── store/          # Zustand stores
│       │   ├── hooks/          # Custom React hooks
│       │   ├── utils/          # Helper functions
│       │   ├── apollo/         # GraphQL client setup
│       │   └── styles/         # Global styles
│       └── package.json
│
├── package.json                # Root workspace config
└── README.md
```

## 🧑‍💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend

# Database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Build & Production
npm run build            # Build both packages
npm run type-check       # TypeScript type checking
npm run lint             # Lint all packages

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

### Code Style & Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended rules for React and TypeScript
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Structured commit messages

### Database Schema

The platform uses a comprehensive multi-tenant architecture:

- **Users**: Authentication and profile management
- **Workspaces**: Multi-tenant containers
- **Projects & Boards**: Task organization
- **Tasks**: Core task management
- **Comments**: Threaded discussions
- **Activities**: Audit logging

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Refresh Tokens**: Automatic token rotation
- **Multi-tenant Isolation**: Data separation by workspace
- **Role-based Permissions**: Granular access control
- **Rate Limiting**: API protection
- **Input Validation**: Comprehensive data validation

## 🎨 UI/UX Features

- **Glassmorphism**: Modern glass effects
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: System preference sync
- **Smooth Animations**: Framer Motion powered
- **Accessibility**: WCAG compliant components
- **Performance**: Code splitting and lazy loading

## 📊 Performance Targets

- **Query Response**: <100ms average
- **Page Load**: <2 seconds
- **Real-time Latency**: <50ms for updates
- **Concurrent Users**: 100+ active users
- **Uptime**: 99.9% availability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Prisma** for type-safe database access
- **Zustand** for simple state management

---

Built with ❤️ for modern teams who want beautiful, fast, and reliable task management. 