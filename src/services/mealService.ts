import api from './api';

export interface Meal {
  _id: string;
  name: string;
  description: string;
  category: string;
  mealType: string;
  cuisine: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  images?: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  tags: string[];
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  isActive: boolean;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  averageRating: number;
  ratingCount: number;
  totalTime?: number;
  caloriesPerServing?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealFilters {
  search?: string;
  category?: string;
  mealType?: string;
  difficulty?: string;
  cuisine?: string;
  isActive?: boolean;
  isPublic?: boolean;
  sort?: string;
}

export interface MealsResponse {
  meals: Meal[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface MealStats {
  totalMeals: number;
  activeMeals: number;
  publicMeals: number;
  totalViews: number;
  totalLikes: number;
  categoryStats: Array<{ _id: string; count: number }>;
  difficultyStats: Array<{ _id: string; count: number }>;
  cuisineStats: Array<{ _id: string; count: number }>;
}

export interface CreateMealData {
  name: string;
  description: string;
  category: string;
  mealType: string;
  cuisine?: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  images?: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdateMealData extends Partial<CreateMealData> {}

// Admin meal management functions
export const getMeals = async (filters: MealFilters = {}, page: number = 1, limit: number = 20): Promise<MealsResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await api.get(`/admin/meals?${params.toString()}`);
  return response.data;
};

export const createMeal = async (mealData: CreateMealData): Promise<{ message: string; meal: Meal }> => {
  const response = await api.post('/admin/meals', mealData);
  return response.data;
};

export const updateMeal = async (mealId: string, mealData: UpdateMealData): Promise<{ message: string; meal: Meal }> => {
  const response = await api.put(`/admin/meals/${mealId}`, mealData);
  return response.data;
};

export const deleteMeal = async (mealId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/meals/${mealId}`);
  return response.data;
};

export const getMealStats = async (): Promise<MealStats> => {
  const response = await api.get('/admin/meals/stats');
  return response.data;
};

// Utility functions
export const getCategoryLabel = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'weight_loss': 'Giảm cân',
    'muscle_gain': 'Tăng cơ',
    'maintenance': 'Duy trì',
    'general': 'Tổng quát',
    'breakfast': 'Bữa sáng',
    'lunch': 'Bữa trưa',
    'dinner': 'Bữa tối',
    'snack': 'Ăn vặt'
  };
  return categoryMap[category] || category;
};

export const getMealTypeLabel = (mealType: string): string => {
  const mealTypeMap: { [key: string]: string } = {
    'breakfast': 'Bữa sáng',
    'lunch': 'Bữa trưa',
    'dinner': 'Bữa tối',
    'snack': 'Ăn vặt'
  };
  return mealTypeMap[mealType] || mealType;
};

export const getDifficultyLabel = (difficulty: string): string => {
  const difficultyMap: { [key: string]: string } = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó'
  };
  return difficultyMap[difficulty] || difficulty;
};

export const getCuisineLabel = (cuisine: string): string => {
  const cuisineMap: { [key: string]: string } = {
    'vietnamese': 'Việt Nam',
    'western': 'Tây phương',
    'asian': 'Châu Á',
    'mediterranean': 'Địa Trung Hải',
    'mexican': 'Mexico',
    'indian': 'Ấn Độ',
    'other': 'Khác'
  };
  return cuisineMap[cuisine] || cuisine;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colorMap: { [key: string]: string } = {
    'easy': 'text-green-600 bg-green-100',
    'medium': 'text-yellow-600 bg-yellow-100',
    'hard': 'text-red-600 bg-red-100'
  };
  return colorMap[difficulty] || 'text-gray-600 bg-gray-100';
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatNutrition = (value: number, unit: string = 'g'): string => {
  return `${Math.round(value)}${unit}`;
};

export const calculateCaloriesPerServing = (totalCalories: number, servings: number): number => {
  return Math.round(totalCalories / servings);
};

export const calculateTotalTime = (prepTime: number, cookTime: number): number => {
  return prepTime + cookTime;
};

// Image upload functions
export const uploadMealImages = async (mealId: string, files: File[]): Promise<{ message: string; images: Array<{ url: string; publicId: string; caption: string }> }> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await api.post(`/admin/meals/${mealId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteMealImage = async (mealId: string, imageId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/meals/${mealId}/images/${imageId}`);
  return response.data;
};
