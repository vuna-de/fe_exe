import React, { useState } from 'react';
import './Nutrition.css';
import { 
  PlusIcon,
  FireIcon,
  ScaleIcon,
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
  CakeIcon
} from '@heroicons/react/24/outline';

interface NutritionGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  category: string;
}

interface MealPlan {
  id: number;
  name: string;
  description: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
  imageUrl: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
}

interface ManualMealPlanFormProps {
  onSubmit: (plan: Omit<MealPlan, 'id' | 'imageUrl'>) => void;
  onCancel: () => void;
}

const ManualMealPlanForm: React.FC<ManualMealPlanFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('Kế hoạch mới');
  const [description, setDescription] = useState('Kế hoạch do bạn tự tạo');
  const [totalCalories, setTotalCalories] = useState<number>(2200);
  const [protein, setProtein] = useState<number>(150);
  const [carbs, setCarbs] = useState<number>(250);
  const [fat, setFat] = useState<number>(80);
  const [meals, setMeals] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description, totalCalories, protein, carbs, fat, meals, difficulty });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Tên kế hoạch</label>
          <input className="profile-form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Độ khó</label>
          <select className="profile-form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Mô tả</label>
          <textarea className="profile-form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Calories/ngày</label>
          <input type="number" min={1000} className="profile-form-input" value={totalCalories} onChange={(e) => setTotalCalories(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Protein (g)</label>
          <input type="number" min={0} className="profile-form-input" value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Carbs (g)</label>
          <input type="number" min={0} className="profile-form-input" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Fat (g)</label>
          <input type="number" min={0} className="profile-form-input" value={fat} onChange={(e) => setFat(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Số bữa/ngày</label>
          <input type="number" min={1} max={8} className="profile-form-input" value={meals} onChange={(e) => setMeals(Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Hủy</button>
        <button type="submit" className="btn btn-primary">Lưu kế hoạch</button>
      </div>
    </form>
  );
};

interface AutoMealPlanFormProps {
  onSubmit: (plan: Omit<MealPlan, 'id' | 'imageUrl'>) => void;
  onCancel: () => void;
}

const AutoMealPlanForm: React.FC<AutoMealPlanFormProps> = ({ onSubmit, onCancel }) => {
  const [goal, setGoal] = useState<'giảm cân' | 'duy trì' | 'tăng cơ'>('duy trì');
  const [activity, setActivity] = useState<'thấp' | 'trung bình' | 'cao'>('trung bình');
  const [difficulty, setDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình');

  const computePlan = () => {
    let totalCalories = 2200;
    if (goal === 'giảm cân') totalCalories -= 400;
    if (goal === 'tăng cơ') totalCalories += 300;
    if (activity === 'cao') totalCalories += 200;
    if (activity === 'thấp') totalCalories -= 150;

    const protein = Math.round(totalCalories * 0.3 / 4);
    const fat = Math.round(totalCalories * 0.25 / 9);
    const carbs = Math.round((totalCalories - protein * 4 - fat * 9) / 4);

    return { totalCalories, protein, carbs, fat };
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const macros = computePlan();
    const name = `Kế hoạch ${goal} (${activity})`;
    const description = 'Kế hoạch dinh dưỡng được tạo tự động theo mục tiêu và mức hoạt động.';
    onSubmit({ name, description, meals: 4, difficulty, ...macros });
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Mục tiêu</label>
          <select className="profile-form-select" value={goal} onChange={(e) => setGoal(e.target.value as any)}>
            <option value="giảm cân">Giảm cân</option>
            <option value="duy trì">Duy trì</option>
            <option value="tăng cơ">Tăng cơ</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Mức hoạt động</label>
          <select className="profile-form-select" value={activity} onChange={(e) => setActivity(e.target.value as any)}>
            <option value="thấp">Thấp</option>
            <option value="trung bình">Trung bình</option>
            <option value="cao">Cao</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Độ khó</label>
          <select className="profile-form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </div>
      </div>
      <div className="mt-2 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
        <div className="font-medium mb-2">Ước tính macro</div>
        {(() => { const m = computePlan(); return (
          <div className="flex flex-wrap gap-3">
            <span>🔥 {m.totalCalories} cal</span>
            <span>💪 {m.protein}g P</span>
            <span>🍚 {m.carbs}g C</span>
            <span>🥑 {m.fat}g F</span>
          </div>
        ); })()}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Hủy</button>
        <button type="submit" className="btn btn-primary">Tạo kế hoạch</button>
      </div>
    </form>
  );
};

const Nutrition: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'plans' | 'recipes'>('today');

  const nutritionGoals: NutritionGoal = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 80
  };

  const todayIntake = {
    calories: 1650,
    protein: 120,
    carbs: 180,
    fat: 65
  };

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([
    {
      id: 1,
      name: 'Kế hoạch giảm cân',
      description: 'Thực đơn ít calories, nhiều protein cho mục tiêu giảm cân',
      totalCalories: 1800,
      protein: 140,
      carbs: 150,
      fat: 60,
      meals: 5,
      difficulty: 'Trung bình',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
    },
    {
      id: 2,
      name: 'Tăng cơ bản',
      description: 'Thực đơn high-protein cho việc xây dựng cơ bắp',
      totalCalories: 2800,
      protein: 200,
      carbs: 300,
      fat: 100,
      meals: 6,
      difficulty: 'Khó',
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    },
    {
      id: 3,
      name: 'Duy trì sức khỏe',
      description: 'Thực đơn cân bằng cho việc duy trì cân nặng',
      totalCalories: 2200,
      protein: 150,
      carbs: 250,
      fat: 80,
      meals: 4,
      difficulty: 'Dễ',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'
    }
  ]);

  const [showManual, setShowManual] = useState(false);
  const [showAuto, setShowAuto] = useState(false);

  const addMealPlan = (plan: Omit<MealPlan, 'id' | 'imageUrl'>) => {
    const id = Math.max(0, ...mealPlans.map(p => p.id)) + 1;
    setMealPlans(prev => [{ id, imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', ...plan }, ...prev]);
  };

  const todayMeals = [
    {
      meal: 'Bữa sáng',
      time: '07:30',
      foods: ['Yến mạch với trái cây', 'Sữa chua Hy Lạp', 'Chuối'],
      calories: 450,
      icon: '🌅'
    },
    {
      meal: 'Bữa trưa',
      time: '12:30',
      foods: ['Cơm gạo lứt', 'Ức gà nướng', 'Rau xanh'],
      calories: 650,
      icon: '☀️'
    },
    {
      meal: 'Bữa tối',
      time: '19:00',
      foods: ['Cá hồi nướng', 'Khoai lang', 'Salad'],
      calories: 550,
      icon: '🌙'
    }
  ];

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-primary-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return 'text-green-600 bg-green-100';
      case 'Trung bình': return 'text-yellow-600 bg-yellow-100';
      case 'Khó': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-36 h-36 bg-white opacity-5 rounded-full"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">
                Dinh dưỡng & Thực đơn 🥗
              </h1>
              <p className="text-green-100 text-lg max-w-2xl mb-6">
                Theo dõi lượng calories, macro và vi chất dinh dưỡng hàng ngày. Xây dựng thực đơn khoa học cho mục tiêu của bạn.
              </p>
              <div className="flex items-center space-x-6 text-green-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Theo dõi chính xác</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Thực đơn cá nhân hóa</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => setShowAuto(true)}>
                <ChartBarIcon className="w-5 h-5" />
                <span className="font-semibold">Tạo kế hoạch tự động</span>
              </button>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => setShowManual(true)}>
                <PlusIcon className="w-5 h-5" />
                <span className="font-semibold">Tạo kế hoạch thủ công</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <FireIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{todayIntake.calories}</div>
              <div className="stat-label">Calories hôm nay</div>
              <div className="text-xs text-gray-500">Mục tiêu: {nutritionGoals.calories}</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tiến độ</span>
              <span>{Math.round(getProgressPercentage(todayIntake.calories, nutritionGoals.calories))}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(getProgressPercentage(todayIntake.calories, nutritionGoals.calories))}`}
                style={{ width: `${getProgressPercentage(todayIntake.calories, nutritionGoals.calories)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <ScaleIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{todayIntake.protein}g</div>
              <div className="stat-label">Protein</div>
              <div className="text-xs text-gray-500">Mục tiêu: {nutritionGoals.protein}g</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage(todayIntake.protein, nutritionGoals.protein)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <CakeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{todayIntake.carbs}g</div>
              <div className="stat-label">Carbs</div>
              <div className="text-xs text-gray-500">Mục tiêu: {nutritionGoals.carbs}g</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage(todayIntake.carbs, nutritionGoals.carbs)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              <HeartIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{todayIntake.fat}g</div>
              <div className="stat-label">Chất béo</div>
              <div className="text-xs text-gray-500">Mục tiêu: {nutritionGoals.fat}g</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage(todayIntake.fat, nutritionGoals.fat)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-section mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'today'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('today')}
          >
            Hôm nay
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('plans')}
          >
            Kế hoạch dinh dưỡng
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'recipes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('recipes')}
          >
            Công thức
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'today' && (
        <div className="dashboard-grid">
          {/* Today's Meals */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Bữa ăn hôm nay</h3>
            </div>
            <div className="section-content">
              {todayMeals.map((meal, index) => (
                <div key={index} className="workout-item">
                  <div className="workout-info">
                    <div className="text-2xl mr-4">{meal.icon}</div>
                    <div className="workout-details">
                      <h4>{meal.meal}</h4>
                      <p>{meal.time} • {meal.foods.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{meal.calories} cal</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-footer">
              <button className="view-all-btn">
                <PlusIcon className="w-4 h-4 mr-2" />
                Thêm bữa ăn
              </button>
            </div>
          </div>

          {/* Water Intake */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Nước uống</h3>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">💧</div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1.8L</div>
              <p className="text-sm text-gray-600 mb-4">Mục tiêu: 2.5L</p>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: '72%' }}
                />
              </div>
              
              <button className="btn btn-primary w-full">
                + Thêm 250ml
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <div key={plan.id} className="dashboard-section overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                <img
                  src={plan.imageUrl}
                  alt={plan.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                    {plan.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{plan.totalCalories}</div>
                    <div className="text-gray-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{plan.meals}</div>
                    <div className="text-gray-600">Bữa ăn</div>
                  </div>
                </div>

                <div className="macro-highlight mb-4">
                  <div className="macro-chip cal">{plan.totalCalories} cal</div>
                  <div className="macro-chip p">P: {plan.protein}g</div>
                  <div className="macro-chip c">C: {plan.carbs}g</div>
                  <div className="macro-chip f">F: {plan.fat}g</div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 btn btn-primary">
                    Áp dụng
                  </button>
                  <button className="btn btn-outline">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CakeIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Công thức đang được cập nhật</h3>
          <p className="text-gray-600">Chúng tôi đang chuẩn bị thêm nhiều công thức nấu ăn healthy</p>
        </div>
      )}

      {/* Modals */}
      {showManual && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div className="font-semibold">Tạo kế hoạch bữa ăn (thủ công)</div>
              <button className="logout-btn" onClick={() => setShowManual(false)}>✕</button>
            </div>
            <div className="modal-body">
              <ManualMealPlanForm onSubmit={(p) => { addMealPlan(p); setShowManual(false); }} onCancel={() => setShowManual(false)} />
            </div>
          </div>
        </div>
      )}

      {showAuto && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="font-semibold">Tạo kế hoạch bữa ăn tự động</div>
              <button className="logout-btn" onClick={() => setShowAuto(false)}>✕</button>
            </div>
            <div className="modal-body">
              <AutoMealPlanForm onSubmit={(p) => { addMealPlan(p); setShowAuto(false); }} onCancel={() => setShowAuto(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nutrition;
