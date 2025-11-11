import api from './api';

export interface PTClient {
  _id: string;
  pt: string;
  client: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    membershipType: string;
    phone?: string;
  };
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  goals: string[];
  notes?: string;
  isActive: boolean;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProgress {
  _id: string;
  ptClient: string;
  client: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: Array<{
    url: string;
    publicId: string;
    caption?: string;
    type: 'front' | 'side' | 'back' | 'progress';
  }>;
  notes?: string;
  mood?: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  energy?: 'high' | 'medium' | 'low';
  sleep?: number;
  waterIntake?: number;
  workoutCompleted: boolean;
  workoutNotes?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  };
  bmi?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPlan {
  _id: string;
  ptClient: string;
  client: string;
  type: 'workout' | 'nutrition' | 'general';
  title: string;
  description: string;
  content: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  status: 'sent' | 'received' | 'in_progress' | 'completed' | 'cancelled';
  attachments?: Array<{
    type: 'image' | 'document' | 'video' | 'link';
    url: string;
    filename?: string;
    size?: number;
  }>;
  isRead: boolean;
  readAt?: string;
  completedAt?: string;
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PTStats {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  totalPlansSent: number;
  progressStats: {
    avgWeight: number;
    avgBodyFat: number;
    completedWorkouts: number;
    totalEntries: number;
  };
}

export interface PTDashboardData {
  stats: PTStats;
  recentClients: PTClient[];
  recentPlans: ClientPlan[];
  monthlyStats: Array<{
    _id: {
      year: number;
      month: number;
    };
    sessions: number;
    completedWorkouts: number;
  }>;
}

export interface ClientDetail {
  client: PTClient;
  recentProgress: ClientProgress[];
  recentPlans: ClientPlan[];
  progressStats: {
    avgWeight: number;
    avgBodyFat: number;
    completedWorkouts: number;
    totalEntries: number;
    firstEntry: string;
    lastEntry: string;
  } | null;
}

export interface ClientAnalytics {
  analytics: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    avgWeight: number;
    avgBodyFat: number;
    completedWorkouts: number;
    totalEntries: number;
  }>;
}

// PT Dashboard functions
export const getPTDashboardStats = async (): Promise<PTDashboardData> => {
  const response = await api.get('/pt-dashboard/stats');
  return response.data;
};

