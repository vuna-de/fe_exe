import { apiRequest } from './api';
import { WorkoutPlan, WorkoutSession, WorkoutFilters, WorkoutPlansResponse, WorkoutSessionsResponse } from '../types';

export interface WorkoutPlanData {
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  frequency?: string;
  exercises: {
    exercise: string;
    plannedSets: number;
    plannedReps?: {
      min: number;
      max: number;
    };
    plannedWeight?: number;
    plannedDuration?: number;
    plannedDistance?: number;
    restTime?: number;
    notes?: string;
    order: number;
  }[];
  tags?: string[];
}

export interface GenerateWorkoutPlanData {
  goal: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  frequency?: 'daily' | 'every_other_day' | 'weekly' | 'custom';
  equipment?: string[];
}

export interface WorkoutStats {
  period: string;
  stats: {
    totalSessions: number;
    totalDuration: number;
    totalCalories: number;
    avgCompletionRate: number;
    avgDuration: number;
    currentStreak?: number;
    bestStreak?: number;
  };
}

// WORKOUT PLANS

// Lấy danh sách kế hoạch tập luyện
export const getWorkoutPlans = async (
  filters: WorkoutFilters = {},
  page = 1,
  limit = 20
): Promise<WorkoutPlansResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters.category && { category: filters.category }),
    ...(filters.difficulty && { difficulty: filters.difficulty }),
    ...(filters.isTemplate !== undefined && { isTemplate: filters.isTemplate.toString() })
  });

  return apiRequest.get<WorkoutPlansResponse>(`/workouts/plans?${params.toString()}`);
};

// Lấy chi tiết kế hoạch tập luyện
export const getWorkoutPlanById = async (id: string): Promise<{ workoutPlan: WorkoutPlan }> => {
  return apiRequest.get<{ workoutPlan: WorkoutPlan }>(`/workouts/plans/${id}`);
};

// Tạo kế hoạch tập luyện mới
export const createWorkoutPlan = async (data: WorkoutPlanData): Promise<{
  message: string;
  workoutPlan: WorkoutPlan;
}> => {
  return apiRequest.post<{ message: string; workoutPlan: WorkoutPlan }>('/workouts/plans', data);
};

// Cập nhật kế hoạch tập luyện
export const updateWorkoutPlan = async (
  id: string,
  data: Partial<WorkoutPlanData>
): Promise<{ message: string; workoutPlan: WorkoutPlan }> => {
  return apiRequest.put<{ message: string; workoutPlan: WorkoutPlan }>(`/workouts/plans/${id}`, data);
};

// Xóa kế hoạch tập luyện
export const deleteWorkoutPlan = async (id: string): Promise<{ message: string }> => {
  return apiRequest.delete<{ message: string }>(`/workouts/plans/${id}`);
};

// Tự động tạo kế hoạch tập luyện dựa trên mục tiêu
export const generateWorkoutPlan = async (data: GenerateWorkoutPlanData): Promise<{
  message: string;
  workoutPlan: WorkoutPlan;
  recommendations: {
    totalExercises: number;
    estimatedDuration: number;
    estimatedCalories: number;
    muscleGroupsCovered: string[];
  };
}> => {
  return apiRequest.post<{
    message: string;
    workoutPlan: WorkoutPlan;
    recommendations: {
      totalExercises: number;
      estimatedDuration: number;
      estimatedCalories: number;
      muscleGroupsCovered: string[];
    };
  }>('/workouts/plans/generate', data);
};

// Sao chép kế hoạch tập luyện
export const copyWorkoutPlan = async (id: string): Promise<{
  message: string;
  workoutPlan: WorkoutPlan;
}> => {
  return apiRequest.post<{ message: string; workoutPlan: WorkoutPlan }>(`/workouts/plans/${id}/copy`);
};

// WORKOUT SESSIONS

// Lấy danh sách phiên tập luyện
export const getWorkoutSessions = async (
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {},
  page = 1,
  limit = 20
): Promise<WorkoutSessionsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters.status && { status: filters.status }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate })
  });

  return apiRequest.get<WorkoutSessionsResponse>(`/workouts/sessions?${params.toString()}`);
};

// Bắt đầu phiên tập luyện mới
export const startWorkoutSession = async (data: {
  workoutPlanId?: string;
  name?: string;
}): Promise<{
  message: string;
  session: WorkoutSession;
}> => {
  return apiRequest.post<{ message: string; session: WorkoutSession }>('/workouts/sessions', data);
};

// Cập nhật phiên tập luyện
export const updateWorkoutSession = async (
  id: string,
  data: {
    exercises?: any[];
    mood?: string;
    energyLevel?: number;
    difficultyRating?: number;
    notes?: string;
  }
): Promise<{
  message: string;
  session: WorkoutSession;
}> => {
  return apiRequest.put<{ message: string; session: WorkoutSession }>(`/workouts/sessions/${id}`, data);
};

// Hoàn thành phiên tập luyện
export const completeWorkoutSession = async (id: string): Promise<{
  message: string;
  session: WorkoutSession;
}> => {
  return apiRequest.post<{ message: string; session: WorkoutSession }>(`/workouts/sessions/${id}/complete`);
};

export const cancelWorkoutSession = async (id: string): Promise<{
  message: string;
  session: WorkoutSession;
}> => {
  return apiRequest.post<{ message: string; session: WorkoutSession }>(`/workouts/sessions/${id}/cancel`);
};

// Lấy thống kê tập luyện
export const getWorkoutStats = async (
  period: 'week' | 'month' | 'year' = 'month'
): Promise<WorkoutStats> => {
  return apiRequest.get<WorkoutStats>(`/workouts/stats?period=${period}`);
};
