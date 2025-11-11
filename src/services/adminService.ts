import api from './api';

// (no duplicate imports)

// ==================== DASHBOARD ====================

export interface AdminStats {
  totalUsers: number;
  totalExercises: number;
  totalWorkoutPlans: number;
  totalSessions: number;
  totalPayments: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalVouchers: number;
  activeVouchers: number;
  totalMeals: number;
  activeMeals: number;
  publicMeals: number;
}

export interface RecentUser {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
  membershipType: string;
}

export interface RecentPayment {
  _id: string;
  amount: number;
  finalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  subscriptionPlan: {
    _id: string;
    name: string;
    price: number;
  };
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentUsers: RecentUser[];
  recentPayments: RecentPayment[];
}

export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

// ==================== USER MANAGEMENT ====================

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'trainer' | 'admin' | '';
  membershipType?: 'free' | 'premium' | 'pro' | 'year' | '';
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  membershipType: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const getUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<{ user: User; message: string }> => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// ==================== EXERCISE MANAGEMENT ====================

export interface ExerciseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | '';
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesResponse {
  exercises: Exercise[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const getExercises = async (filters: ExerciseFilters = {}): Promise<ExercisesResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/admin/exercises?${params.toString()}`);
  return response.data;
};

export const createExercise = async (data: Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ exercise: Exercise; message: string }> => {
  const response = await api.post('/admin/exercises', data);
  return response.data;
};

export const updateExercise = async (id: string, data: Partial<Exercise>): Promise<{ exercise: Exercise; message: string }> => {
  const response = await api.put(`/admin/exercises/${id}`, data);
  return response.data;
};

export const deleteExercise = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/exercises/${id}`);
  return response.data;
};

// ==================== PAYMENT MANAGEMENT ====================

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | '';
  paymentMethod?: 'vnpay' | 'momo' | 'zalopay' | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface Payment {
  _id: string;
  amount: number;
  finalAmount: number;
  discountAmount?: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  subscriptionPlan: {
    _id: string;
    name: string;
    price: number;
  };
  coupon?: {
    _id: string;
    code: string;
    name: string;
  };
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const getPayments = async (filters: PaymentFilters = {}): Promise<PaymentsResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/admin/payments?${params.toString()}`);
  return response.data;
};

export const updatePaymentStatus = async (id: string, status: 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'): Promise<{ message: string; status: string }> => {
  const response = await api.put(`/admin/payments/${id}/status`, { status });
  return response.data;
};

export const refundPayment = async (id: string): Promise<{ message: string; status: string }> => {
  const response = await api.post(`/admin/payments/${id}/refund`, {});
  return response.data;
};

// ==================== SUBSCRIPTION PLAN MANAGEMENT ====================

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
  const response = await api.get('/admin/subscription-plans');
  return response.data;
};

// Generic admin plans (workout/meal) list
export const getAdminPlans = async (filters: { type?: 'workout' | 'meal'; search?: string; page?: number; limit?: number } = {}): Promise<{ plans: any[]; pagination: any }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  const response = await api.get(`/admin/plans?${params.toString()}`);
  return response.data;
};

export const createAdminPlan = async (data: { type: 'workout' | 'meal'; name: string; description?: string }): Promise<{ plan: any; message: string }> => {
  const response = await api.post('/admin/plans', data);
  return response.data;
};

export const updateAdminPlan = async (id: string, data: Partial<{ name: string; description: string }>): Promise<{ plan: any; message: string }> => {
  const response = await api.put(`/admin/plans/${id}`, data);
  return response.data;
};

export const deleteAdminPlan = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/plans/${id}`);
  return response.data;
};

export const createSubscriptionPlan = async (data: Omit<SubscriptionPlan, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ plan: SubscriptionPlan; message: string }> => {
  const response = await api.post('/admin/subscription-plans', data);
  return response.data;
};

export const updateSubscriptionPlan = async (id: string, data: Partial<SubscriptionPlan>): Promise<{ plan: SubscriptionPlan; message: string }> => {
  const response = await api.put(`/admin/subscription-plans/${id}`, data);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/subscription-plans/${id}`);
  return response.data;
};

// ==================== VOUCHER MANAGEMENT ====================

export interface VoucherFilters {
  page?: number;
  limit?: number;
  search?: string;
  discountType?: 'percentage' | 'fixed_amount' | '';
  isActive?: boolean;
  isPublic?: boolean;
  status?: 'active' | 'expired' | 'inactive' | '';
}

export interface Voucher {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  applicablePlans: string[];
  usageLimit: number;
  usedCount: number;
  usageLimitPerUser: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isPublic: boolean;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  totalDiscountGiven: number;
  createdAt: string;
  updatedAt: string;
  isValid?: boolean;
  remainingUses?: number;
}

export interface VouchersResponse {
  vouchers: Voucher[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  totalUsage: number;
  totalDiscountGiven: number;
}

export const getVouchers = async (filters: VoucherFilters = {}): Promise<VouchersResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/admin/vouchers?${params.toString()}`);
  return response.data;
};

export const createVoucher = async (data: Omit<Voucher, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usedCount' | 'totalDiscountGiven' | 'isValid' | 'remainingUses'>): Promise<{ voucher: Voucher; message: string }> => {
  const response = await api.post('/admin/vouchers', data);
  return response.data;
};

export const updateVoucher = async (id: string, data: Partial<Voucher>): Promise<{ voucher: Voucher; message: string }> => {
  const response = await api.put(`/admin/vouchers/${id}`, data);
  return response.data;
};

export const deleteVoucher = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/vouchers/${id}`);
  return response.data;
};

export const getVoucherStats = async (): Promise<VoucherStats> => {
  const response = await api.get('/admin/vouchers/stats');
  return response.data;
};