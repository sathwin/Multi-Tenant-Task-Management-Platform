import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<boolean>;
  showDesktopNotification: (title: string, options?: NotificationOptions) => void;
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Task assigned',
    message: 'You have been assigned to "Update user interface"',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/tasks/123',
    metadata: { taskId: '123', assignedBy: 'Sarah Wilson' },
  },
  {
    id: '2',
    title: 'Project update',
    message: 'Design System v2.0 has been completed',
    type: 'success',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/projects/design-system',
    metadata: { projectId: 'design-system', completedBy: 'Mike Chen' },
  },
  {
    id: '3',
    title: 'Team meeting',
    message: 'Weekly standup starting in 15 minutes',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    metadata: { meetingId: 'standup-weekly', startTime: '10:00 AM' },
  },
  {
    id: '4',
    title: 'Deadline approaching',
    message: 'Mobile app wireframes due tomorrow',
    type: 'warning',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/projects/mobile-app',
    metadata: { projectId: 'mobile-app', dueDate: '2025-01-05' },
  },
];

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    desktop: true,
    sound: false,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show desktop notification if enabled
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      showDesktopNotification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: newNotification.id,
      });
    }

    // Play sound if enabled
    if (settings.sound) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors (autoplay restrictions)
        });
      } catch {
        // Ignore audio errors
      }
    }
  }, [settings.desktop, settings.sound]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Save to localStorage
    localStorage.setItem('notification-settings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showDesktopNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        ...options,
        icon: options?.icon || '/icon-192x192.png',
        badge: options?.badge || '/icon-192x192.png',
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Request notification permission on mount if desktop notifications are enabled
  useEffect(() => {
    if (settings.desktop && 'Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  }, [settings.desktop, requestPermission]);

  // Simulate real-time notifications in demo mode
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Randomly add notifications for demo
      if (Math.random() < 0.1) {
        const demoNotifications = [
          {
            title: 'New comment',
            message: 'Someone commented on your task',
            type: 'info' as const,
          },
          {
            title: 'Task completed',
            message: 'Team member completed a shared task',
            type: 'success' as const,
          },
          {
            title: 'Meeting reminder',
            message: 'Team standup in 5 minutes',
            type: 'warning' as const,
          },
        ];

        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, addNotification]);

  return {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    requestPermission,
    showDesktopNotification,
  };
} 