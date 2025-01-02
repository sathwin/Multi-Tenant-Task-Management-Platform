import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - always succeeds for demo
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        name: 'Demo User',
        email: email,
        avatar: null,
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Mock registration - always succeeds for demo
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        name: name,
        email: email,
        avatar: null,
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    },
  });
});

// Mock workspace endpoints
app.get('/api/workspaces', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'My Workspace',
        slug: 'my-workspace',
        plan: 'FREE',
        role: 'OWNER',
        permissions: ['read', 'write', 'admin'],
        isActive: true,
        settings: {},
        ownerId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  });
});

// Mock dashboard metrics
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalTasks: 247,
      completedTasks: 189,
      overdueTasks: 12,
      inProgressTasks: 46,
      totalProjects: 8,
      activeProjects: 6,
      teamMembers: 12,
      avgCompletionTime: 2.5,
      productivityScore: 87,
      taskCompletionRate: 76.5,
    },
  });
});

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
    console.log(`User ${socket.id} joined workspace ${workspaceId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 GraphQL Playground available at http://localhost:${PORT}/graphql`);
}); 