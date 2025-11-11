import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ClockIcon, 
  FireIcon,
  StarIcon,
  HeartIcon,
  PlayIcon,
  PlusIcon,
  ChartBarIcon,
  CalendarIcon,
  SparklesIcon,
  BeakerIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Meal, MealPlan, NutritionStats } from '../types';
import { 
  getMeals, 
  getMealMetadata, 
  rateMeal, 
  generateMealPlan,
  getMealPlans,
  getNutritionStats,
  getFoodLog,
  saveFoodLog
} from '../services/nutritionService';
import './Nutrition.css';

interface ManualMealPlanFormProps {
  onSubmit: (plan: Partial<MealPlan>) => void;
  onCancel: () => void;
  initialPlan?: Partial<MealPlan>;
}

const ManualMealPlanForm: React.FC<ManualMealPlanFormProps> = ({ onSubmit, onCancel, initialPlan }) => {
  const [name, setName] = useState(initialPlan?.name || 'Kế hoạch bữa ăn của tôi');
  const [description, setDescription] = useState(initialPlan?.description || 'Tạo thủ công');
  const [duration, setDuration] = useState(initialPlan?.duration || 7);
  const [totalCalories, setTotalCalories] = useState(initialPlan?.totalCalories || 2200);
  const [items, setItems] = useState<Array<{ mealId: string; mealName: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; servings: number }>>(
    (initialPlan?.dailyMeals?.[0]?.meals || []).map(m => ({
      mealId: (m as any).meal,
      mealName: '',
      mealType: (m as any).mealType,
      servings: (m as any).servings || 1
    }))
  );
  // Select options
  const [mealOptions, setMealOptions] = useState<Meal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedServings, setSelectedServings] = useState(1);

  useEffect(() => {
    const loadMealsForSelect = async () => {
      try {
        const resp = await getMeals({}, 1, 100);
        setMealOptions(resp.meals || []);
        // Điền tên món cho items nếu chưa có
        setItems(prev => prev.map(it => ({
          ...it,
          mealName: it.mealName || (resp.meals || []).find((m: any) => m._id === it.mealId)?.name || it.mealName
        })));
      } catch (e) {
        setMealOptions([]);
      }
    };
    loadMealsForSelect();
  }, []);

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      const today = new Date().toISOString().split('T')[0];
      const dailyMeals = items.length > 0 ? [{
        date: today,
        meals: items.map(it => ({ mealType: it.mealType, meal: it.mealId, servings: it.servings }))
      }] : [];
      onSubmit({ name, description, duration, totalCalories, dailyMeals });
    }}>
      <div>
        <label className="text-sm text-gray-600">Tên kế hoạch</label>
        <input className="profile-form-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600">Mô tả</label>
        <textarea className="profile-form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Thời gian (ngày)</label>
          <input type="number" min={1} className="profile-form-input" value={duration} onChange={(e) => setDuration(parseInt(e.target.value||'1'))} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Calories/ngày</label>
          <input type="number" min={800} className="profile-form-input" value={totalCalories} onChange={(e) => setTotalCalories(parseInt(e.target.value||'0'))} />
        </div>
      </div>
      <div className="dashboard-section">
        <div className="section-header">
          <h4 className="section-title">Món đã chọn</h4>
          <div className="flex gap-2"></div>
        </div>
        <div className="p-4 space-y-3">
          {items.length === 0 && (
            <div className="text-sm text-gray-500">Chưa có món nào. Nhấn “+ Thêm món”.</div>
          )}
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Món</label>
                <input className="profile-form-input" value={it.mealName} readOnly />
              </div>
              <div>
                <label className="text-sm text-gray-600">Bữa</label>
                <select className="profile-form-select" value={it.mealType} onChange={(e) => setItems(prev => prev.map((p,i) => i===idx ? { ...p, mealType: e.target.value as any } : p))}>
                  <option value="breakfast">Sáng</option>
                  <option value="lunch">Trưa</option>
                  <option value="dinner">Tối</option>
                  <option value="snack">Phụ</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Khẩu phần</label>
                <input type="number" min={1} className="profile-form-input" value={it.servings} onChange={(e) => setItems(prev => prev.map((p,i) => i===idx ? { ...p, servings: parseInt(e.target.value||'1') } : p))} />
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-outline" onClick={() => setItems(prev => prev.filter((_,i) => i!==idx))}>Xóa</button>
              </div>
            </div>
          ))}

          {/* Add meal row */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Chọn món</label>
              <select className="profile-form-select" value={selectedMealId} onChange={(e) => setSelectedMealId(e.target.value)}>
                <option value="">— Chọn món —</option>
                {mealOptions.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Bữa</label>
              <select className="profile-form-select" value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value as any)}>
                <option value="breakfast">Sáng</option>
                <option value="lunch">Trưa</option>
                <option value="dinner">Tối</option>
                <option value="snack">Phụ</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Khẩu phần</label>
              <input type="number" min={1} className="profile-form-input" value={selectedServings} onChange={(e) => setSelectedServings(parseInt(e.target.value||'1'))} />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline" onClick={() => {
                if (!selectedMealId) return;
                const m = mealOptions.find(o => o._id === selectedMealId);
                if (!m) return;
                setItems(prev => [...prev, { mealId: m._id, mealName: m.name, mealType: selectedMealType, servings: selectedServings }]);
                setSelectedMealId('');
                setSelectedServings(1);
              }}>+ Thêm</button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Hủy</button>
        <button type="submit" className="btn btn-primary">Tạo kế hoạch</button>
      </div>
    </form>
  );
};

const NutritionNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meals' | 'meal-plans' | 'food-log' | 'stats'>('meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [detailPlan, setDetailPlan] = useState<MealPlan | null>(null);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealVideoUrl, setMealVideoUrl] = useState<string | null>(null);
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [maxPrepTime, setMaxPrepTime] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load metadata và data khi component mount
  useEffect(() => {
    loadMetadata();
    loadData();
  }, []);

  // Load data khi tab thay đổi
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load data khi filters thay đổi
  useEffect(() => {
    if (activeTab === 'meals') {
      loadMeals();
    }
  }, [searchTerm, selectedCategory, selectedMealType, selectedDifficulty, selectedCuisine, maxPrepTime, maxCalories, currentPage]);

  const loadMetadata = async () => {
    try {
      const data = await getMealMetadata();
      setMetadata(data);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'meals':
          await loadMeals();
          break;
        case 'meal-plans':
          await loadMealPlans();
          break;
        case 'stats':
          await loadNutritionStats();
          break;
        case 'food-log':
          await loadFoodLog();
          break;
      }
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMeals = async () => {
    const filters = {
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedMealType && { mealType: selectedMealType }),
      ...(selectedDifficulty && { difficulty: selectedDifficulty }),
      ...(selectedCuisine && { cuisine: selectedCuisine }),
      ...(maxPrepTime && { maxPrepTime: parseInt(maxPrepTime) }),
      ...(maxCalories && { maxCalories: parseInt(maxCalories) })
    };

    const response = await getMeals(filters, currentPage, 12);
    setMeals(response.meals);
    setTotalPages(response.pagination.totalPages);
  };

  const loadMealPlans = async () => {
    const response = await getMealPlans({}, 1, 10);
    setMealPlans(response.mealPlans);
  };

  const loadNutritionStats = async () => {
    const response = await getNutritionStats('week');
    setNutritionStats(response.stats);
  };

  const loadFoodLog = async () => {
    // Load today's food log
    const today = new Date().toISOString().split('T')[0];
    const response = await getFoodLog(today);
    // Handle food log data
  };

  const handleRateMeal = async (mealId: string, rating: number) => {
    try {
      await rateMeal(mealId, rating);
      loadMeals();
    } catch (err) {
      console.error('Error rating meal:', err);
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      const response = await generateMealPlan({
        goal: 'muscle_gain',
        duration: 7,
        preferences: []
      });
      setMealPlans(prev => [response.mealPlan, ...prev]);
    } catch (err) {
      console.error('Error generating meal plan:', err);
    }
  };

  const handleCreateManualPlan = (plan: Partial<MealPlan>) => {
    const generated: MealPlan = {
      _id: `local_${Date.now()}`,
      name: plan.name || 'Kế hoạch mới',
      description: plan.description || '',
      user: 'me',
      goal: 'general',
      duration: plan.duration || 7,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + ((plan.duration || 7) * 86400000)).toISOString(),
      dailyMeals: plan.dailyMeals || [],
      totalCalories: plan.totalCalories || 2200,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      isActive: true,
      isTemplate: false,
      isPublic: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMealPlans(prev => [generated, ...prev]);
    setShowManual(false);
  };

  const handleUpdateManualPlan = (planId: string, patch: Partial<MealPlan>) => {
    setMealPlans(prev => prev.map(p => p._id === planId ? {
      ...p,
      ...patch,
      updatedAt: new Date().toISOString()
    } : p));
    setEditingPlan(null);
    setShowManual(false);
  };

  const handleDeletePlan = (planId: string) => {
    setMealPlans(prev => prev.filter(p => p._id !== planId));
  };

  // ===== Video helpers =====
  const extractMealVideoUrl = (meal: Meal): string | null => {
    const anyMeal: any = meal as any;
    const url = anyMeal.videoUrl || anyMeal.video?.url || anyMeal.videos?.[0]?.url || anyMeal.video || null;
    return url || null;
  };

  const toEmbedUrl = (url: string): string => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}` : url;
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const openMealVideo = async (meal: Meal) => {
    setSelectedMeal(meal);
    let url = extractMealVideoUrl(meal);
    if (!url && meal.name) {
      const q = encodeURIComponent(`${meal.name} recipe`);
      url = `https://www.youtube.com/embed?listType=search&list=${q}`;
    }
    setMealVideoUrl(url);
    document.body.style.overflow = 'hidden';
  };

  const closeMealVideo = () => {
    setSelectedMeal(null);
    setMealVideoUrl(null);
    document.body.style.overflow = '';
  };

  const openMealDetails = async (meal: Meal) => {
    setDetailLoading(true);
    setDetailMeal(meal);
    document.body.style.overflow = 'hidden';
    try {
      // có thể gọi API chi tiết nếu cần
    } finally {
      setDetailLoading(false);
    }
  };

  const closeMealDetails = () => {
    setDetailMeal(null);
    setDetailLoading(false);
    document.body.style.overflow = '';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-easy';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  const getCategoryLabel = (category: string) => {
    return metadata?.categories?.find((cat: any) => cat.value === category)?.label || category;
  };

  const getCuisineLabel = (cuisine: string) => {
    return metadata?.cuisines?.find((c: any) => c.value === cuisine)?.label || cuisine;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu dinh dưỡng...</p>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Header */}
      <div className="nutrition-header">
        <div className="relative z-10 text-center">
          <h1 className="nutrition-title">
            Dinh dưỡng & Thực đơn 🍽️
          </h1>
          <p className="nutrition-subtitle">
            Khám phá thực đơn lành mạnh, công thức nấu ăn và kế hoạch dinh dưỡng 
            phù hợp với mục tiêu sức khỏe của bạn
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">100+</span> Món ăn
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">50+</span> Công thức
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">10+</span> Kế hoạch
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nutrition-tabs">
        <button
          className={`nutrition-tab ${activeTab === 'meals' ? 'active' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          <BeakerIcon className="w-5 h-5" />
          Thực đơn
        </button>
        <button
          className={`nutrition-tab ${activeTab === 'meal-plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('meal-plans')}
        >
          <CalendarIcon className="w-5 h-5" />
          Kế hoạch
        </button>
        <button
          className={`nutrition-tab ${activeTab === 'food-log' ? 'active' : ''}`}
          onClick={() => setActiveTab('food-log')}
        >
          <ChartBarIcon className="w-5 h-5" />
          Nhật ký
        </button>
        <button
          className={`nutrition-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <UserGroupIcon className="w-5 h-5" />
          Thống kê
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'meals' && (
        <>
          {/* Search and Filters */}
          <div className="nutrition-filters">
            <div className="search-container">
              <MagnifyingGlassIcon className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả danh mục</option>
                  {metadata?.categories?.map((category: any) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Bữa ăn</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả bữa ăn</option>
                  {metadata?.mealTypes?.map((mealType: any) => (
                    <option key={mealType.value} value={mealType.value}>
                      {mealType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Độ khó</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả độ khó</option>
                  {metadata?.difficulties?.map((difficulty: any) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Ẩm thực</label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả ẩm thực</option>
                  {metadata?.cuisines?.map((cuisine: any) => (
                    <option key={cuisine.value} value={cuisine.value}>
                      {cuisine.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Meals Grid */}
          {!loading && !error && (
            <div className="meals-grid">
              {meals.map((meal, index) => (
                <div 
                  key={meal._id} 
                  className="meal-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="meal-image-container">
                    {meal.images && meal.images.length > 0 ? (
                      <img
                        src={meal.images[0].url}
                        alt={meal.name}
                        className="meal-image"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <BeakerIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="meal-overlay"></div>
                    
                    <button className="meal-play-button" onClick={() => openMealVideo(meal)}>
                      <PlayIcon className="w-6 h-6 text-gray-700" />
                    </button>

                    <div className="meal-badges">
                      <span className={`difficulty-badge ${getDifficultyColor(meal.difficulty)}`}>
                        {getDifficultyLabel(meal.difficulty)}
                      </span>
                      <button 
                        className="favorite-button"
                        onClick={() => handleRateMeal(meal._id, 5)}
                      >
                        <HeartIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="meal-stats">
                      <div className="meal-stat">
                        <ClockIcon className="w-4 h-4" />
                        <span>{meal.totalTime || (meal.prepTime + meal.cookTime)} phút</span>
                      </div>
                      <div className="meal-stat">
                        <FireIcon className="w-4 h-4" />
                        <span>{meal.caloriesPerServing || Math.round(meal.nutrition.calories / meal.servings)} cal</span>
                      </div>
                    </div>
                  </div>

                  <div className="meal-content">
                    <div className="meal-header">
                      <h3 className="meal-title">
                        {meal.name}
                      </h3>
                      {meal.averageRating > 0 && (
                        <div className="meal-rating">
                          <StarIcon className="star-icon" />
                          <span>{meal.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="meal-categories">
                      <span className="meal-category">
                        {getCategoryLabel(meal.category)}
                      </span>
                      <span className="meal-cuisine">
                        {getCuisineLabel(meal.cuisine)}
                      </span>
                    </div>

                    <p className="meal-description">
                      {meal.description}
                    </p>

                    <div className="meal-nutrition">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein:</span>
                        <span className="nutrition-value">{Math.round(meal.nutrition.protein / meal.servings)}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbs:</span>
                        <span className="nutrition-value">{Math.round(meal.nutrition.carbs / meal.servings)}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fat:</span>
                        <span className="nutrition-value">{Math.round(meal.nutrition.fat / meal.servings)}g</span>
                      </div>
                    </div>

                    <div className="meal-actions">
                      <button className="action-button action-button-primary" onClick={() => openMealVideo(meal)}>
                        <PlayIcon className="w-4 h-4" />
                        Xem công thức
                      </button>
                      <button className="action-button action-button-secondary" onClick={() => openMealDetails(meal)}>
                        <PlusIcon className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Trước
              </button>
              
              <div className="pagination-info">
                Trang {currentPage} / {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {detailMeal && (
        <div className="video-modal-overlay" onClick={closeMealDetails}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeMealDetails} aria-label="Đóng">×</button>
            <h3 className="video-modal-title">{detailMeal.name}</h3>

            {detailLoading ? (
              <div className="loading-container"><div className="loading-spinner"></div></div>
            ) : (
              <div className="detail-content">
                {detailMeal.images?.[0]?.url && (
                  <img className="detail-cover" src={detailMeal.images[0].url} alt={detailMeal.name} />
                )}

                <div className="detail-chips">
                  {detailMeal.category && (
                    <span className="chip chip-primary">{getCategoryLabel(detailMeal.category)}</span>
                  )}
                  {detailMeal.difficulty && (
                    <span className={`chip ${getDifficultyColor(detailMeal.difficulty)}`}>{getDifficultyLabel(detailMeal.difficulty)}</span>
                  )}
                  {detailMeal.mealType && (
                    <span className="chip">🍽️ {detailMeal.mealType}</span>
                  )}
                  {detailMeal.cuisine && (
                    <span className="chip">🌎 {getCuisineLabel(detailMeal.cuisine)}</span>
                  )}
                  <span className="chip">⏱ {(detailMeal.totalTime || (detailMeal.prepTime + detailMeal.cookTime))} phút</span>
                  <span className="chip">🔥 {detailMeal.caloriesPerServing || Math.round(detailMeal.nutrition.calories / detailMeal.servings)} cal/khẩu phần</span>
                </div>

                <div className="detail-grid">
                  <div className="detail-section">
                    <h4>Mô tả</h4>
                    <p className="detail-text">{detailMeal.description || '—'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Nguyên liệu</h4>
                    <ul className="detail-list">
                      {detailMeal.ingredients?.length ? detailMeal.ingredients.map((ing, i) => (
                        <li key={i}>{ing.name} — {ing.amount}{ing.unit}</li>
                      )) : <li>—</li>}
                    </ul>
                  </div>

                  <div className="detail-section detail-span-2">
                    <h4>Các bước thực hiện</h4>
                    <ol className="detail-steps">
                      {detailMeal.instructions?.length ? detailMeal.instructions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      )) : <li>—</li>}
                    </ol>
                  </div>

                  <div className="detail-section">
                    <h4>Dinh dưỡng mỗi khẩu phần</h4>
                    <div className="nutrition-grid">
                      <span className="tag">Protein: {Math.round((detailMeal.nutrition.protein || 0) / detailMeal.servings)}g</span>
                      <span className="tag">Carbs: {Math.round((detailMeal.nutrition.carbs || 0) / detailMeal.servings)}g</span>
                      <span className="tag">Fat: {Math.round((detailMeal.nutrition.fat || 0) / detailMeal.servings)}g</span>
                      {typeof (detailMeal.nutrition as any).fiber === 'number' && (
                        <span className="tag">Fiber: {Math.round((((detailMeal.nutrition as any).fiber) || 0) / detailMeal.servings)}g</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Video Modal */}
      {selectedMeal && (
        <div className="video-modal-overlay" onClick={closeMealVideo}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeMealVideo} aria-label="Đóng video">×</button>
            <h3 className="video-modal-title">{selectedMeal.name}</h3>
            {mealVideoUrl ? (
              <div className="video-wrapper">
                {toEmbedUrl(mealVideoUrl).includes('youtube.com/embed') ? (
                  <iframe
                    className="video-iframe"
                    src={toEmbedUrl(mealVideoUrl)}
                    title={selectedMeal.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video className="video-player" src={mealVideoUrl} controls autoPlay />
                )}
              </div>
            ) : (
              <div className="video-fallback">
                {selectedMeal?.images?.[0]?.url ? (
                  <img src={selectedMeal.images[0].url} alt={selectedMeal.name} style={{maxWidth:'100%', borderRadius: '8px'}} />
                ) : (
                  <p>Không tìm thấy video cho món ăn này.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'meal-plans' && (
        <div className="meal-plans-section">
          <div className="section-header">
            <h2 className="section-title">Kế hoạch bữa ăn</h2>
            <div className="flex gap-2">
              <button 
                className="btn-secondary"
                onClick={() => setShowManual(true)}
              >
                <PlusIcon className="w-5 h-5" />
                Tạo thủ công
              </button>
              <button 
                className="btn-primary"
                onClick={handleGenerateMealPlan}
              >
                <SparklesIcon className="w-5 h-5" />
                Tạo tự động
              </button>
            </div>
          </div>
          
          <div className="meal-plans-grid">
            {mealPlans.map((plan) => (
              <div key={plan._id} className="meal-plan-card">
                <h3 className="meal-plan-title">{plan.name}</h3>
                <p className="meal-plan-description">{plan.description}</p>
                <div className="meal-plan-stats">
                  <div className="stat">
                    <span className="stat-label">Mục tiêu:</span>
                    <span className="stat-value">{getCategoryLabel(plan.goal)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Thời gian:</span>
                    <span className="stat-value">{plan.duration} ngày</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Calories:</span>
                    <span className="stat-value">{plan.totalCalories}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="action-button action-button-secondary" onClick={() => setDetailPlan(plan)}>Chi tiết</button>
                  <button className="action-button action-button-primary" onClick={() => { setEditingPlan(plan); setShowManual(true); }}>Chỉnh sửa</button>
                  <button className="action-button" onClick={() => handleDeletePlan(plan._id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual plan modal */}
      {showManual && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="font-semibold">{editingPlan ? 'Chỉnh sửa kế hoạch bữa ăn' : 'Tạo kế hoạch bữa ăn (thủ công)'}</div>
              <button className="logout-btn" onClick={() => setShowManual(false)}>✕</button>
            </div>
            <div className="modal-body">
              <ManualMealPlanForm
                onSubmit={(p) => editingPlan ? handleUpdateManualPlan(editingPlan._id, p) : handleCreateManualPlan(p)}
                onCancel={() => setShowManual(false)}
                initialPlan={editingPlan || undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailPlan && (
        <div className="modal-overlay" onClick={() => setDetailPlan(null)}>
          <div className="modal-card" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="font-semibold">Chi tiết kế hoạch</div>
              <button className="logout-btn" onClick={() => setDetailPlan(null)}>✕</button>
            </div>
            <div className="modal-body p-6">
              <h3 className="text-lg font-semibold mb-2">{detailPlan.name}</h3>
              <p className="text-gray-600 mb-4">{detailPlan.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div><span className="font-medium">Mục tiêu:</span> {getCategoryLabel(detailPlan.goal)}</div>
                <div><span className="font-medium">Thời gian:</span> {detailPlan.duration} ngày</div>
                <div><span className="font-medium">Calories/ngày:</span> {detailPlan.totalCalories}</div>
              </div>
              <div className="border-t pt-4">
                <div className="font-medium mb-2">Ngày đầu tiên</div>
                {(detailPlan.dailyMeals?.[0]?.meals || []).length === 0 ? (
                  <div className="text-sm text-gray-500">Chưa có món trong ngày đầu.</div>
                ) : (
                  <div className="space-y-2">
                    {detailPlan.dailyMeals[0].meals.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="text-sm">🍽️ {m.mealType} — {typeof m.meal === 'string' ? m.meal : (m.meal as any)?.name || 'Món'}</div>
                        <div className="text-sm">Khẩu phần: {m.servings}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && nutritionStats && (
        <div className="nutrition-stats-section">
          <h2 className="section-title">Thống kê dinh dưỡng</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FireIcon className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{nutritionStats.averageCalories}</div>
                <div className="stat-label">Calories trung bình/ngày</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{nutritionStats.averageProtein}g</div>
                <div className="stat-label">Protein trung bình/ngày</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{nutritionStats.daysLogged}</div>
                <div className="stat-label">Ngày đã ghi nhật ký</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NutritionNew;
