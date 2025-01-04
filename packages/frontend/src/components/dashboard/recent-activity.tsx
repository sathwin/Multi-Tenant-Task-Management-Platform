import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  GitBranch,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'document_created' | 'comment_added' | 'member_added' | 'project_updated';
  user: {
    name: string;
    avatar?: string;
  };
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    projectName?: string;
    taskName?: string;
    documentTitle?: string;
  };
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'task_completed',
    user: {
      name: 'Sarah Wilson',
      avatar: 'SW',
    },
    title: 'Completed task',
    description: 'Finished "API Integration for User Authentication"',
    timestamp: '2 minutes ago',
    metadata: {
      projectName: 'Authentication System',
      taskName: 'API Integration for User Authentication',
    },
  },
  {
    id: '2',
    type: 'document_created',
    user: {
      name: 'Mike Chen',
      avatar: 'MC',
    },
    title: 'Created document',
    description: 'Added "Database Schema Design" to project docs',
    timestamp: '15 minutes ago',
    metadata: {
      projectName: 'Backend Development',
      documentTitle: 'Database Schema Design',
    },
  },
  {
    id: '3',
    type: 'comment_added',
    user: {
      name: 'Emily Rodriguez',
      avatar: 'ER',
    },
    title: 'Added comment',
    description: 'Provided feedback on "UI Component Library"',
    timestamp: '1 hour ago',
    metadata: {
      projectName: 'Design System',
    },
  },
  {
    id: '4',
    type: 'member_added',
    user: {
      name: 'Alex Thompson',
      avatar: 'AT',
    },
    title: 'Joined team',
    description: 'Added as Frontend Developer to the project',
    timestamp: '2 hours ago',
    metadata: {
      projectName: 'Frontend Development',
    },
  },
  {
    id: '5',
    type: 'project_updated',
    user: {
      name: 'David Park',
      avatar: 'DP',
    },
    title: 'Updated project',
    description: 'Modified project settings and timeline',
    timestamp: '4 hours ago',
    metadata: {
      projectName: 'Mobile App Development',
    },
  },
  {
    id: '6',
    type: 'task_completed',
    user: {
      name: 'Lisa Johnson',
      avatar: 'LJ',
    },
    title: 'Completed task',
    description: 'Reviewed and approved "User Interface Mockups"',
    timestamp: '6 hours ago',
    metadata: {
      projectName: 'UI/UX Design',
      taskName: 'User Interface Mockups',
    },
  },
];

const activityIcons = {
  task_completed: CheckCircle2,
  document_created: FileText,
  comment_added: MessageSquare,
  member_added: UserPlus,
  project_updated: GitBranch,
};

const activityColors = {
  task_completed: 'text-green-500 bg-green-500/10',
  document_created: 'text-blue-500 bg-blue-500/10',
  comment_added: 'text-orange-500 bg-orange-500/10',
  member_added: 'text-purple-500 bg-purple-500/10',
  project_updated: 'text-indigo-500 bg-indigo-500/10',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export function RecentActivity() {
  return (
    <div className="glass-effect rounded-xl border p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest updates from your team
          </p>
        </div>
        
        <Button variant="ghost" size="sm" className="gap-2">
          View All
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {mockActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          
          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className="group rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  activityColors[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground">
                          {activity.user.avatar}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {activity.user.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {activity.title}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1 truncate">
                        {activity.description}
                      </p>
                      
                      {activity.metadata?.projectName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>in</span>
                          <span className="font-medium text-primary">
                            {activity.metadata.projectName}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Activity updates in real-time across all connected devices
        </p>
      </div>
    </div>
  );
} 