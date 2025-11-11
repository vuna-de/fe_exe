import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';
import { setTokens, clearTokens, getTokens } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.login(data);
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success(response.message || 'Đăng nhập thành công!');
          
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại';
          toast.error(errorMessage);
          throw error;
        }
      },

      loginWithGoogle: async (idToken: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.googleLogin(idToken);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(response.message || 'Đăng nhập Google thành công!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.error || 'Đăng nhập Google thất bại';
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.register(data);
          
          // Sau đăng ký, KHÔNG tự đăng nhập. Yêu cầu xác thực email trước.
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          toast.success(response.message || 'Đăng ký thành công! Vui lòng xác thực email.');
          
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.error || 'Đăng ký thất bại';
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        try {
          const { tokens } = get();
          await authService.logout(tokens?.refreshToken);
          
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          
          toast.success('Đăng xuất thành công!');
          
        } catch (error) {
          // Always clear state even if API call fails
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          
          console.warn('Logout error:', error);
        }
      },

      logoutAll: async () => {
        try {
          await authService.logoutAll();
          
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          
          toast.success('Đăng xuất khỏi tất cả thiết bị thành công!');
          
        } catch (error) {
          // Always clear state even if API call fails
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          
          console.warn('Logout all error:', error);
        }
      },

      getCurrentUser: async () => {
        try {
          const response = await authService.getCurrentUser();
          
          set({
            user: response.user,
            isAuthenticated: true,
          });
          
        } catch (error) {
          console.warn('Get current user error:', error);
          
          // Clear auth state if user fetch fails
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          
          clearTokens();
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: async () => {
        const tokens = getTokens();
        
        if (tokens) {
          set({ 
            tokens, 
            isLoading: true,
            isAuthenticated: true 
          });
          
          try {
            await get().getCurrentUser();
          } catch (error) {
            console.warn('Initialize auth error:', error);
          } finally {
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync tokens with API service when rehydrating
        if (state?.tokens) {
          setTokens(state.tokens);
        }
      },
    }
  )
);

// Helper hooks
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    register: store.register,
    loginWithGoogle: store.loginWithGoogle,
    logout: store.logout,
    logoutAll: store.logoutAll,
    updateUser: store.updateUser,
    initialize: store.initialize,
  };
};

export const useUser = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  return { user, updateUser };
};
