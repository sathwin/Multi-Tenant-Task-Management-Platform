import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Header } from './components/layout/header';
import { Dashboard } from './pages/dashboard';
import { ProjectsPage } from './pages/projects';
import { TasksPage } from './pages/tasks';

// Temporary mock data for testing
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  createdAt: new Date().toISOString(),
};

const mockWorkspace = {
  id: '1',
  name: 'My Workspace',
  slug: 'my-workspace',
  plan: 'FREE' as const,
  role: 'OWNER' as const,
  permissions: ['read', 'write', 'admin'],
  isActive: true,
  settings: {},
  ownerId: '1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Layout component for workspace pages
function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// Simple auth store mock
const useAuthStore = () => ({
  user: mockUser,
  isAuthenticated: true,
  logout: () => console.log('Logout clicked'),
});

const useWorkspaceStore = () => ({
  selectedWorkspace: mockWorkspace,
  workspaces: [mockWorkspace],
});

// Export the mock stores for other components to use
(window as any).__mockStores = {
  useAuthStore,
  useWorkspaceStore,
};

// Simple placeholder component with beautiful styling
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="glass-effect rounded-2xl p-12 hover-lift"
      >
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-6 float-animation">
            <span className="text-2xl font-bold text-white">✨</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8">This amazing feature is coming soon</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium"
        >
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Building something incredible
        </motion.div>
      </motion.div>
    </div>
  </div>
);

// Main App component
export default function App() {
  // Dispatch app loaded event when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('app-loaded'));
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Direct route to dashboard for testing */}
            <Route
              path="/"
              element={
                <WorkspaceLayout>
                  <Dashboard />
                </WorkspaceLayout>
              }
            />
            
            {/* Main navigation routes */}
            <Route
              path="/projects"
              element={
                <WorkspaceLayout>
                  <ProjectsPage />
                </WorkspaceLayout>
              }
            />
            
            <Route
              path="/tasks"
              element={
                <WorkspaceLayout>
                  <TasksPage />
                </WorkspaceLayout>
              }
            />
            
            <Route
              path="/team"
              element={
                <WorkspaceLayout>
                  <PlaceholderPage title="Team Management" />
                </WorkspaceLayout>
              }
            />
            
            {/* Workspace routes */}
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="team" element={<PlaceholderPage title="Team Management" />} />
                    <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
                    <Route path="settings" element={<PlaceholderPage title="Settings" />} />
                  </Routes>
                </WorkspaceLayout>
              }
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
} 