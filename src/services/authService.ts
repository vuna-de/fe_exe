import { apiRequest, setTokens, clearTokens, getTokens } from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User,
  ChangePasswordForm,
  UpdateProfileForm
} from '../types';

export const authService = {
  // Đăng ký
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest.post<AuthResponse>('/auth/register', data);
    
    if (response.tokens) {
      setTokens(response.tokens);
    }
    
    return response;
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest.post<AuthResponse>('/auth/login', data);
    
    if (response.tokens) {
      setTokens(response.tokens);
    }
    
    return response;
  },

  // Đăng xuất
  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await apiRequest.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Ignore error, always clear tokens locally
      console.warn('Logout request failed:', error);
    } finally {
      clearTokens();
    }
  },

  // Đăng xuất khỏi tất cả thiết bị
  logoutAll: async (): Promise<void> => {
    try {
      await apiRequest.post('/auth/logout-all');
    } catch (error) {
      console.warn('Logout all request failed:', error);
    } finally {
      clearTokens();
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiRequest.get<{ user: User }>('/auth/me');
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordForm): Promise<{ message: string }> => {
    return apiRequest.post<{ message: string }>('/auth/change-password', data);
  },

  // Quên mật khẩu
  forgotPassword: async (email: string): Promise<{ message: string; resetToken?: string }> => {
    return apiRequest.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email });
  },

  // Reset mật khẩu
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiRequest.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },

  // Xác thực email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiRequest.post<{ message: string }>('/auth/verify-email', { token });
  },

  // Gửi lại email xác thực
  resendVerification: async (email: string): Promise<{ message: string; emailVerificationToken?: string }> => {
    return apiRequest.post<{ message: string; emailVerificationToken?: string }>('/auth/resend-verification', { email });
  },

  // Đăng nhập Google với id_token
  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiRequest.post<AuthResponse>('/auth/google', { idToken });
    if (response.tokens) {
      setTokens(response.tokens);
    }
    return response;
  },

  // Refresh token (được xử lý tự động bởi interceptor)
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiRequest.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },
};

export const userService = {
  // Lấy profile
  getProfile: async (): Promise<{ user: User }> => {
    return apiRequest.get<{ user: User }>('/users/profile');
  },

  // Cập nhật profile
  updateProfile: async (data: UpdateProfileForm): Promise<{ message: string; user: User }> => {
    return apiRequest.put<{ message: string; user: User }>('/users/profile', data);
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ 
    success: boolean; 
    message: string; 
    data: { 
      avatar: string; 
      filename: string; 
      originalName: string; 
      size: number; 
    } 
  }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Sử dụng apiRequest để tận dụng interceptor
    try {
      // Tạm thời sử dụng fetch với axios instance
      const tokens = getTokens();
      console.log('Tokens for upload:', tokens);
      
      if (!tokens?.accessToken) {
        throw new Error('Vui lòng đăng nhập lại');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Upload failed');
      }

      return response.json();
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  // Lấy thống kê user
  getStats: async (): Promise<{ stats: any }> => {
    return apiRequest.get<{ stats: any }>('/users/stats');
  },

  // Nâng cấp premium
  upgradePremium: async (months: number = 1): Promise<{ 
    message: string; 
    membershipType: string; 
    membershipExpiry: string; 
  }> => {
    return apiRequest.post<{ 
      message: string; 
      membershipType: string; 
      membershipExpiry: string; 
    }>('/users/upgrade-premium', { months });
  },

  // Lấy thông tin subscription của user
  getSubscription: async (): Promise<{ subscription: any; subscriptionPlan: any }> => {
    const response = await apiRequest.get<{ subscription: any; subscriptionPlan: any }>('/users/subscription');
    return response;
  },
};
