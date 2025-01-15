import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/components/ui/command-palette';
import { useNotifications } from '@/hooks/useNotifications';

export function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Dynamic time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: '🌅' };
    if (hour < 17) return { text: 'Good afternoon', icon: '☀️' };
    return { text: 'Good evening', icon: '🌙' };
  };

  const greeting = getTimeGreeting();

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.23, 1, 0.32, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-40 w-full glass-effect border-b backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                </div>
                <Link
                  to="/"
                  className="text-xl font-bold gradient-text hover:scale-105 transition-transform"
                >
                  TaskFlow
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6 ml-8">
                {[
                  { to: '/', label: 'Dashboard' },
                  { to: '/projects', label: 'Projects' },
                  { to: '/tasks', label: 'Tasks' },
                  { to: '/team', label: 'Team' },
                ].map((item) => (
                  <motion.div
                    key={item.to}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.to}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover-glow px-3 py-2 rounded-lg"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden sm:block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommandPalette(true)}
                  className="h-9 px-4 gap-2 hover-lift micro-interaction"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden lg:inline">Search...</span>
                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </Button>
              </motion.div>

              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 hover-lift micro-interaction relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs font-medium text-white flex items-center justify-center pulse-soft"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {/* User Menu */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="h-9 gap-2 hover-lift micro-interaction"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:inline text-sm">
                      {greeting.icon} {greeting.text}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      variants={menuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 top-12 w-64 glass-effect rounded-xl border shadow-xl py-2"
                    >
                      <div className="px-4 py-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{user?.name || 'User'}</div>
                            <div className="text-sm text-muted-foreground">{user?.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {[
                          { icon: User, label: 'Profile', shortcut: '⌘P' },
                          { icon: Settings, label: 'Settings', shortcut: '⌘,' },
                          { icon: Zap, label: 'Upgrade', shortcut: '⌘U' },
                        ].map((item) => (
                          <motion.button
                            key={item.label}
                            whileHover={{ x: 4 }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1 text-left">{item.label}</span>
                            <kbd className="text-xs text-muted-foreground">{item.shortcut}</kbd>
                          </motion.button>
                        ))}

                        <div className="border-t border-border/50 mt-2 pt-2">
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="h-9 w-9 hover-lift micro-interaction"
                >
                  {showMobileMenu ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 glass-effect"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {[
                  { to: '/', label: 'Dashboard' },
                  { to: '/projects', label: 'Projects' },
                  { to: '/tasks', label: 'Tasks' },
                  { to: '/team', label: 'Team' },
                ].map((item) => (
                  <motion.div
                    key={item.to}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setShowMobileMenu(false)}
                      className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Click outside handlers */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
} 