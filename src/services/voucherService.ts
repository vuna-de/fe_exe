import { apiRequest } from './api';

// Types
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

export interface VoucherFilters {
  planId?: string;
}

export interface VoucherValidationData {
  code: string;
  planId: string;
  amount: number;
}

export interface VoucherValidationResponse {
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
}

// Lấy danh sách voucher có sẵn (để hiển thị cho user)
export const getVouchers = async (filters: VoucherFilters = {}): Promise<{ coupons: Voucher[] }> => {
  try {
    const params = new URLSearchParams();
    if (filters.planId) {
      params.append('planId', filters.planId);
    }

    const response = await apiRequest.get<{ coupons: Voucher[] }>(`/payment/vouchers?${params.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Validate voucher code
export const validateVoucher = async (data: VoucherValidationData): Promise<VoucherValidationResponse> => {
  try {
    const response = await apiRequest.post<VoucherValidationResponse>('/payment/vouchers/validate', data);
    return response;
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.data?.error || 'Lỗi khi kiểm tra voucher'
    };
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

// Format discount value
export const formatDiscountValue = (voucher: Voucher): string => {
  if (voucher.discountType === 'percentage') {
    return `${voucher.discountValue}%`;
  } else {
    return `${voucher.discountValue.toLocaleString()} VNĐ`;
  }
};

// Get voucher status
export const getVoucherStatus = (voucher: Voucher): { text: string; class: string } => {
  const now = new Date();
  const validFrom = new Date(voucher.validFrom);
  const validUntil = new Date(voucher.validUntil);
  
  if (!voucher.isActive) {
    return { text: 'Không hoạt động', class: 'inactive' };
  }
  if (validUntil < now) {
    return { text: 'Hết hạn', class: 'expired' };
  }
  if (validFrom > now) {
    return { text: 'Chưa bắt đầu', class: 'pending' };
  }
  if (voucher.usedCount >= voucher.usageLimit) {
    return { text: 'Hết lượt', class: 'used' };
  }
  return { text: 'Hoạt động', class: 'active' };
};

// Check if voucher is applicable for plan
export const isVoucherApplicableForPlan = (voucher: Voucher, planId: string): boolean => {
  return voucher.applicablePlans.length === 0 || voucher.applicablePlans.includes(planId);
};