export const getPTClients = async (filters: {
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  clients: PTClient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await api.get(`/pt-dashboard/clients?${params.toString()}`);
  return response.data;
};

export const getPTClientDetail = async (clientId: string): Promise<ClientDetail> => {
  const response = await api.get(`/pt-dashboard/clients/${clientId}`);
  return response.data;
};

export const updateClientStatus = async (
  clientId: string, 
  status: string, 
  notes?: string
): Promise<{ message: string; client: PTClient }> => {
  const response = await api.put(`/pt-dashboard/clients/${clientId}/status`, {
    status,
    notes
  });
  return response.data;
};

// Client Progress functions
export const getClientProgress = async (
  clientId: string,
  page: number = 1,
  limit: number = 30
): Promise<{
  progress: ClientProgress[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  const response = await api.get(`/pt-dashboard/clients/${clientId}/progress`, {
    params: { page, limit }
  });
  return response.data;
};

export const addClientProgress = async (
  clientId: string,
  progressData: Partial<ClientProgress>
): Promise<{ message: string; progress: ClientProgress }> => {
  const response = await api.post(`/pt-dashboard/clients/${clientId}/progress`, progressData);
  return response.data;
};

// Client Plans functions
export const getClientPlans = async (
  clientId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  plans: ClientPlan[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  const response = await api.get(`/pt-dashboard/clients/${clientId}/plans`, {
    params: { page, limit }
  });
  return response.data;
};

export const sendClientPlan = async (
  clientId: string,
  planData: {
    type: 'workout' | 'nutrition' | 'general';
    title: string;
    description: string;
    content: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    attachments?: Array<{
      type: 'image' | 'document' | 'video' | 'link';
      url: string;
      filename?: string;
      size?: number;
    }>;
  }
): Promise<{ message: string; plan: ClientPlan }> => {
  const response = await api.post(`/pt-dashboard/clients/${clientId}/plans`, planData);
  return response.data;
};

export const updatePlanStatus = async (
  planId: string,
  status: string
): Promise<{ message: string; plan: ClientPlan }> => {
  const response = await api.put(`/pt-dashboard/plans/${planId}/status`, { status });
  return response.data;
};

// Analytics functions
export const getClientAnalytics = async (
  clientId: string,
  period: '7d' | '30d' | '90d' = '30d'
): Promise<ClientAnalytics> => {
  const response = await api.get(`/pt-dashboard/clients/${clientId}/analytics`, {
    params: { period }
  });
  return response.data;
};

// Utility functions
export const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Chờ xử lý',
    'active': 'Đang hoạt động',
    'paused': 'Tạm dừng',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: { [key: string]: string } = {
    'pending': 'text-yellow-600 bg-yellow-100',
    'active': 'text-green-600 bg-green-100',
    'paused': 'text-orange-600 bg-orange-100',
    'completed': 'text-blue-600 bg-blue-100',
    'cancelled': 'text-red-600 bg-red-100'
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};

export const getPriorityLabel = (priority: string): string => {
  const priorityMap: { [key: string]: string } = {
    'low': 'Thấp',
    'medium': 'Trung bình',
    'high': 'Cao',
    'urgent': 'Khẩn cấp'
  };
  return priorityMap[priority] || priority;
};

export const getPriorityColor = (priority: string): string => {
  const colorMap: { [key: string]: string } = {
    'low': 'text-gray-600 bg-gray-100',
    'medium': 'text-blue-600 bg-blue-100',
    'high': 'text-orange-600 bg-orange-100',
    'urgent': 'text-red-600 bg-red-100'
  };
  return colorMap[priority] || 'text-gray-600 bg-gray-100';
};

export const getMoodLabel = (mood: string): string => {
  const moodMap: { [key: string]: string } = {
    'excellent': 'Tuyệt vời',
    'good': 'Tốt',
    'average': 'Bình thường',
    'poor': 'Kém',
    'terrible': 'Rất kém'
  };
  return moodMap[mood] || mood;
};

export const getMoodColor = (mood: string): string => {
  const colorMap: { [key: string]: string } = {
    'excellent': 'text-green-600 bg-green-100',
    'good': 'text-blue-600 bg-blue-100',
    'average': 'text-yellow-600 bg-yellow-100',
    'poor': 'text-orange-600 bg-orange-100',
    'terrible': 'text-red-600 bg-red-100'
  };
  return colorMap[mood] || 'text-gray-600 bg-gray-100';
};

export const getEnergyLabel = (energy: string): string => {
  const energyMap: { [key: string]: string } = {
    'high': 'Cao',
    'medium': 'Trung bình',
    'low': 'Thấp'
  };
  return energyMap[energy] || energy;
};

export const getEnergyColor = (energy: string): string => {
  const colorMap: { [key: string]: string } = {
    'high': 'text-green-600 bg-green-100',
    'medium': 'text-yellow-600 bg-yellow-100',
    'low': 'text-red-600 bg-red-100'
  };
  return colorMap[energy] || 'text-gray-600 bg-gray-100';
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateBMI = (weight: number, height: number): number => {
  const heightInM = height / 100;
  return Number((weight / (heightInM * heightInM)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi < 25) return 'Bình thường';
  if (bmi < 30) return 'Thừa cân';
  return 'Béo phì';
};

export const getBMIColor = (bmi: number): string => {
  if (bmi < 18.5) return 'text-blue-600 bg-blue-100';
  if (bmi < 25) return 'text-green-600 bg-green-100';
  if (bmi < 30) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(1)} kg`;
};

export const formatBodyFat = (bodyFat: number): string => {
  return `${bodyFat.toFixed(1)}%`;
};

export const formatMeasurements = (measurements: any): string => {
  const parts = [];
  if (measurements.chest) parts.push(`Ngực: ${measurements.chest}cm`);
  if (measurements.waist) parts.push(`Eo: ${measurements.waist}cm`);
  if (measurements.hips) parts.push(`Hông: ${measurements.hips}cm`);
  if (measurements.arms) parts.push(`Tay: ${measurements.arms}cm`);
  if (measurements.thighs) parts.push(`Đùi: ${measurements.thighs}cm`);
  return parts.join(', ');
};
