import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Command,
  Palette,
  Moon,
  Sun,
  Monitor,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

// Use mock stores as fallback
const useAuthStore = () => {
  try {
    return require('@/store/auth').useAuthStore();
  } catch {
    return (window as any).__mockStores?.useAuthStore() || {
      user: { name: 'John Doe', email: 'john@example.com' },
      logout: () => console.log('Logout clicked'),
    };
  }
};

const useWorkspaceStore = () => {
  try {
    return require('@/store/workspace').useWorkspaceStore();
  } catch {
    return (window as any).__mockStores?.useWorkspaceStore() || {
      selectedWorkspace: { name: 'My Workspace', slug: 'my-workspace' },
      workspaces: [],
    };
  }
};

const useTheme = () => {
  try {
    return require('@/components/theme-provider').useTheme();
  } catch {
    return {
      theme: 'system',
      setTheme: () => console.log('Theme changed'),
    };
  }
};

interface HeaderProps {
  className?: string;
}

const themeIcons: Record<string, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function Header({ className }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, logout } = useAuthStore();
  const { selectedWorkspace, workspaces } = useWorkspaceStore();
  const { theme, setTheme } = useTheme();

  const notifications = [
    {
      id: '1',
      title: 'Task assigned',
      message: 'You have been assigned to "Update user interface"',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Project update',
      message: 'Design System v2.0 has been completed',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Team meeting',
      message: 'Weekly standup starting in 15 minutes',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <header
      className={cn(
        'glass-effect border-b border-border/50 bg-background/50 backdrop-blur-xl',
        'sticky top-0 z-50 h-16 px-6',
        className
      )}
    >
      <div className="flex h-full items-center justify-between">
        {/* Left Section - Workspace Switcher */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button
              variant="ghost"
              className="h-10 justify-start gap-2 px-3"
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                {selectedWorkspace?.name?.charAt(0) || 'T'}
              </div>
              <span className="hidden sm:inline-block">
                {selectedWorkspace?.name || 'Select Workspace'}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>

            <AnimatePresence>
              {showWorkspaceMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-12 w-64 glass-effect rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-xl"
                  onBlur={() => setShowWorkspaceMenu(false)}
                >
                  <div className="space-y-1">
                    {workspaces.map((workspace) => (
                      <Link
                        key={workspace.id}
                        to={`/w/${workspace.slug}`}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/50"
                        onClick={() => setShowWorkspaceMenu(false)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                          {workspace.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {workspace.plan}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Create Workspace
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks, projects, people..."
              className="w-full rounded-lg border bg-background/50 pl-10 pr-4 py-2 text-sm backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const themes = ['light', 'dark', 'system'] as const;
                const currentIndex = themes.indexOf(theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
              className="h-9 w-9"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-80 glass-effect rounded-lg border bg-background/95 shadow-lg backdrop-blur-xl"
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      <Button variant="ghost" size="sm">
                        Mark all read
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          'border-b p-4 hover:bg-accent/50 cursor-pointer',
                          notification.unread && 'bg-primary/5'
                        )}
                      >
                        <div className="flex gap-3">
                          {notification.unread && (
                            <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="h-9 gap-2 px-3"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline-block text-sm">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-56 glass-effect rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-xl"
                >
                  <div className="border-b pb-2 mb-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Palette className="h-4 w-4" />
                      Preferences
                    </Button>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
} 