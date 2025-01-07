// Core User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  isActive: boolean;
  settings: Record<string, any>;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
  permissions: string[];
  memberCount?: number;
  projectCount?: number;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  joinedAt: string;
  isActive: boolean;
  user: User;
}

// Project & Task Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  workspaceId: string;
  ownerId: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  boards: Board[];
  memberCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
}

export interface Board {
  id: string;
  name: string;
  position: number;
  projectId: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  taskCount?: number;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  position: number;
  dueDate?: string;
  completedAt?: string;
  boardId: string;
  assigneeId?: string;
  creatorId: string;
  estimatedHours?: number;
  actualHours?: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  creator: User;
  comments: Comment[];
  attachments: Attachment[];
  commentsCount?: number;
  attachmentsCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
  replies: Comment[];
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  taskId: string;
  uploaderId: string;
  createdAt: string;
  uploader: User;
}

// Activity & Notification Types
export type ActivityType = 
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'COMMENT_ADDED'
  | 'PROJECT_CREATED'
  | 'BOARD_CREATED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'WORKSPACE_UPDATED';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, any>;
  workspaceId: string;
  userId: string;
  entityId?: string;
  entityType?: string;
  createdAt: string;
  user: User;
}

export type NotificationType = 
  | 'TASK_ASSIGNED'
  | 'TASK_DUE_SOON'
  | 'COMMENT_MENTION'
  | 'PROJECT_INVITE'
  | 'WORKSPACE_INVITE';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  workspaceId: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

// Analytics Types
export interface Analytics {
  id: string;
  workspaceId: string;
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  activeUsers: number;
  totalUsers: number;
  totalProjects: number;
  avgTaskCompletionTime?: number;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  totalProjects: number;
  activeProjects: number;
  teamMembers: number;
  avgCompletionTime: number;
  productivityScore: number;
  taskCompletionRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
  [key: string]: any;
}

export interface TimeSeriesData {
  date: string;
  tasks: number;
  completed: number;
  created: number;
}

export interface TeamProductivityData {
  userId: string;
  name: string;
  avatar?: string;
  completedTasks: number;
  totalTasks: number;
  avgCompletionTime: number;
  productivityScore: number;
}

// UI & Component Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderRadius: number;
  animations: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
  };
}

export interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
  group?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

export interface TaskForm {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  estimatedHours?: number;
  labels: string[];
  boardId: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
}

export interface WorkspaceForm {
  name: string;
  description?: string;
  avatar?: string;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface FilterOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string[];
  dueDate?: {
    from?: string;
    to?: string;
  };
  labels?: string[];
}

// Drag & Drop Types
export interface DragItem {
  id: string;
  type: 'task' | 'board';
  data: Task | Board;
}

export interface DropResult {
  dragId: string;
  sourceId: string;
  destinationId: string;
  sourceIndex: number;
  destinationIndex: number;
}

// Real-time Types
export interface OnlineUser {
  id: string;
  userId: string;
  workspaceId: string;
  socketId: string;
  lastSeen: string;
  user: User;
}

export interface RealtimeEvent {
  type: string;
  payload: any;
  workspaceId: string;
  userId: string;
  timestamp: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  roles?: WorkspaceRole[];
  permissions?: string[];
  exact?: boolean;
  children?: RouteConfig[];
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 