import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { CacheService } from '../config/redis';
import { logger } from '../config/logger';
import { User, RefreshToken } from '@prisma/client';
import crypto from 'crypto';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
}

const cache = CacheService.getInstance();

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // User Registration
  async register(data: RegisterData): Promise<AuthTokens> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          name: data.name,
          avatar: data.avatar,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return tokens;
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  // User Login
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { 
          email: credentials.email.toLowerCase(),
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          password: true,
        },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const { password, ...userWithoutPassword } = user;
      const tokens = await this.generateTokens(userWithoutPassword);

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return tokens;
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  // OAuth Login/Registration
  async oauthLogin(profile: OAuthProfile): Promise<AuthTokens> {
    try {
      let user;

      // Check if user exists with OAuth provider ID
      const oauthField = profile.provider === 'google' ? 'googleId' : 'githubId';
      user = await prisma.user.findFirst({
        where: {
          [oauthField]: profile.id,
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
        // Check if user exists with email
        user = await prisma.user.findUnique({
          where: { email: profile.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        });

        if (user) {
          // Link OAuth account to existing user
          await prisma.user.update({
            where: { id: user.id },
            data: {
              [oauthField]: profile.id,
              lastLogin: new Date(),
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.email.toLowerCase(),
              name: profile.name,
              avatar: profile.avatar,
              [oauthField]: profile.id,
              password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Random password
              lastLogin: new Date(),
            },
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          });
        }
      } else {
        // Update last login for existing OAuth user
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('OAuth login successful', { 
        userId: user.id, 
        email: user.email, 
        provider: profile.provider 
      });

      return tokens;
    } catch (error) {
      logger.error('OAuth login failed:', error);
      throw error;
    }
  }

  // Refresh Access Token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              isActive: true,
            },
          },
        },
      });

      if (!storedToken || !storedToken.user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new Error('Refresh token expired');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(storedToken.user);

      logger.debug('Access token refreshed', { userId: storedToken.user.id });

      return { accessToken };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Logout
  async logout(refreshToken: string): Promise<void> {
    try {
      // Remove refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      logger.debug('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  // Logout from all devices
  async logoutAll(userId: string): Promise<void> {
    try {
      // Remove all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      // Clear user session cache
      await cache.deleteUserSession(userId);

      logger.info('User logged out from all devices', { userId });
    } catch (error) {
      logger.error('Logout all failed:', error);
      throw error;
    }
  }

  // Generate JWT tokens
  private async generateTokens(user: { id: string; email: string; name: string; avatar?: string }): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // Generate Access Token
  private generateAccessToken(user: { id: string; email: string }): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRE_TIME || '15m',
        issuer: 'task-platform',
      }
    );
  }

  // Generate Refresh Token
  private async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME || '7d',
        issuer: 'task-platform',
      }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  // Verify Access Token
  async verifyAccessToken(token: string): Promise<{ userId: string; email: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          lastLogin: true,
          workspaceMemberships: {
            include: {
              workspace: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user profile failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    data: { name?: string; avatar?: string }
  ): Promise<any> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      // Clear user cache
      await cache.deleteUserSession(userId);

      logger.info('User profile updated', { userId });

      return user;
    } catch (error) {
      logger.error('Update user profile failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get user with current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Logout from all devices for security
      await this.logoutAll(userId);

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Change password failed:', error);
      throw error;
    }
  }

  // Clean up expired tokens (to be called by a scheduled job)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      logger.info('Expired tokens cleaned up', { deletedCount: result.count });
    } catch (error) {
      logger.error('Token cleanup failed:', error);
    }
  }
} 