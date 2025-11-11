import { apiRequest } from './api';
import { Meal, MealPlan, FoodLog, NutritionStats, NutritionIngredient, MealNutrition } from '../types';

export interface MealFilters {
  category?: string;
  mealType?: string;
  difficulty?: string;
  cuisine?: string;
  search?: string;
  maxPrepTime?: number;
  maxCalories?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface MealMetadata {
  categories: { value: string; label: string }[];
  mealTypes: { value: string; label: string }[];
  difficulties: { value: string; label: string }[];
  cuisines: { value: string; label: string }[];
}

// MEAL SERVICES

// Lấy danh sách meals với bộ lọc
export const getMeals = async (
  filters: MealFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ meals: Meal[]; pagination: any }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.category && { category: filters.category }),
      ...(filters.mealType && { mealType: filters.mealType }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.cuisine && { cuisine: filters.cuisine }),
      ...(filters.search && { search: filters.search }),
      ...(filters.maxPrepTime && { maxPrepTime: filters.maxPrepTime.toString() }),
      ...(filters.maxCalories && { maxCalories: filters.maxCalories.toString() }),
      ...(filters.sort && { sort: filters.sort })
    });

    const response = await apiRequest.get<{ meals: Meal[]; pagination: any }>(`/nutrition/meals?${params.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết meal
export const getMealById = async (id: string): Promise<{ meal: Meal }> => {
  try {
    const response = await apiRequest.get<{ meal: Meal }>(`/nutrition/meals/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Tạo meal mới
export const createMeal = async (mealData: Partial<Meal>): Promise<{ message: string; meal: Meal }> => {
  try {
    const response = await apiRequest.post<{ message: string; meal: Meal }>('/nutrition/meals', mealData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Cập nhật meal
export const updateMeal = async (id: string, mealData: Partial<Meal>): Promise<{ message: string; meal: Meal }> => {
  try {
    const response = await apiRequest.put<{ message: string; meal: Meal }>(`/nutrition/meals/${id}`, mealData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Xóa meal
export const deleteMeal = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiRequest.delete<{ message: string }>(`/nutrition/meals/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Đánh giá meal
export const rateMeal = async (mealId: string, rating: number): Promise<{ message: string; averageRating: number; ratingCount: number }> => {
  try {
    const response = await apiRequest.post<{ message: string; averageRating: number; ratingCount: number }>(`/nutrition/meals/${mealId}/rate`, { rating });
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy metadata cho filters
export const getMealMetadata = async (): Promise<MealMetadata> => {
  try {
    const response = await apiRequest.get<MealMetadata>('/nutrition/meals/categories/list');
    return response;
  } catch (error) {
    throw error;
  }
};

// Tìm kiếm meals
export const searchMeals = async (
  query: string,
  filters: Partial<MealFilters> = {}
): Promise<{ meals: Meal[]; pagination: any }> => {
  return getMeals({ ...filters, search: query });
};

// MEAL PLAN SERVICES

// Lấy danh sách meal plans
export const getMealPlans = async (
  filters: { goal?: string; isTemplate?: boolean } = {},
  page: number = 1,
  limit: number = 20
): Promise<{ mealPlans: MealPlan[]; pagination: any }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.goal && { goal: filters.goal }),
      ...(filters.isTemplate !== undefined && { isTemplate: filters.isTemplate.toString() })
    });

    const response = await apiRequest.get<{ mealPlans: MealPlan[]; pagination: any }>(`/nutrition/meal-plans?${params.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Tạo meal plan mới
export const createMealPlan = async (mealPlanData: Partial<MealPlan>): Promise<{ message: string; mealPlan: MealPlan }> => {
  try {
    const response = await apiRequest.post<{ message: string; mealPlan: MealPlan }>('/nutrition/meal-plans', mealPlanData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Cập nhật meal plan
export const updateMealPlan = async (id: string, mealPlanData: Partial<MealPlan>): Promise<{ message: string; mealPlan: MealPlan }> => {
  try {
    const response = await apiRequest.put<{ message: string; mealPlan: MealPlan }>(`/nutrition/meal-plans/${id}`, mealPlanData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Xóa meal plan
export const deleteMealPlan = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiRequest.delete<{ message: string }>(`/nutrition/meal-plans/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Tạo meal plan tự động
export const generateMealPlan = async (data: {
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general' | 'performance';
  duration: number;
  preferences?: string[];
}): Promise<{ message: string; mealPlan: MealPlan }> => {
  try {
    const response = await apiRequest.post<{ message: string; mealPlan: MealPlan }>('/nutrition/meal-plans/generate', data);
    return response;
  } catch (error) {
    throw error;
  }
};

// FOOD LOG SERVICES

// Lấy food log theo ngày
export const getFoodLog = async (date: string): Promise<{ foodLog: FoodLog | null }> => {
  try {
    const response = await apiRequest.get<{ foodLog: FoodLog | null }>(`/nutrition/food-logs?date=${date}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lưu food log
export const saveFoodLog = async (foodLogData: {
  date: string;
  meals: any[];
  waterIntake?: number;
  notes?: string;
}): Promise<{ message: string; foodLog: FoodLog }> => {
  try {
    const response = await apiRequest.post<{ message: string; foodLog: FoodLog }>('/nutrition/food-logs', foodLogData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy thống kê dinh dưỡng
export const getNutritionStats = async (period: 'week' | 'month' | 'year' = 'week'): Promise<{ stats: NutritionStats }> => {
  try {
    const response = await apiRequest.get<{ stats: NutritionStats }>(`/nutrition/nutrition-stats?period=${period}`);
    return response;
  } catch (error) {
    throw error;
  }
};
