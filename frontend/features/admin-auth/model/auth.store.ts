import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminApi, Admin } from '@/entities/admin';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await adminApi.login({ email, password });
        
        set({
          token: response.accessToken,
          admin: {
            id: response.admin.id,
            email: response.admin.email,
            createdAt: new Date().toISOString(),
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, admin: null, token: null });
          return;
        }

        try {
          const admin = await adminApi.getMe();
          set({
            admin,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            token: null,
            admin: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
