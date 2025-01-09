import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  Hash, 
  User, 
  Folder, 
  Settings, 
  Calculator,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  ArrowRight,
  Keyboard
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords: string[];
  group: string;
  shortcut?: string;
}

const commandItems: CommandItem[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    subtitle: 'Go to dashboard',
    icon: Hash,
    action: () => console.log('Navigate to dashboard'),
    keywords: ['dashboard', 'home', 'overview'],
    group: 'Navigation',
  },
  {
    id: 'nav-projects',
    title: 'Projects',
    subtitle: 'View all projects',
    icon: Folder,
    action: () => console.log('Navigate to projects'),
    keywords: ['projects', 'work'],
    group: 'Navigation',
  },
  {
    id: 'nav-tasks',
    title: 'Tasks',
    subtitle: 'View your tasks',
    icon: FileText,
    action: () => console.log('Navigate to tasks'),
    keywords: ['tasks', 'todo', 'work'],
    group: 'Navigation',
  },
  {
    id: 'nav-team',
    title: 'Team',
    subtitle: 'Manage team members',
    icon: User,
    action: () => console.log('Navigate to team'),
    keywords: ['team', 'members', 'people'],
    group: 'Navigation',
  },
  {
    id: 'nav-settings',
    title: 'Settings',
    subtitle: 'App preferences',
    icon: Settings,
    action: () => console.log('Navigate to settings'),
    keywords: ['settings', 'preferences', 'config'],
    group: 'Navigation',
  },

  // Actions
  {
    id: 'action-new-task',
    title: 'New Task',
    subtitle: 'Create a new task',
    icon: Plus,
    action: () => console.log('Create new task'),
    keywords: ['new', 'create', 'task', 'add'],
    group: 'Actions',
    shortcut: '⌘+N',
  },
  {
    id: 'action-new-project',
    title: 'New Project',
    subtitle: 'Start a new project',
    icon: Folder,
    action: () => console.log('Create new project'),
    keywords: ['new', 'create', 'project', 'start'],
    group: 'Actions',
    shortcut: '⌘+P',
  },
  {
    id: 'action-schedule-meeting',
    title: 'Schedule Meeting',
    subtitle: 'Plan a team meeting',
    icon: Calendar,
    action: () => console.log('Schedule meeting'),
    keywords: ['meeting', 'schedule', 'calendar', 'plan'],
    group: 'Actions',
  },
  {
    id: 'action-send-message',
    title: 'Send Message',
    subtitle: 'Chat with team',
    icon: MessageSquare,
    action: () => console.log('Send message'),
    keywords: ['message', 'chat', 'communicate'],
    group: 'Actions',
  },

  // Tools
  {
    id: 'tool-calculator',
    title: 'Calculator',
    subtitle: 'Quick calculations',
    icon: Calculator,
    action: () => console.log('Open calculator'),
    keywords: ['calculator', 'math', 'calculate'],
    group: 'Tools',
  },
  {
    id: 'tool-shortcuts',
    title: 'Keyboard Shortcuts',
    subtitle: 'View all shortcuts',
    icon: Keyboard,
    action: () => console.log('Show shortcuts'),
    keywords: ['shortcuts', 'keyboard', 'help'],
    group: 'Tools',
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState(commandItems);

  const filterItems = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      return commandItems;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return commandItems.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.subtitle?.toLowerCase().includes(lowercaseQuery) ||
      item.keywords.some(keyword => keyword.includes(lowercaseQuery))
    );
  }, []);

  useEffect(() => {
    const filtered = filterItems(query);
    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [query, filterItems]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
        break;
    }
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const groupedItems = filteredItems.reduce((groups, item) => {
    const group = item.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, CommandItem[]>);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="flex min-h-screen items-start justify-center p-4 pt-[10vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg glass-effect rounded-xl border bg-background/95 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b p-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  <Command className="h-3 w-3" />
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">K</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No results found for "{query}"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedItems).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-3 py-2">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {group}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {items.map((item, index) => {
                          const globalIndex = filteredItems.indexOf(item);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = item.icon;
                          
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors',
                                isSelected 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-accent/50'
                              )}
                              onClick={() => {
                                item.action();
                                onClose();
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <Icon className={cn(
                                'h-4 w-4',
                                isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                              )} />
                              
                              <div className="flex-1 min-w-0">
                                <div className={cn(
                                  'text-sm font-medium',
                                  isSelected ? 'text-primary-foreground' : 'text-foreground'
                                )}>
                                  {item.title}
                                </div>
                                {item.subtitle && (
                                  <div className={cn(
                                    'text-xs',
                                    isSelected 
                                      ? 'text-primary-foreground/70' 
                                      : 'text-muted-foreground'
                                  )}>
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {item.shortcut && (
                                  <kbd className={cn(
                                    'px-1.5 py-0.5 rounded text-xs',
                                    isSelected 
                                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                                      : 'bg-muted text-muted-foreground'
                                  )}>
                                    {item.shortcut}
                                  </kbd>
                                )}
                                
                                <ArrowRight className={cn(
                                  'h-3 w-3',
                                  isSelected 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                )} />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted rounded">ESC</kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div className="text-primary">
                  {filteredItems.length} commands
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 