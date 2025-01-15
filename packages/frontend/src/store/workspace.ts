import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { apiCallWithAuth } from './auth';

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
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  permissions: string[];
  memberCount?: number;
  projectCount?: number;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  workspace: {
    name: string;
    slug: string;
  };
}

interface WorkspaceState {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  isLoading: boolean;
  isLoadingMembers: boolean;
  error: string | null;
}

interface WorkspaceActions {
  // Workspace management
  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceSlug: string) => Promise<void>;
  createWorkspace: (data: { name: string; description?: string }) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  
  // Member management
  fetchMembers: (workspaceId: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string, role: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  
  // Invite management
  fetchInvites: (workspaceId: string) => Promise<void>;
  resendInvite: (inviteId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

export const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set, get) => ({
    // Initial state
    workspaces: [],
    selectedWorkspace: null,
    members: [],
    invites: [],
    isLoading: false,
    isLoadingMembers: false,
    error: null,

    // Workspace management
    fetchWorkspaces: async () => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        const response = await apiCallWithAuth('/api/workspaces');
        
        set((state) => {
          state.workspaces = response.data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
        throw error;
      }
    },

    selectWorkspace: async (workspaceSlug: string) => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        // First try to find in existing workspaces
        const existing = get().workspaces.find(w => w.slug === workspaceSlug);
        if (existing) {
          set((state) => {
            state.selectedWorkspace = existing;
            state.isLoading = false;
          });
          return;
        }

        // Fetch workspace details if not found
        const response = await apiCallWithAuth(`/api/workspaces/${workspaceSlug}`);
        
        set((state) => {
          state.selectedWorkspace = response.data;
          state.isLoading = false;
          
          // Add to workspaces list if not already there
          const existingIndex = state.workspaces.findIndex((w: any) => w.id === response.data.id);
          if (existingIndex === -1) {
            state.workspaces.push(response.data);
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
        throw error;
      }
    },

    createWorkspace: async (data) => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        const response = await apiCallWithAuth('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify(data),
        });

        const newWorkspace = response.data;

        set((state) => {
          state.workspaces.push(newWorkspace);
          state.selectedWorkspace = newWorkspace;
          state.isLoading = false;
        });

        return newWorkspace;
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
        throw error;
      }
    },

    updateWorkspace: async (id, updates) => {
      try {
        const response = await apiCallWithAuth(`/api/workspaces/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });

        const updatedWorkspace = response.data;

        set((state) => {
          const index = state.workspaces.findIndex((w: any) => w.id === id);
          if (index !== -1) {
            state.workspaces[index] = updatedWorkspace;
          }
          
          if (state.selectedWorkspace?.id === id) {
            state.selectedWorkspace = updatedWorkspace;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    deleteWorkspace: async (id) => {
      try {
        await apiCallWithAuth(`/api/workspaces/${id}`, {
          method: 'DELETE',
        });

        set((state) => {
          state.workspaces = state.workspaces.filter((w: any) => w.id !== id);
          
          if (state.selectedWorkspace?.id === id) {
            state.selectedWorkspace = null;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    // Member management
    fetchMembers: async (workspaceId) => {
      try {
        set((state) => {
          state.isLoadingMembers = true;
          state.error = null;
        });

        const response = await apiCallWithAuth(`/api/workspaces/${workspaceId}/members`);
        
        set((state) => {
          state.members = response.data;
          state.isLoadingMembers = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoadingMembers = false;
        });
        throw error;
      }
    },

    inviteMember: async (workspaceId, email, role) => {
      try {
        const response = await apiCallWithAuth(`/api/workspaces/${workspaceId}/invite`, {
          method: 'POST',
          body: JSON.stringify({ email, role }),
        });

        set((state) => {
          state.invites.push(response.data);
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    updateMemberRole: async (memberId, role) => {
      try {
        const response = await apiCallWithAuth(`/api/workspace-members/${memberId}`, {
          method: 'PUT',
          body: JSON.stringify({ role }),
        });

        const updatedMember = response.data;

        set((state) => {
          const index = state.members.findIndex((m: any) => m.id === memberId);
          if (index !== -1) {
            state.members[index] = updatedMember;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    removeMember: async (memberId) => {
      try {
        await apiCallWithAuth(`/api/workspace-members/${memberId}`, {
          method: 'DELETE',
        });

        set((state) => {
          state.members = state.members.filter((m: any) => m.id !== memberId);
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    // Invite management
    fetchInvites: async (workspaceId) => {
      try {
        const response = await apiCallWithAuth(`/api/workspaces/${workspaceId}/invites`);
        
        set((state) => {
          state.invites = response.data;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    resendInvite: async (inviteId) => {
      try {
        await apiCallWithAuth(`/api/workspace-invites/${inviteId}/resend`, {
          method: 'POST',
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    cancelInvite: async (inviteId) => {
      try {
        await apiCallWithAuth(`/api/workspace-invites/${inviteId}`, {
          method: 'DELETE',
        });

        set((state) => {
          state.invites = state.invites.filter((i: any) => i.id !== inviteId);
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
        });
        throw error;
      }
    },

    // Utility actions
    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    reset: () => {
      set((state) => {
        state.workspaces = [];
        state.selectedWorkspace = null;
        state.members = [];
        state.invites = [];
        state.isLoading = false;
        state.isLoadingMembers = false;
        state.error = null;
      });
    },
  }))
);

// Helper hooks
export const useWorkspacePermissions = () => {
  const selectedWorkspace = useWorkspaceStore(state => state.selectedWorkspace);
  
  const hasPermission = (permission: string) => {
    return selectedWorkspace?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (roles: string | string[]) => {
    if (!selectedWorkspace?.role) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(selectedWorkspace.role);
  };

  const isOwner = hasRole('OWNER');
  const isAdmin = hasRole(['OWNER', 'ADMIN']);
  const canManageMembers = hasPermission('workspace:manage_members');
  const canManageProjects = hasPermission('project:write');
  const canManageTasks = hasPermission('task:write');

  return {
    hasPermission,
    hasRole,
    isOwner,
    isAdmin,
    canManageMembers,
    canManageProjects,
    canManageTasks,
    permissions: selectedWorkspace?.permissions ?? [],
    role: selectedWorkspace?.role,
  };
}; 