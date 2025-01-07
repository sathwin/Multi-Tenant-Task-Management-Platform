import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Sidebar } from './components/layout/sidebar';
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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

// Simple placeholder component
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex min-h-[400px] items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">This page is coming soon</p>
    </motion.div>
  </div>
);

// Main App component
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
            
            {/* Workspace routes */}
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="team" element={<PlaceholderPage title="Team" />} />
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