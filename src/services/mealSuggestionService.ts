import api from './api';

export interface MealTemplate {
  _id: string;
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  duration: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  mealsPerDay: number;
  dailyMeals: Array<{
    day: number;
    meals: Array<{
      mealType: string;
      meal: {
        _id: string;
        name: string;
        description: string;
        nutrition: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        images?: Array<{
          url: string;
          publicId: string;
          caption?: string;
        }>;
      };
      servings: number;
      notes?: string;
    }>;
  }>;
  tags: string[];
  images?: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  createdBy: {
    _id: string;
    fullName: string;
  };
  viewCount: number;
  likeCount: number;
  averageRating: number;
  ratingCount: number;
  totalCalories?: number;
  totalProtein?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealTemplateFilters {
  goal?: string;
  difficulty?: string;
  duration?: number;
  maxCalories?: number;
  search?: string;
  sort?: string;
}

export interface MealTemplatesResponse {
  templates: MealTemplate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface MealSuggestionRequest {
  goal: string;
  currentWeight?: number;
  height?: number;
  age?: number;
  activityLevel?: string;
  preferences?: string[];
  allergies?: string[];
  duration?: number;
}

export interface MealSuggestionResponse {
  suggestions: MealTemplate[];
  targetCalories: number;
  goal: string;
  duration: number;
}

export interface MealSuggestionStats {
  totalTemplates: number;
  totalViews: number;
  totalLikes: number;
  goalStats: Array<{ _id: string; count: number }>;
  difficultyStats: Array<{ _id: string; count: number }>;
}

export interface MealTemplateMetadata {
  goals: Array<{ value: string; label: string }>;
  difficulties: Array<{ value: string; label: string }>;
  durations: Array<{ value: number; label: string }>;
}

// Meal template functions
export const getMealTemplates = async (filters: MealTemplateFilters = {}, page: number = 1, limit: number = 20): Promise<MealTemplatesResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await api.get(`/meal-suggestions/templates?${params.toString()}`);
  return response.data;
};

export const getMealTemplate = async (templateId: string): Promise<{ template: MealTemplate }> => {
  const response = await api.get(`/meal-suggestions/templates/${templateId}`);
  return response.data;
};

export const createMealTemplate = async (templateData: Partial<MealTemplate>): Promise<{ message: string; template: MealTemplate }> => {
  const response = await api.post('/meal-suggestions/templates', templateData);
  return response.data;
};

export const rateMealTemplate = async (templateId: string, rating: number): Promise<{ message: string; averageRating: number; ratingCount: number }> => {
  const response = await api.post(`/meal-suggestions/templates/${templateId}/rate`, { rating });
  return response.data;
};

export const getMealTemplateMetadata = async (): Promise<MealTemplateMetadata> => {
  const response = await api.get('/meal-suggestions/templates/metadata');
  return response.data;
};

// Meal suggestion functions
export const suggestMeals = async (request: MealSuggestionRequest): Promise<MealSuggestionResponse> => {
  const response = await api.post('/meal-suggestions/suggest', request);
  return response.data;
};

export const getMealSuggestionStats = async (): Promise<MealSuggestionStats> => {
  const response = await api.get('/meal-suggestions/stats');
  return response.data;
};

// Utility functions
export const getGoalLabel = (goal: string): string => {
  const goalMap: { [key: string]: string } = {
    'weight_loss': 'Giảm cân',
    'muscle_gain': 'Tăng cơ',
    'maintenance': 'Duy trì',
    'general': 'Tổng quát',
    'performance': 'Hiệu suất'
  };
  return goalMap[goal] || goal;
};

export const getDifficultyLabel = (difficulty: string): string => {
  const difficultyMap: { [key: string]: string } = {
    'beginner': 'Người mới bắt đầu',
    'intermediate': 'Trung bình',
    'advanced': 'Nâng cao'
  };
  return difficultyMap[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colorMap: { [key: string]: string } = {
    'beginner': 'text-green-600 bg-green-100',
    'intermediate': 'text-yellow-600 bg-yellow-100',
    'advanced': 'text-red-600 bg-red-100'
  };
  return colorMap[difficulty] || 'text-gray-600 bg-gray-100';
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

export const getActivityLevelLabel = (level: string): string => {
  const levelMap: { [key: string]: string } = {
    'sedentary': 'Ít vận động',
    'light': 'Vận động nhẹ',
    'moderate': 'Vận động vừa phải',
    'active': 'Vận động nhiều',
    'very_active': 'Vận động rất nhiều'
  };
  return levelMap[level] || level;
};

export const formatCalories = (calories: number): string => {
  return `${Math.round(calories).toLocaleString()} cal`;
};

export const formatMacros = (protein: number, carbs: number, fat: number): string => {
  return `P: ${Math.round(protein)}g | C: ${Math.round(carbs)}g | F: ${Math.round(fat)}g`;
};

export const calculateBMICategory = (weight: number, height: number): string => {
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi < 25) return 'Bình thường';
  if (bmi < 30) return 'Thừa cân';
  return 'Béo phì';
};

export const getBMIColor = (weight: number, height: number): string => {
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return 'text-blue-600 bg-blue-100';
  if (bmi < 25) return 'text-green-600 bg-green-100';
  if (bmi < 30) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const calculateTargetCalories = (
  weight: number, 
  height: number, 
  age: number, 
  activityLevel: string, 
  goal: string
): number => {
  // Mifflin-St Jeor Equation
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  
  const activityMultipliers: { [key: string]: number } = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  
  let calories = Math.round(bmr * activityMultipliers[activityLevel]);
  
  // Adjust for goal
  if (goal === 'weight_loss') {
    calories = Math.round(calories * 0.8); // 20% deficit
  } else if (goal === 'muscle_gain') {
    calories = Math.round(calories * 1.1); // 10% surplus
  }
  
  return calories;
};

export const calculateMacroDistribution = (calories: number, goal: string) => {
  let proteinRatio, carbRatio, fatRatio;
  
  switch (goal) {
    case 'weight_loss':
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.30;
      break;
    case 'muscle_gain':
      proteinRatio = 0.30;
      carbRatio = 0.45;
      fatRatio = 0.25;
      break;
    default: // maintenance, general, performance
      proteinRatio = 0.25;
      carbRatio = 0.50;
      fatRatio = 0.25;
  }
  
  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 cal/g
    carbs: Math.round((calories * carbRatio) / 4), // 4 cal/g
    fat: Math.round((calories * fatRatio) / 9) // 9 cal/g
  };
};
