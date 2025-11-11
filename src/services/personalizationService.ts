import api from './api';

// Types
export interface UserPreferences {
  _id?: string;
  user: string;
  fitnessGoals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  workoutFrequency: number;
  workoutDuration: number;
  availableEquipment: string[];
  preferredWorkoutTypes: string[];
  injuryHistory: InjuryHistory[];
  dietaryRestrictions: string[];
  foodPreferences: string[];
  mealFrequency: number;
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  budgetRange: 'low' | 'medium' | 'high';
  timeConstraints: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    weekend: boolean;
  };
  motivationLevel: number;
  socialPreferences: {
    solo: boolean;
    partner: boolean;
    group: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface InjuryHistory {
  bodyPart: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  recovered: boolean;
  restrictions: string[];
}

export interface WorkoutHistory {
  _id?: string;
  user: string;
  workoutPlan: string;
  session: string;
  exercise: {
    _id: string;
    name: string;
    category: string;
    primaryMuscles: string[];
  };
  performance: {
    sets: WorkoutSet[];
    totalVolume: number;
    maxWeight: number;
    maxReps: number;
    averageRPE: number;
    difficulty: 'too_easy' | 'easy' | 'moderate' | 'hard' | 'too_hard';
    form: 'poor' | 'fair' | 'good' | 'excellent';
    pain: 'none' | 'mild' | 'moderate' | 'severe';
  };
  feedback: {
    enjoyment: number;
    difficulty: number;
    effectiveness: number;
    comments: string;
    wouldRepeat: boolean;
    modifications: string[];
  };
  improvements: string[];
  nextSessionRecommendations: string[];
  createdAt?: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  duration?: number;
  distance?: number;
  restTime: number;
  rpe: number;
  completed: boolean;
  notes?: string;
}

export interface AIWorkoutPlan {
  _id?: string;
  user: string;
  basePlan?: string;
  aiVersion: number;
  generationReason: string;
  algorithm: 'rule_based' | 'ml_recommendation' | 'hybrid';
  personalizationFactors: PersonalizationFactor[];
  adaptations: Adaptation[];
  performancePredictions: PerformancePrediction;
  feedback: {
    userRating: number;
    completionRate: number;
    effectiveness: number;
    comments: string;
    improvements: string[];
  };
  isActive: boolean;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonalizationFactor {
  factor: string;
  weight: number;
  applied: boolean;
}

export interface Adaptation {
  type: string;
  reason: string;
  originalValue: string;
  adaptedValue: string;
  confidence: number;
}

export interface PerformancePrediction {
  expectedDifficulty: number;
  expectedDuration: number;
  expectedCalories: number;
  successProbability: number;
}

export interface NutritionCalculator {
  _id?: string;
  user: string;
  bodyComposition: BodyComposition;
  goals: NutritionGoals;
  calculatedMacros: CalculatedMacros;
  mealPlan: MealPlan;
  restrictions: NutritionRestrictions;
  preferences: NutritionPreferences;
  isActive: boolean;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BodyComposition {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  bodyFatPercentage?: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
}

export interface NutritionGoals {
  primary: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'health';
  targetWeight?: number;
  targetBodyFat?: number;
  timeline?: number;
  priority: 'weight' | 'strength' | 'endurance' | 'aesthetics' | 'health';
}

export interface CalculatedMacros {
  bmr: number;
  tdee: number;
  calories: {
    maintenance: number;
    target: number;
    deficit: number;
    surplus: number;
  };
  protein: MacroNutrient;
  carbs: MacroNutrient;
  fat: MacroNutrient;
  fiber: {
    grams: number;
    per1000Cal: number;
  };
  water: {
    liters: number;
    glasses: number;
  };
}

export interface MacroNutrient {
  grams: number;
  percentage: number;
}

export interface MealPlan {
  mealsPerDay: number;
  mealTiming: MealTiming[];
  weeklyPlan: WeeklyMealPlan[];
}

export interface MealTiming {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  time: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeeklyMealPlan {
  day: string;
  meals: string[];
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface NutritionRestrictions {
  allergies: string[];
  intolerances: string[];
  dietary: string[];
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'moderate' | 'extensive';
}

export interface NutritionPreferences {
  cuisine: string[];
  flavors: string[];
  textures: string[];
  temperature: string[];
  mealSize: 'small' | 'medium' | 'large';
}

export interface AdaptiveLearning {
  _id?: string;
  user: string;
  workoutPatterns: WorkoutPatterns;
  exercisePreferences: ExercisePreferences;
  nutritionPatterns: NutritionPatterns;
  performanceInsights: PerformanceInsights;
  recommendations: Recommendations;
  learningRate: number;
  lastAnalysis: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutPatterns {
  preferredDays: string[];
  preferredTimes: string[];
  averageDuration: number;
  consistency: number;
  progressionRate: number;
}

export interface ExercisePreferences {
  favoriteExercises: FavoriteExercise[];
  avoidedExercises: AvoidedExercise[];
  exerciseCategories: {
    strength: { preference: number; proficiency: number };
    cardio: { preference: number; proficiency: number };
    flexibility: { preference: number; proficiency: number };
    balance: { preference: number; proficiency: number };
  };
}

export interface FavoriteExercise {
  exercise: string;
  frequency: number;
  lastPerformed: string;
  averageRating: number;
}

export interface AvoidedExercise {
  exercise: string;
  reason: string;
  alternative?: string;
}

export interface NutritionPatterns {
  mealTiming: MealTimingPattern[];
  macroPreferences: {
    protein: { preference: number; tolerance: number };
    carbs: { preference: number; tolerance: number };
    fat: { preference: number; tolerance: number };
  };
  foodPreferences: {
    liked: string[];
    disliked: string[];
    allergies: string[];
    intolerances: string[];
  };
}

export interface MealTimingPattern {
  mealType: string;
  averageTime: string;
  consistency: number;
}

export interface PerformanceInsights {
  strengthGains: StrengthGain[];
  enduranceGains: EnduranceGain[];
  plateaus: Plateau[];
  injuries: Injury[];
}

export interface StrengthGain {
  exercise: string;
  improvement: number;
  timeframe: number;
}

export interface EnduranceGain {
  metric: string;
  improvement: number;
  timeframe: number;
}

export interface Plateau {
  exercise: string;
  duration: number;
  resolved: boolean;
  solution: string;
}

export interface Injury {
  bodyPart: string;
  severity: string;
  recoveryTime: number;
  prevention: string[];
}

export interface Recommendations {
  nextWorkout: 'strength' | 'cardio' | 'flexibility' | 'rest' | 'mixed';
  focusAreas: string[];
  avoidAreas: string[];
  intensity: 'low' | 'moderate' | 'high';
  duration: number;
  exercises: string[];
}

export interface Analytics {
  workout: {
    totalWorkouts: number;
    avgRPE: number;
    avgVolume: number;
    consistency: number;
  };
  nutrition: CalculatedMacros;
  aiPlan: {
    totalPlans: number;
    avgRating: number;
    avgCompletion: number;
  };
  period: string;
  generatedAt: string;
}

// API Functions

// User Preferences
export const getPreferences = async (): Promise<UserPreferences> => {
  const response = await api.get('/personalization/preferences');
  return response.data;
};

export const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  const response = await api.post('/personalization/preferences', preferences);
  return response.data;
};

// AI Workout Planner
export const generateAIWorkoutPlan = async (goals: string[], constraints: any = {}): Promise<any> => {
  const response = await api.post('/personalization/ai-workout-plan', { goals, constraints });
  return response.data;
};

export const getCurrentAIWorkoutPlan = async (): Promise<AIWorkoutPlan> => {
  const response = await api.get('/personalization/ai-workout-plan/current');
  return response.data;
};

export const updateAIWorkoutPlanFeedback = async (aiPlanId: string, feedback: any): Promise<AIWorkoutPlan> => {
  const response = await api.post('/personalization/ai-workout-plan/feedback', { aiPlanId, ...feedback });
  return response.data;
};

// Nutrition Calculator
export const calculatePersonalizedNutrition = async (
  bodyComposition: BodyComposition,
  goals: NutritionGoals,
  preferences: any = {}
): Promise<NutritionCalculator> => {
  const response = await api.post('/personalization/nutrition-calculator', {
    bodyComposition,
    goals,
    preferences
  });
  return response.data;
};

export const getCurrentNutritionData = async (): Promise<NutritionCalculator> => {
  const response = await api.get('/personalization/nutrition-calculator/current');
  return response.data;
};

export const getNutritionRecommendations = async (): Promise<any> => {
  const response = await api.get('/personalization/nutrition-calculator/recommendations');
  return response.data;
};

export const trackNutritionProgress = async (date: string, meals: any[]): Promise<any> => {
  const response = await api.post('/personalization/nutrition-calculator/track', { date, meals });
  return response.data;
};

export const getNutritionInsights = async (period: string = 'week'): Promise<any> => {
  const response = await api.get(`/personalization/nutrition-calculator/insights?period=${period}`);
  return response.data;
};

// Workout History
export const saveWorkoutHistory = async (workoutHistory: Partial<WorkoutHistory>): Promise<WorkoutHistory> => {
  const response = await api.post('/personalization/workout-history', workoutHistory);
  return response.data;
};

export const getWorkoutHistory = async (page: number = 1, limit: number = 20): Promise<{
  workoutHistory: WorkoutHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const response = await api.get(`/personalization/workout-history?page=${page}&limit=${limit}`);
  return response.data;
};

// Adaptive Learning
export const getAdaptiveLearning = async (): Promise<AdaptiveLearning> => {
  const response = await api.get('/personalization/adaptive-learning');
  return response.data;
};

export const updateAdaptiveLearning = async (data: Partial<AdaptiveLearning>): Promise<AdaptiveLearning> => {
  const response = await api.post('/personalization/adaptive-learning/update', data);
  return response.data;
};

// Analytics
export const getAnalytics = async (period: string = 'month'): Promise<Analytics> => {
  const response = await api.get(`/personalization/analytics?period=${period}`);
  return response.data;
};

// Advanced quick endpoints
export const generateAdvancedWorkout = async (data: { goal?: string; difficulty?: string }) => {
  const response = await api.post('/personalization/workout/advanced-generate', data);
  return response.data;
};

export const quickNutritionCalculate = async (data: { height: number; weight: number; age: number; gender: string; activityLevel?: string; goal?: string }) => {
  const response = await api.post('/personalization/nutrition/calculate', data);
  return response.data;
};
