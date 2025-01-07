import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/store/workspace';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  exact?: boolean;
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '',
    icon: Home,
    exact: true,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    label: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const sidebarVariants = {
  expanded: {
    width: 280,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
  collapsed: {
    width: 80,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

const contentVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1,
      duration: 0.2,
    },
  },
  collapsed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.1,
    },
  },
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { selectedWorkspace } = useWorkspaceStore();

  const isActive = (href: string, exact?: boolean) => {
    if (!selectedWorkspace) return false;
    
    const basePath = `/w/${selectedWorkspace.slug}`;
    const fullPath = `${basePath}${href}`;
    
    if (exact) {
      return location.pathname === basePath || location.pathname === fullPath;
    }
    
    return location.pathname.startsWith(fullPath);
  };

  return (
    <motion.aside
      className={cn(
        'glass-effect border-r border-border/50 bg-background/50 backdrop-blur-xl',
        'flex h-screen flex-col',
        'fixed left-0 top-0 z-40 lg:sticky lg:z-auto',
        className
      )}
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      initial="expanded"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {selectedWorkspace?.name || 'TaskFlow'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedWorkspace?.plan || 'FREE'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-accent/50"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-border/50 p-4">
        <div className="space-y-2">
          <Button
            variant="glass"
            size={isCollapsed ? 'icon' : 'default'}
            className="w-full justify-start"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  New Task
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'default'}
            className="w-full justify-start hover:bg-accent/50"
            leftIcon={<Search className="h-4 w-4" />}
          >
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  Search
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            const href = selectedWorkspace 
              ? `/w/${selectedWorkspace.slug}${item.href}`
              : '#';

            return (
              <motion.div
                key={item.label}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-accent/50 hover:text-accent-foreground',
                    active
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      active ? 'text-primary' : 'group-hover:text-foreground'
                    )}
                  />

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="flex flex-1 items-center justify-between"
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <motion.span
                            className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      className="absolute right-0 h-8 w-1 rounded-l-full bg-primary"
                      layoutId="sidebar-active-indicator"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-2 text-xs text-muted-foreground"
            >
              <div className="flex items-center justify-between">
                <span>Storage Used</span>
                <span>2.4 GB</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
              <div className="text-center">
                <Button variant="link" className="h-auto p-0 text-xs">
                  Upgrade Plan
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
} 