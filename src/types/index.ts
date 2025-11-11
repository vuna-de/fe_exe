// User types
export interface User {
  _id: string;
  email: string;
  phone?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  role: 'user' | 'trainer' | 'admin';
  membershipType: 'basic' | 'premium';
  membershipExpiry?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  totalWorkouts: number;
  joinedDate: string;
  age?: number;
  bmi?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens?: AuthTokens;
  emailVerificationToken?: string;
}

// Exercise types
export interface Exercise {
  _id: string;
  name: string;
  description: string;
  instructions: string[];
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';
  equipment: string[];
  images: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  videos: Array<{
    url: string;
    publicId: string;
    title?: string;
    duration?: number;
  }>;
  caloriesPerMinute?: number;
  estimatedDuration?: number;
  defaultSets: number;
  defaultReps: {
    min: number;
    max: number;
  };
  createdBy: {
    _id: string;
    fullName: string;
  };
  isActive: boolean;
  isPublic: boolean;
  tags: string[];
  viewCount: number;
  likeCount: number;
  averageRating: number;
  ratingCount: number;
  estimatedCalories?: number;
  createdAt: string;
  updatedAt: string;
}

// Workout types
export interface WorkoutPlanExercise {
  exercise: string | Exercise;
  plannedSets: number;
  plannedReps?: {
    min?: number;
    max?: number;
  };
  plannedWeight?: number;
  plannedDuration?: number;
  plannedDistance?: number;
  restTime: number;
  notes?: string;
  order: number;
}

export interface WorkoutPlan {
  _id: string;
  name: string;
  description?: string;
  user: string | User;
  trainer?: string | User;
  category: 'strength' | 'muscle_gain' | 'weight_loss' | 'endurance' | 'flexibility' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  frequency: 'daily' | 'every_other_day' | 'weekly' | 'custom';
  exercises: WorkoutPlanExercise[];
  isActive: boolean;
  isTemplate: boolean;
  isPublic: boolean;
  tags: string[];
  totalCalories: number;
  completedCount: number;
  averageRating: number;
  ratingCount: number;
  exerciseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface WorkoutSessionExercise {
  exercise: string | Exercise;
  plannedSets?: number;
  plannedReps?: {
    min?: number;
    max?: number;
  };
  plannedWeight?: number;
  sets: WorkoutSet[];
  completed: boolean;
  notes?: string;
  order: number;
}

export interface WorkoutSession {
  _id: string;
  user: string | User;
  workoutPlan?: string | WorkoutPlan;
  name: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  exercises: WorkoutSessionExercise[];
  totalCaloriesBurned: number;
  totalDuration: number;
  completionRate: number;
  mood?: 'terrible' | 'bad' | 'okay' | 'good' | 'excellent';
  energyLevel?: number;
  difficultyRating?: number;
  notes?: string;
  media: Array<{
    type: string;
    url: string;
    publicId: string;
  }>;
  actualDuration: number;
  createdAt: string;
  updatedAt: string;
}

// Nutrition types
export interface NutritionIngredient {
  name: string;
  amount: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Meal {
  _id: string;
  name: string;
  description: string;
  category: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cuisine: 'vietnamese' | 'western' | 'asian' | 'mediterranean' | 'mexican' | 'indian' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: NutritionIngredient[];
  instructions: string[];
  nutrition: MealNutrition;
  images: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  tags: string[];
  createdBy: {
    _id: string;
    fullName: string;
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

export interface MealPlan {
  _id: string;
  name: string;
  description?: string;
  user: string;
  nutritionist?: {
    _id: string;
    fullName: string;
  };
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general' | 'performance';
  duration: number;
  startDate: string;
  endDate: string;
  dailyMeals: Array<{
    date: string;
    meals: Array<{
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      meal: string;
      servings: number;
      notes?: string;
    }>;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  isActive: boolean;
  isTemplate: boolean;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodLog {
  _id: string;
  user: string;
  date: string;
  meals: Array<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    meal?: string;
    customFood?: {
      name: string;
      nutrition: MealNutrition;
    };
    servings: number;
    notes?: string;
    loggedAt: string;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWater: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageWater: number;
  daysLogged: number;
  period: string;
}

// Payment types
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

export interface MacroNutrient {
  grams: number;
  calories: number;
  percentage: number;
}

export interface MacroCalculation {
  calories: number;
  protein: MacroNutrient;
  carbs: MacroNutrient;
  fat: MacroNutrient;
}

// API Response types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// API Response formats for specific endpoints
export interface ExercisesResponse {
  exercises: Exercise[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface WorkoutPlansResponse {
  workoutPlans: WorkoutPlan[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface WorkoutSessionsResponse {
  sessions: WorkoutSession[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ExerciseFilters {
  category?: string;
  difficulty?: string;
  type?: string;
  equipment?: string[];
  muscles?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface WorkoutFilters {
  category?: string;
  difficulty?: string;
  isTemplate?: boolean;
  page?: number;
  limit?: number;
}

export interface SessionFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Form types
export interface UpdateProfileForm {
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// State types
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  auth: AuthState;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// Error types
export interface ApiError {
  error: string;
  details?: any;
  code?: string;
}
