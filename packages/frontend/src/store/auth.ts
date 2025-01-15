import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  workspaceMemberships: {
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    workspace: {
      id: string;
      name: string;
      slug: string;
      avatar?: string;
    };
  }[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastWorkspaceSlug: string | null;
}

interface AuthActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLastWorkspaceSlug: (slug: string) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// API helpers
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

const authenticatedApiCall = async (
  endpoint: string, 
  tokens: AuthTokens | null,
  options: RequestInit = {}
) => {
  if (!tokens?.accessToken) {
    throw new Error('No access token available');
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      ...options.headers,
    },
  });
};

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isLoading: true,
      isAuthenticated: false,
      lastWorkspaceSlug: null,

      // Actions
      login: async (credentials) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });

          const { user, accessToken, refreshToken } = response.data;
          const tokens = { accessToken, refreshToken };

          set((state) => {
            state.user = user;
            state.tokens = tokens;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
          });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const response = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
          });

          const { user, accessToken, refreshToken } = response.data;
          const tokens = { accessToken, refreshToken };

          set((state) => {
            state.user = user;
            state.tokens = tokens;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { tokens } = get();
          
          if (tokens?.refreshToken) {
            await apiCall('/api/auth/logout', {
              method: 'POST',
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set((state) => {
            state.user = null;
            state.tokens = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.lastWorkspaceSlug = null;
          });
        }
      },

      checkAuth: async () => {
        try {
          const { tokens } = get();
          
          if (!tokens?.accessToken) {
            set((state) => {
              state.isLoading = false;
              state.isAuthenticated = false;
            });
            return;
          }

          const response = await authenticatedApiCall('/api/auth/me', tokens);
          
          set((state) => {
            state.user = response.data;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          
          // Try to refresh tokens
          const refreshed = await get().refreshTokens();
          if (!refreshed) {
            get().clearAuth();
          }
        }
      },

      refreshTokens: async () => {
        try {
          const { tokens } = get();
          
          if (!tokens?.refreshToken) {
            return false;
          }

          const response = await apiCall('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });

          const newTokens = {
            accessToken: response.data.accessToken,
            refreshToken: tokens.refreshToken,
          };

          set((state) => {
            state.tokens = newTokens;
          });

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          return false;
        }
      },

      updateUser: (updates) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates);
          }
        });
      },

      setTokens: (tokens) => {
        set((state) => {
          state.tokens = tokens;
        });
      },

      setLastWorkspaceSlug: (slug) => {
        set((state) => {
          state.lastWorkspaceSlug = slug;
        });
      },

      clearAuth: () => {
        set((state) => {
          state.user = null;
          state.tokens = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.lastWorkspaceSlug = null;
        });
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        lastWorkspaceSlug: state.lastWorkspaceSlug,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

// Token interceptor for automatic refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Enhanced API call with automatic token refresh
export const apiCallWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { tokens, refreshTokens, clearAuth } = useAuthStore.getState();
  
  if (!tokens?.accessToken) {
    throw new Error('No access token available');
  }

  try {
    return await authenticatedApiCall(endpoint, tokens, options);
  } catch (error: any) {
    const originalRequest = { endpoint, options };
    
    if (error?.response?.status === 401 && !(originalRequest as any).retry) {
      // Mark request as retried to prevent infinite loops
      (originalRequest as any).retry = true;
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return authenticatedApiCall(endpoint, useAuthStore.getState().tokens, options);
        });
      }

      isRefreshing = true;

      try {
        const refreshed = await refreshTokens();
        
        if (refreshed) {
          processQueue(null);
          return authenticatedApiCall(endpoint, useAuthStore.getState().tokens, options);
        } else {
          processQueue(error, null);
          clearAuth();
          throw error;
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
}; 