import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { CacheService } from '../config/redis';
import { logger } from '../config/logger';
import { WorkspaceRole } from '@prisma/client';

// Extend Express Request type to include user and workspace context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
      };
      workspace?: {
        id: string;
        name: string;
        slug: string;
        role: WorkspaceRole;
        permissions: string[];
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

const cache = CacheService.getInstance();

// JWT Authentication Middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Check if user exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
      return;
    }

    // Attach user to request
    req.user = user;
    
    logger.debug('User authenticated successfully', { 
      userId: user.id, 
      email: user.email 
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// Workspace Context Middleware
export const injectWorkspaceContext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
      return;
    }

    // Get workspace slug from params or headers
    const workspaceSlug = req.params.workspaceSlug || req.headers['x-workspace-slug'] as string;
    
    if (!workspaceSlug) {
      res.status(400).json({ 
        success: false, 
        message: 'Workspace context required' 
      });
      return;
    }

    // Check cache first
    const cacheKey = `workspace:${req.user.id}:${workspaceSlug}`;
    let workspaceContext = await cache.get(cacheKey);

    if (!workspaceContext) {
      // Find workspace and user's role
      const workspace = await prisma.workspace.findFirst({
        where: {
          slug: workspaceSlug,
          isActive: true,
        },
        include: {
          members: {
            where: {
              userId: req.user.id,
              isActive: true,
            },
            select: {
              role: true,
            },
          },
        },
      });

      if (!workspace || workspace.members.length === 0) {
        res.status(403).json({ 
          success: false, 
          message: 'Access denied to workspace' 
        });
        return;
      }

      const userRole = workspace.members[0].role;
      const permissions = getPermissionsForRole(userRole);

      workspaceContext = {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role: userRole,
        permissions,
      };

      // Cache for 30 minutes
      await cache.set(cacheKey, workspaceContext, 1800);
    }

    req.workspace = workspaceContext;

    logger.debug('Workspace context injected', {
      userId: req.user.id,
      workspaceId: workspaceContext.id,
      role: workspaceContext.role,
    });

    next();
  } catch (error) {
    logger.error('Workspace context injection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to inject workspace context' 
    });
  }
};

// Permission checking middleware
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.workspace) {
      res.status(400).json({ 
        success: false, 
        message: 'Workspace context required' 
      });
      return;
    }

    if (!req.workspace.permissions.includes(permission)) {
      res.status(403).json({ 
        success: false, 
        message: `Permission denied: ${permission}` 
      });
      return;
    }

    next();
  };
};

// Role checking middleware
export const requireRole = (requiredRoles: WorkspaceRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.workspace) {
      res.status(400).json({ 
        success: false, 
        message: 'Workspace context required' 
      });
      return;
    }

    if (!requiredRoles.includes(req.workspace.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient role permissions' 
      });
      return;
    }

    next();
  };
};

// Get permissions based on workspace role
const getPermissionsForRole = (role: WorkspaceRole): string[] => {
  const permissions: Record<WorkspaceRole, string[]> = {
    [WorkspaceRole.OWNER]: [
      'workspace:read',
      'workspace:write',
      'workspace:delete',
      'workspace:manage_members',
      'project:read',
      'project:write',
      'project:delete',
      'task:read',
      'task:write',
      'task:delete',
      'task:assign',
      'comment:read',
      'comment:write',
      'comment:delete',
      'file:upload',
      'file:delete',
      'analytics:read',
    ],
    [WorkspaceRole.ADMIN]: [
      'workspace:read',
      'workspace:write',
      'workspace:manage_members',
      'project:read',
      'project:write',
      'project:delete',
      'task:read',
      'task:write',
      'task:delete',
      'task:assign',
      'comment:read',
      'comment:write',
      'comment:delete',
      'file:upload',
      'file:delete',
      'analytics:read',
    ],
    [WorkspaceRole.MEMBER]: [
      'workspace:read',
      'project:read',
      'project:write',
      'task:read',
      'task:write',
      'task:assign',
      'comment:read',
      'comment:write',
      'file:upload',
    ],
    [WorkspaceRole.VIEWER]: [
      'workspace:read',
      'project:read',
      'task:read',
      'comment:read',
    ],
  };

  return permissions[role] || [];
};

// Optional authentication (for public endpoints that benefit from auth context)
export const optionalAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional authentication
    next();
  }
};

// Utility function to check if user owns a resource
export const checkResourceOwnership = async (
  userId: string,
  resourceType: 'task' | 'project' | 'comment',
  resourceId: string
): Promise<boolean> => {
  try {
    switch (resourceType) {
      case 'task':
        const task = await prisma.task.findFirst({
          where: {
            id: resourceId,
            creatorId: userId,
          },
        });
        return !!task;

      case 'project':
        const project = await prisma.project.findFirst({
          where: {
            id: resourceId,
            ownerId: userId,
          },
        });
        return !!project;

      case 'comment':
        const comment = await prisma.comment.findFirst({
          where: {
            id: resourceId,
            authorId: userId,
          },
        });
        return !!comment;

      default:
        return false;
    }
  } catch (error) {
    logger.error('Resource ownership check error:', error);
    return false;
  }
};

// Clear user permissions cache
export const clearUserPermissionsCache = async (userId: string, workspaceId?: string): Promise<void> => {
  await cache.invalidateUserPermissions(userId, workspaceId);
}; 