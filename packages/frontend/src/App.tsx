import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from './store/auth';
import { useRealtimeStore } from './store/realtime';
import { useWorkspaceStore } from './store/workspace';

// Layouts
import AuthLayout from './layouts/auth-layout';
import DashboardLayout from './layouts/dashboard-layout';
import PublicLayout from './layouts/public-layout';

// Pages
import LandingPage from './pages/landing';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import DashboardPage from './pages/dashboard';
import ProjectsPage from './pages/projects';
import ProjectDetailPage from './pages/projects/[id]';
import TasksPage from './pages/tasks';
import TeamPage from './pages/team';
import SettingsPage from './pages/settings';
import AnalyticsPage from './pages/analytics';
import NotFoundPage from './pages/404';

// Components
import ProtectedRoute from './components/protected-route';
import WorkspaceRedirect from './components/workspace-redirect';
import LoadingScreen from './components/loading-screen';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

function App() {
  const { user, isLoading, checkAuth, logout } = useAuthStore();
  const { connect, disconnect } = useRealtimeStore();
  const { selectedWorkspace } = useWorkspaceStore();

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle realtime connection
  useEffect(() => {
    if (user) {
      connect();
      return () => disconnect();
    }
  }, [user, connect, disconnect]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicLayout>
              <motion.div
                key="landing"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                {user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
              </motion.div>
            </PublicLayout>
          } />

          {/* Authentication routes */}
          <Route path="/auth/*" element={
            <AuthLayout>
              <Routes>
                <Route path="login" element={
                  <motion.div
                    key="login"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    {user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                  </motion.div>
                } />
                <Route path="register" element={
                  <motion.div
                    key="register"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    {user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
                  </motion.div>
                } />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </AuthLayout>
          } />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <WorkspaceRedirect />
            </ProtectedRoute>
          } />

          {/* Workspace routes */}
          <Route path="/w/:workspaceSlug/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route index element={
                    <motion.div
                      key="dashboard"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <DashboardPage />
                    </motion.div>
                  } />
                  
                  <Route path="projects" element={
                    <motion.div
                      key="projects"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ProjectsPage />
                    </motion.div>
                  } />
                  
                  <Route path="projects/:projectId" element={
                    <motion.div
                      key="project-detail"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ProjectDetailPage />
                    </motion.div>
                  } />
                  
                  <Route path="tasks" element={
                    <motion.div
                      key="tasks"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <TasksPage />
                    </motion.div>
                  } />
                  
                  <Route path="team" element={
                    <motion.div
                      key="team"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <TeamPage />
                    </motion.div>
                  } />
                  
                  <Route path="analytics" element={
                    <motion.div
                      key="analytics"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AnalyticsPage />
                    </motion.div>
                  } />
                  
                  <Route path="settings" element={
                    <motion.div
                      key="settings"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <SettingsPage />
                    </motion.div>
                  } />
                  
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App; 