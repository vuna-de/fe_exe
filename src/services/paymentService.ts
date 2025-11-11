import { apiRequest } from './api';

// Types
export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  price: number;
  originalPrice?: number;
  currency: 'VND' | 'USD';
  duration: number;
  features: Array<{
    name: string;
    description: string;
    included: boolean;
  }>;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  metadata: {
    maxWorkouts?: number;
    maxMealPlans?: number;
    maxTrainers?: number;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial';
  value: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit: number;
  usedCount: number;
  userLimit: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  user: string;
  subscriptionPlan: SubscriptionPlan;
  amount: number;
  currency: 'VND' | 'USD';
  paymentMethod: 'vnpay' | 'momo' | 'zalopay' | 'bank_transfer' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId: string;
  vnpayTransactionId?: string;
  vnpayResponseCode?: string;
  vnpayResponseMessage?: string;
  paymentUrl?: string;
  returnUrl?: string;
  ipnUrl?: string;
  coupon?: Coupon;
  discountAmount: number;
  finalAmount: number;
  paymentData?: any;
  failureReason?: string;
  completedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  user: string;
  subscriptionPlan: SubscriptionPlan;
  payment: Payment;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  features: Array<{
    name: string;
    description: string;
    included: boolean;
    used: number;
    limit?: number;
  }>;
  isExpired?: boolean;
  daysRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  code: string;
  name: string;
}

// SUBSCRIPTION PLANS

// Lấy danh sách gói subscription
export const getSubscriptionPlans = async (): Promise<{ plans: SubscriptionPlan[] }> => {
  try {
    const response = await apiRequest.get<{ plans: SubscriptionPlan[] }>('/payment/plans');
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết gói subscription
export const getSubscriptionPlanById = async (id: string): Promise<{ plan: SubscriptionPlan }> => {
  try {
    const response = await apiRequest.get<{ plan: SubscriptionPlan }>(`/payment/plans/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// COUPONS

// Lấy danh sách coupon
export const getCoupons = async (params?: {
  code?: string;
  planId?: string;
}): Promise<{ coupons: Coupon[] }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.code) queryParams.append('code', params.code);
    if (params?.planId) queryParams.append('planId', params.planId);

    const response = await apiRequest.get<{ coupons: Coupon[] }>(`/payment/coupons?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Kiểm tra coupon
export const validateCoupon = async (data: {
  code: string;
  planId: string;
  amount: number;
}): Promise<{
  valid: boolean;
  coupon?: {
    _id: string;
    code: string;
    name: string;
    type: string;
    value: number;
    discountAmount: number;
    finalAmount: number;
  };
  error?: string;
}> => {
  try {
    const response = await apiRequest.post<{
      valid: boolean;
      coupon?: {
        _id: string;
        code: string;
        name: string;
        type: string;
        value: number;
        discountAmount: number;
        finalAmount: number;
      };
    }>('/payment/coupons/validate', data);
    return response;
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.data?.error || 'Lỗi khi kiểm tra coupon'
    };
  }
};

// PAYMENT

// Tạo thanh toán VNPay
export const createVNPayPayment = async (data: {
  planId: string;
  couponCode?: string;
  paymentMethod: 'vnpay' | 'momo' | 'zalopay';
}): Promise<{
  message: string;
  payment: {
    _id: string;
    transactionId: string;
    amount: number;
    paymentUrl: string;
    expiresAt: string;
  };
}> => {
  try {
    const response = await apiRequest.post<{
      message: string;
      payment: {
        _id: string;
        transactionId: string;
        amount: number;
        paymentUrl: string;
        expiresAt: string;
      };
    }>('/payment/vnpay/create', data);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy lịch sử thanh toán
export const getPaymentHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  payments: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiRequest.get<{
      payments: Payment[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/payment/history?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết thanh toán
export const getPaymentById = async (id: string): Promise<{ payment: Payment }> => {
  try {
    const response = await apiRequest.get<{ payment: Payment }>(`/payment/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// SUBSCRIPTION MANAGEMENT

// Lấy thông tin subscription hiện tại
export const getCurrentSubscription = async (): Promise<{ subscription: Subscription | null }> => {
  try {
    const response = await apiRequest.get<{ subscription: Subscription | null }>('/payment/subscription/current');
    return response;
  } catch (error) {
    throw error;
  }
};

// Hủy subscription
export const cancelSubscription = async (data: {
  reason?: string;
}): Promise<{
  message: string;
  subscription: Subscription;
}> => {
  try {
    const response = await apiRequest.post<{
      message: string;
      subscription: Subscription;
    }>('/payment/subscription/cancel', data);
    return response;
  } catch (error) {
    throw error;
  }
};

// UTILITIES

// Lấy danh sách ngân hàng hỗ trợ
export const getSupportedBanks = async (): Promise<{ banks: Bank[] }> => {
  try {
    const response = await apiRequest.get<{ banks: Bank[] }>('/payment/banks/supported');
    return response;
  } catch (error) {
    throw error;
  }
};

// Format currency
export const formatCurrency = (amount: number, currency: 'VND' | 'USD' = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

// Format duration
export const formatDuration = (duration: number, type: string): string => {
  switch (type) {
    case 'monthly':
      return `${duration} ngày`;
    case 'quarterly':
      return `${duration / 30} tháng`;
    case 'yearly':
      return `${duration / 365} năm`;
    case 'lifetime':
      return 'Trọn đời';
    default:
      return `${duration} ngày`;
  }
};
