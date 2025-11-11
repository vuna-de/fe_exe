import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  Meal, 
  MealFilters, 
  MealsResponse, 
  MealStats,
  CreateMealData,
  UpdateMealData,
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealStats,
  uploadMealImages,
  deleteMealImage,
  getCategoryLabel,
  getMealTypeLabel,
  getDifficultyLabel,
  getCuisineLabel,
  getDifficultyColor,
  formatTime,
  formatNutrition,
  calculateCaloriesPerServing,
  calculateTotalTime
} from '../services/mealService';
import './AdminMeals.css';

const AdminMeals: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stats, setStats] = useState<MealStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState<MealFilters>({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mealType, setMealType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isPublic, setIsPublic] = useState<boolean | undefined>(undefined);
  
  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  
  // Image upload states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<CreateMealData>({
    name: '',
    description: '',
    category: 'general',
    mealType: 'lunch',
    cuisine: 'vietnamese',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    ingredients: [{ name: '', amount: 0, unit: 'g' }],
    instructions: [''],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    },
    tags: [],
    isActive: true,
    isPublic: true
  });

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [mealsResponse, statsResponse] = await Promise.all([
        getMeals(filters, currentPage, 20),
        getMealStats()
      ]);
      
      setMeals(mealsResponse.meals);
      setTotalPages(mealsResponse.pagination.totalPages);
      setTotalItems(mealsResponse.pagination.totalItems);
      setStats(statsResponse);
    } catch (err) {
      setError('Không thể tải dữ liệu món ăn');
      console.error('Error loading meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters: MealFilters = {
      ...(search && { search }),
      ...(category && { category }),
      ...(mealType && { mealType }),
      ...(difficulty && { difficulty }),
      ...(cuisine && { cuisine }),
      ...(isActive !== undefined && { isActive }),
      ...(isPublic !== undefined && { isPublic })
    };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMealType('');
    setDifficulty('');
    setCuisine('');
    setIsActive(undefined);
    setIsPublic(undefined);
    setFilters({});
    setCurrentPage(1);
  };

  const handleCreateMeal = async () => {
    try {
      await createMeal(formData);
      setShowCreate(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error creating meal:', err);
    }
  };

  const handleUpdateMeal = async () => {
    if (!editingMeal) return;
    
    try {
      await updateMeal(editingMeal._id, formData);
      setShowEdit(false);
      setEditingMeal(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error updating meal:', err);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;
    
    try {
      await deleteMeal(mealId);
      loadData();
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  const handleImageUpload = async (mealId: string) => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploadingImages(true);
      const response = await uploadMealImages(mealId, selectedFiles);
      
      // Cập nhật meal trong state
      setMeals(prev => prev.map(meal => 
        meal._id === mealId 
          ? { ...meal, images: [...(meal.images || []), ...response.images] }
          : meal
      ));
      
      // Reset selected files
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      alert('Upload ảnh thành công!');
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} không phải là file ảnh`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} quá lớn (tối đa 10MB)`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length + selectedFiles.length > 5) {
      alert('Chỉ được chọn tối đa 5 ảnh');
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeleteImage = async (mealId: string, imageId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
    
    try {
      await deleteMealImage(mealId, imageId);
      
      // Cập nhật meal trong state
      setMeals(prev => prev.map(meal => 
        meal._id === mealId 
          ? { ...meal, images: meal.images?.filter(img => img.publicId !== imageId) || [] }
          : meal
      ));
      
      alert('Xóa ảnh thành công!');
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Có lỗi xảy ra khi xóa ảnh');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      mealType: 'lunch',
      cuisine: 'vietnamese',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ingredients: [{ name: '', amount: 0, unit: 'g' }],
      instructions: [''],
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      tags: [],
      isActive: true,
      isPublic: true
    });
    
    // Reset image states
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadingImages(false);
  };

  const openEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description,
      category: meal.category,
      mealType: meal.mealType,
      cuisine: meal.cuisine,
      difficulty: meal.difficulty,
      prepTime: meal.prepTime,
      cookTime: meal.cookTime,
      servings: meal.servings,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      nutrition: meal.nutrition,
      tags: meal.tags,
      isActive: meal.isActive,
      isPublic: meal.isPublic
    });
    setShowEdit(true);
  };

  const openDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowDetails(true);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: 0, unit: 'g' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu món ăn...</p>
      </div>
    );
  }

  return (
    <div className="admin-meals">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Quản lý món ăn</h1>
          <p className="admin-subtitle">Quản lý thực đơn và công thức nấu ăn</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          <PlusIcon className="w-5 h-5" />
          Thêm món ăn
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalMeals}</div>
              <div className="stat-label">Tổng món ăn</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <EyeIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeMeals}</div>
              <div className="stat-label">Món hoạt động</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <HeartIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.publicMeals}</div>
              <div className="stat-label">Món công khai</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FireIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalViews}</div>
              <div className="stat-label">Lượt xem</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-card">
        <h2>Bộ lọc & Tìm kiếm</h2>
        <div className="filters-grid">
          <div>
            <label>Tìm kiếm</label>
            <input 
              placeholder="Tên, mô tả hoặc tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label>Danh mục</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="weight_loss">Giảm cân</option>
              <option value="muscle_gain">Tăng cơ</option>
              <option value="maintenance">Duy trì</option>
              <option value="general">Tổng quát</option>
              <option value="breakfast">Bữa sáng</option>
              <option value="lunch">Bữa trưa</option>
              <option value="dinner">Bữa tối</option>
              <option value="snack">Ăn vặt</option>
            </select>
          </div>
          <div>
            <label>Loại bữa ăn</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="breakfast">Bữa sáng</option>
              <option value="lunch">Bữa trưa</option>
              <option value="dinner">Bữa tối</option>
              <option value="snack">Ăn vặt</option>
            </select>
          </div>
          <div>
            <label>Độ khó</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
          <div>
            <label>Ẩm thực</label>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="vietnamese">Việt Nam</option>
              <option value="western">Tây phương</option>
              <option value="asian">Châu Á</option>
              <option value="mediterranean">Địa Trung Hải</option>
              <option value="mexican">Mexico</option>
              <option value="indian">Ấn Độ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label>Trạng thái</label>
            <select value={isActive === undefined ? '' : String(isActive)} onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}>
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>
          <div>
            <label>Hiển thị công khai</label>
            <select value={isPublic === undefined ? '' : String(isPublic)} onChange={(e) => setIsPublic(e.target.value === '' ? undefined : e.target.value === 'true')}>
              <option value="">Tất cả</option>
              <option value="true">Có</option>
              <option value="false">Không</option>
            </select>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? '⏳' : 'Tìm kiếm'}
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="meals-list">
        {meals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>Chưa có món ăn nào</h3>
            <p>Bắt đầu bằng cách thêm món ăn đầu tiên</p>
          </div>
        ) : (
          <div className="meals-grid">
            {meals.map((meal) => (
              <div key={meal._id} className="meal-card">
                <div className="meal-image">
                  {meal.images && meal.images.length > 0 ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${meal.images[0].url}`} 
                      alt={meal.name} 
                    />
                  ) : (
                    <div className="meal-placeholder">
                      <span>🍽️</span>
                    </div>
                  )}
                  <div className="meal-badges">
                    <span className={`difficulty-badge ${getDifficultyColor(meal.difficulty)}`}>
                      {getDifficultyLabel(meal.difficulty)}
                    </span>
                    {!meal.isActive && <span className="inactive-badge">Không hoạt động</span>}
                    {!meal.isPublic && <span className="private-badge">Riêng tư</span>}
                    {meal.images && meal.images.length > 1 && (
                      <span className="image-count-badge">
                        +{meal.images.length - 1}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="meal-content">
                  <div className="meal-header">
                    <h3 className="meal-title">{meal.name}</h3>
                    <div className="meal-rating">
                      <StarIcon className="w-4 h-4" />
                      <span>{meal.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="meal-description">{meal.description}</p>
                  
                  <div className="meal-meta">
                    <div className="meta-item">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatTime(calculateTotalTime(meal.prepTime, meal.cookTime))}</span>
                    </div>
                    <div className="meta-item">
                      <FireIcon className="w-4 h-4" />
                      <span>{calculateCaloriesPerServing(meal.nutrition.calories, meal.servings)} cal</span>
                    </div>
                    <div className="meta-item">
                      <span>{getCategoryLabel(meal.category)}</span>
                    </div>
                  </div>
                  
                  <div className="meal-stats">
                    <div className="stat">
                      <EyeIcon className="w-4 h-4" />
                      <span>{meal.viewCount}</span>
                    </div>
                    <div className="stat">
                      <HeartIcon className="w-4 h-4" />
                      <span>{meal.likeCount}</span>
                    </div>
                  </div>
                  
                  <div className="meal-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => openDetails(meal)}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Xem
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => openEdit(meal)}
                    >
                      <PencilIcon className="w-4 h-4" />
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteMeal(meal._id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            Trang {currentPage} / {totalPages} ({totalItems} món)
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

      {/* Create/Edit Modal */}
      {(showCreate || showEdit) && (
        <div className="modal-overlay">
          <div className="modal-card large">
            <div className="modal-header">
              <h2>{showCreate ? 'Thêm món ăn mới' : 'Chỉnh sửa món ăn'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCreate(false);
                  setShowEdit(false);
                  setEditingMeal(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); showCreate ? handleCreateMeal() : handleUpdateMeal(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tên món ăn *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Danh mục *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      required
                    >
                      <option value="weight_loss">Giảm cân</option>
                      <option value="muscle_gain">Tăng cơ</option>
                      <option value="maintenance">Duy trì</option>
                      <option value="general">Tổng quát</option>
                      <option value="breakfast">Bữa sáng</option>
                      <option value="lunch">Bữa trưa</option>
                      <option value="dinner">Bữa tối</option>
                      <option value="snack">Ăn vặt</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Loại bữa ăn *</label>
                    <select
                      value={formData.mealType}
                      onChange={(e) => setFormData(prev => ({ ...prev, mealType: e.target.value }))}
                      required
                    >
                      <option value="breakfast">Bữa sáng</option>
                      <option value="lunch">Bữa trưa</option>
                      <option value="dinner">Bữa tối</option>
                      <option value="snack">Ăn vặt</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Ẩm thực</label>
                    <select
                      value={formData.cuisine}
                      onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                    >
                      <option value="vietnamese">Việt Nam</option>
                      <option value="western">Tây phương</option>
                      <option value="asian">Châu Á</option>
                      <option value="mediterranean">Địa Trung Hải</option>
                      <option value="mexican">Mexico</option>
                      <option value="indian">Ấn Độ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Độ khó *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      required
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Thời gian chuẩn bị (phút) *</label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={formData.prepTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Thời gian nấu (phút) *</label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={formData.cookTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Số khẩu phần *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.servings}
                      onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Mô tả *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                
                {/* Ingredients */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>Nguyên liệu</h3>
                    <button type="button" className="btn btn-sm btn-outline" onClick={addIngredient}>
                      <PlusIcon className="w-4 h-4" />
                      Thêm nguyên liệu
                    </button>
                  </div>
                  
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-row">
                      <input
                        type="text"
                        placeholder="Tên nguyên liệu"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Số lượng"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="piece">cái</option>
                        <option value="slice">lát</option>
                        <option value="clove">tép</option>
                        <option value="bunch">bó</option>
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeIngredient(index)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Instructions */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>Các bước thực hiện</h3>
                    <button type="button" className="btn btn-sm btn-outline" onClick={addInstruction}>
                      <PlusIcon className="w-4 h-4" />
                      Thêm bước
                    </button>
                  </div>
                  
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="instruction-row">
                      <span className="step-number">{index + 1}</span>
                      <textarea
                        placeholder="Mô tả bước thực hiện"
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        rows={2}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeInstruction(index)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Nutrition */}
                <div className="form-section">
                  <h3>Thông tin dinh dưỡng (tổng)</h3>
                  <div className="nutrition-grid">
                    <div className="form-group">
                      <label>Calories</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nutrition.calories}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          nutrition: { ...prev.nutrition, calories: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Protein (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nutrition.protein}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          nutrition: { ...prev.nutrition, protein: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Carbs (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nutrition.carbs}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          nutrition: { ...prev.nutrition, carbs: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fat (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nutrition.fat}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          nutrition: { ...prev.nutrition, fat: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fiber (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nutrition.fiber || 0}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          nutrition: { ...prev.nutrition, fiber: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sugar (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nutrition.sugar || 0}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          nutrition: { ...prev.nutrition, sugar: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      Kích hoạt
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      />
                      Hiển thị công khai
                    </label>
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div className="form-section">
                  <h3>Hình ảnh món ăn</h3>
                  
                  {/* File Input */}
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="meal-images"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="meal-images" className="image-upload-button">
                      <PlusIcon className="w-6 h-6" />
                      Chọn ảnh (tối đa 5 ảnh, 10MB mỗi ảnh)
                    </label>
                  </div>
                  
                  {/* Selected Files Preview */}
                  {previewUrls.length > 0 && (
                    <div className="image-preview-grid">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={url} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeSelectedFile(index)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button for Edit Mode */}
                  {showEdit && editingMeal && selectedFiles.length > 0 && (
                    <div className="upload-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleImageUpload(editingMeal._id)}
                        disabled={uploadingImages}
                      >
                        {uploadingImages ? 'Đang upload...' : 'Upload ảnh'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowCreate(false);
                    setShowEdit(false);
                    setEditingMeal(null);
                    resetForm();
                  }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {showCreate ? 'Tạo món ăn' : 'Cập nhật món ăn'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedMeal && (
        <div className="modal-overlay">
          <div className="modal-card large">
            <div className="modal-header">
              <h2>{selectedMeal.name}</h2>
              <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="meal-details">
                <div className="meal-detail-images">
                  {selectedMeal.images && selectedMeal.images.length > 0 ? (
                    <div className="image-gallery">
                      {selectedMeal.images.map((image, index) => (
                        <div key={image.publicId} className="gallery-item">
                          <img 
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image.url}`} 
                            alt={`${selectedMeal.name} ${index + 1}`}
                          />
                          <button
                            className="delete-image-btn"
                            onClick={() => handleDeleteImage(selectedMeal._id, image.publicId)}
                            title="Xóa ảnh"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="meal-placeholder large">
                      <span>🍽️</span>
                    </div>
                  )}
                  
                  {/* Add Image Button */}
                  <div className="add-image-section">
                    <input
                      type="file"
                      id="add-meal-images"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="add-meal-images" className="add-image-button">
                      <PlusIcon className="w-5 h-5" />
                      Thêm ảnh
                    </label>
                    
                    {selectedFiles.length > 0 && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleImageUpload(selectedMeal._id)}
                        disabled={uploadingImages}
                      >
                        {uploadingImages ? 'Đang upload...' : 'Upload ảnh'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="meal-detail-content">
                  <p className="meal-detail-description">{selectedMeal.description}</p>
                  
                  <div className="meal-detail-meta">
                    <div className="meta-item">
                      <span className="meta-label">Danh mục:</span>
                      <span>{getCategoryLabel(selectedMeal.category)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Loại bữa ăn:</span>
                      <span>{getMealTypeLabel(selectedMeal.mealType)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Ẩm thực:</span>
                      <span>{getCuisineLabel(selectedMeal.cuisine)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Độ khó:</span>
                      <span className={`badge ${getDifficultyColor(selectedMeal.difficulty)}`}>
                        {getDifficultyLabel(selectedMeal.difficulty)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Thời gian:</span>
                      <span>{formatTime(calculateTotalTime(selectedMeal.prepTime, selectedMeal.cookTime))}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Khẩu phần:</span>
                      <span>{selectedMeal.servings}</span>
                    </div>
                  </div>
                  
                  <div className="meal-detail-nutrition">
                    <h4>Dinh dưỡng mỗi khẩu phần</h4>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Calories:</span>
                        <span className="nutrition-value">{calculateCaloriesPerServing(selectedMeal.nutrition.calories, selectedMeal.servings)}</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein:</span>
                        <span className="nutrition-value">{formatNutrition(selectedMeal.nutrition.protein / selectedMeal.servings)}</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbs:</span>
                        <span className="nutrition-value">{formatNutrition(selectedMeal.nutrition.carbs / selectedMeal.servings)}</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fat:</span>
                        <span className="nutrition-value">{formatNutrition(selectedMeal.nutrition.fat / selectedMeal.servings)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="meal-detail-ingredients">
                    <h4>Nguyên liệu</h4>
                    <ul>
                      {selectedMeal.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.name} - {ingredient.amount}{ingredient.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="meal-detail-instructions">
                    <h4>Các bước thực hiện</h4>
                    <ol>
                      {selectedMeal.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="meal-detail-stats">
                    <div className="stat">
                      <EyeIcon className="w-5 h-5" />
                      <span>{selectedMeal.viewCount} lượt xem</span>
                    </div>
                    <div className="stat">
                      <HeartIcon className="w-5 h-5" />
                      <span>{selectedMeal.likeCount} lượt thích</span>
                    </div>
                    <div className="stat">
                      <StarIcon className="w-5 h-5" />
                      <span>{selectedMeal.averageRating.toFixed(1)}/5 ({selectedMeal.ratingCount} đánh giá)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMeals;
