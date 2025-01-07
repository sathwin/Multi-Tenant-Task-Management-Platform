import Redis from 'ioredis';
import { logger } from './logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'task-platform:',
};

// Main Redis client for general caching
export const redis = new Redis(redisConfig);

// Separate Redis client for session storage
export const sessionRedis = new Redis({
  ...redisConfig,
  db: parseInt(process.env.REDIS_SESSION_DB || '1'),
  keyPrefix: 'session:',
});

// Separate Redis client for Bull Queue
export const queueRedis = new Redis({
  ...redisConfig,
  db: parseInt(process.env.REDIS_QUEUE_DB || '2'),
  keyPrefix: 'queue:',
});

// Separate Redis client for real-time subscriptions
export const pubSubRedis = new Redis({
  ...redisConfig,
  db: parseInt(process.env.REDIS_PUBSUB_DB || '3'),
  keyPrefix: 'pubsub:',
});

// Connection event handlers
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

sessionRedis.on('error', (error) => {
  logger.error('Session Redis error:', error);
});

queueRedis.on('error', (error) => {
  logger.error('Queue Redis error:', error);
});

pubSubRedis.on('error', (error) => {
  logger.error('PubSub Redis error:', error);
});

// Health check function
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    logger.info('Redis health check successful:', result);
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

// Cache utilities
export class CacheService {
  private static instance: CacheService;
  
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  // Workspace-specific cache methods
  async getWorkspaceData<T>(workspaceId: string, key: string): Promise<T | null> {
    return this.get(`workspace:${workspaceId}:${key}`);
  }

  async setWorkspaceData(workspaceId: string, key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    return this.set(`workspace:${workspaceId}:${key}`, value, ttlSeconds);
  }

  async deleteWorkspaceData(workspaceId: string, key: string): Promise<boolean> {
    return this.del(`workspace:${workspaceId}:${key}`);
  }

  // User session cache methods
  async getUserSession(userId: string): Promise<any | null> {
    return sessionRedis.get(`user:${userId}`);
  }

  async setUserSession(userId: string, sessionData: any, ttlSeconds = 86400): Promise<boolean> {
    try {
      await sessionRedis.setex(`user:${userId}`, ttlSeconds, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      logger.error('Session set error:', error);
      return false;
    }
  }

  async deleteUserSession(userId: string): Promise<boolean> {
    try {
      await sessionRedis.del(`user:${userId}`);
      return true;
    } catch (error) {
      logger.error('Session delete error:', error);
      return false;
    }
  }

  // Permission cache methods
  async getUserPermissions(userId: string, workspaceId: string): Promise<any | null> {
    return this.get(`permissions:${userId}:${workspaceId}`);
  }

  async setUserPermissions(userId: string, workspaceId: string, permissions: any): Promise<boolean> {
    return this.set(`permissions:${userId}:${workspaceId}`, permissions, 1800); // 30 minutes
  }

  async invalidateUserPermissions(userId: string, workspaceId?: string): Promise<void> {
    try {
      if (workspaceId) {
        await this.del(`permissions:${userId}:${workspaceId}`);
      } else {
        // Invalidate all permissions for user
        const pattern = `permissions:${userId}:*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch (error) {
      logger.error('Permission cache invalidation error:', error);
    }
  }

  // Real-time presence tracking
  async setUserOnline(userId: string, workspaceId: string, socketId: string): Promise<boolean> {
    try {
      await redis.setex(`online:${workspaceId}:${userId}`, 300, socketId); // 5 minutes
      await redis.sadd(`workspace_online:${workspaceId}`, userId);
      return true;
    } catch (error) {
      logger.error('Set user online error:', error);
      return false;
    }
  }

  async setUserOffline(userId: string, workspaceId: string): Promise<boolean> {
    try {
      await redis.del(`online:${workspaceId}:${userId}`);
      await redis.srem(`workspace_online:${workspaceId}`, userId);
      return true;
    } catch (error) {
      logger.error('Set user offline error:', error);
      return false;
    }
  }

  async getOnlineUsers(workspaceId: string): Promise<string[]> {
    try {
      return await redis.smembers(`workspace_online:${workspaceId}`);
    } catch (error) {
      logger.error('Get online users error:', error);
      return [];
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await redis.quit();
  await sessionRedis.quit();
  await queueRedis.quit();
  await pubSubRedis.quit();
});

process.on('SIGTERM', async () => {
  await redis.quit();
  await sessionRedis.quit();
  await queueRedis.quit();
  await pubSubRedis.quit();
}); 