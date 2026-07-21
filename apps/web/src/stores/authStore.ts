import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../lib/axios';
import type { UserResponseDTO } from '@decorflow/shared';

interface AuthState {
  user: UserResponseDTO | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  permissions: string[];
  setAuth: (user: UserResponseDTO, token: string, permissions?: string[]) => void;
  setPermissions: (permissions: string[]) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserResponseDTO>) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      permissions: [],

      setAuth: (user, accessToken, permissions = []) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, isAuthenticated: true, accessToken, permissions });
      },

      setPermissions: (permissions) => set({ permissions }),

      clearAuth: () => {
        delete apiClient.defaults.headers.common['Authorization'];
        set({ user: null, isAuthenticated: false, accessToken: null, permissions: [] });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      hasPermission: (permission) => {
        const { user, permissions } = get();
        if (user?.isSuperAdmin) return true;
        if (permissions.includes('*')) return true;
        return permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
        }
      },
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth();
    window.location.href = '/login';
  });
}
