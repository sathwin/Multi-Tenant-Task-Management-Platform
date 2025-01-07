import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger';
import Joi from 'joi';

const authService = AuthService.getInstance();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  name: Joi.string().min(2).max(50).required().trim(),
  avatar: Joi.string().uri().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().trim(),
  avatar: Joi.string().uri().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .message('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

export class AuthController {
  // POST /api/auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      // Register user
      const result = await authService.register(value);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Registration failed:', error);
      
      if (error.message === 'User already exists with this email') {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
      });
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      // Login user
      const result = await authService.login(value);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('Login failed:', error);
      
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  }

  // POST /api/auth/refresh
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      // Refresh access token
      const result = await authService.refreshAccessToken(value.refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Token refresh failed:', error);
      
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
      });
    }
  }

  // POST /api/auth/logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout failed:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  // POST /api/auth/logout-all
  static async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await authService.logoutAll(req.user.id);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error: any) {
      logger.error('Logout all failed:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  // GET /api/auth/me
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await authService.getUserProfile(req.user.id);

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      logger.error('Get profile failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
      });
    }
  }

  // PUT /api/auth/profile
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Validate request body
      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const user = await authService.updateUserProfile(req.user.id, value);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error: any) {
      logger.error('Update profile failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  }

  // PUT /api/auth/change-password
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Validate request body
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      await authService.changePassword(
        req.user.id,
        value.currentPassword,
        value.newPassword
      );

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      logger.error('Change password failed:', error);
      
      if (error.message === 'Current password is incorrect') {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  }

  // GET /api/auth/verify
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint is protected by authenticateToken middleware
      // If we reach here, token is valid
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user,
          workspace: req.workspace,
        },
      });
    } catch (error: any) {
      logger.error('Token verification failed:', error);
      res.status(500).json({
        success: false,
        message: 'Token verification failed',
      });
    }
  }
} 