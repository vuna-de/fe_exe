import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  HeartIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  CalculatorIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { 
  MealTemplate,
  MealTemplateFilters,
  MealTemplatesResponse,
  MealSuggestionRequest,
  MealSuggestionResponse,
  MealSuggestionStats,
  MealTemplateMetadata,
  getMealTemplates,
  getMealTemplate,
  suggestMeals,
  getMealSuggestionStats,
  getMealTemplateMetadata,
  getGoalLabel,
  getDifficultyLabel,
  getDifficultyColor,
  getMealTypeLabel,
  getActivityLevelLabel,
  formatCalories,
  formatMacros,
  calculateBMICategory,
  getBMIColor,
  calculateTargetCalories,
  calculateMacroDistribution
} from '../services/mealSuggestionService';
import './MealSuggestions.css';

const MealSuggestions: React.FC = () => {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [suggestions, setSuggestions] = useState<MealTemplate[]>([]);
  const [stats, setStats] = useState<MealSuggestionStats | null>(null);
  const [metadata, setMetadata] = useState<MealTemplateMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState<MealTemplateFilters>({});
  const [search, setSearch] = useState('');
  const [goal, setGoal] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [duration, setDuration] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  
  // Suggestion form
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState<MealSuggestionRequest>({
    goal: 'maintenance',
    activityLevel: 'moderate',
    duration: 7
  });
  
  // Modal states
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
  const [showSuggestionResults, setShowSuggestionResults] = useState(false);
  const [suggestionResults, setSuggestionResults] = useState<MealSuggestionResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [templatesResponse, statsResponse, metadataResponse] = await Promise.all([
        getMealTemplates(filters, currentPage, 12),
        getMealSuggestionStats(),
        getMealTemplateMetadata()
      ]);
      
      setTemplates(templatesResponse.templates);
      setTotalPages(templatesResponse.pagination.totalPages);
      setTotalItems(templatesResponse.pagination.totalItems);
      setStats(statsResponse);
      setMetadata(metadataResponse);
    } catch (err) {
      setError('Không thể tải dữ liệu gợi ý thực đơn');
      console.error('Error loading meal suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters: MealTemplateFilters = {
      ...(search && { search }),
      ...(goal && { goal }),
      ...(difficulty && { difficulty }),
      ...(duration && { duration: parseInt(duration) }),
      ...(maxCalories && { maxCalories: parseInt(maxCalories) })
    };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setGoal('');
    setDifficulty('');
    setDuration('');
    setMaxCalories('');
    setFilters({});
    setCurrentPage(1);
  };

  const handleSuggestMeals = async () => {
    try {
      setLoading(true);
      const response = await suggestMeals(suggestionForm);
      setSuggestionResults(response);
      setSuggestions(response.suggestions);
      setShowSuggestionResults(true);
      setShowSuggestionForm(false);
    } catch (err) {
      console.error('Error suggesting meals:', err);
      alert('Có lỗi xảy ra khi gợi ý thực đơn');
    } finally {
      setLoading(false);
    }
  };

  const openTemplateDetail = async (templateId: string) => {
    try {
      const response = await getMealTemplate(templateId);
      setSelectedTemplate(response.template);
      setShowTemplateDetail(true);
    } catch (err) {
      console.error('Error loading template detail:', err);
    }
  };

  const calculatePersonalizedCalories = () => {
    if (suggestionForm.currentWeight && suggestionForm.height && suggestionForm.age) {
      return calculateTargetCalories(
        suggestionForm.currentWeight,
        suggestionForm.height,
        suggestionForm.age,
        suggestionForm.activityLevel || 'moderate',
        suggestionForm.goal
      );
    }
    return 2000; // Default
  };

  const calculatePersonalizedMacros = () => {
    const calories = calculatePersonalizedCalories();
    return calculateMacroDistribution(calories, suggestionForm.goal);
  };

  if (loading && templates.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-gray-600">Đang tải gợi ý thực đơn...</p>
      </div>
    );
  }

  return (
    <div className="meal-suggestions">
      {/* Header */}
      <div className="suggestions-header">
        <div>
          <h1 className="suggestions-title">Gợi ý Thực đơn 🍽️</h1>
          <p className="suggestions-subtitle">
            Khám phá thực đơn mẫu và nhận gợi ý cá nhân hóa dựa trên mục tiêu của bạn
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowSuggestionForm(true)}
        >
          <SparklesIcon className="w-5 h-5" />
          Gợi ý cá nhân hóa
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BeakerIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalTemplates}</div>
              <div className="stat-label">Thực đơn mẫu</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <EyeIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalViews}</div>
              <div className="stat-label">Lượt xem</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <HeartIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalLikes}</div>
              <div className="stat-label">Lượt thích</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.goalStats.length}</div>
              <div className="stat-label">Mục tiêu</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-card">
        <h2>Tìm kiếm thực đơn</h2>
        <div className="filters-grid">
          <div>
            <label>Tìm kiếm</label>
            <input 
              placeholder="Tên thực đơn, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label>Mục tiêu</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="">Tất cả mục tiêu</option>
              {metadata?.goals?.map(goalOption => (
                <option key={goalOption.value} value={goalOption.value}>
                  {goalOption.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Độ khó</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Tất cả độ khó</option>
              {metadata?.difficulties?.map(diff => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Thời gian</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="">Tất cả thời gian</option>
              {metadata?.durations?.map(dur => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Calories tối đa</label>
            <input 
              type="number"
              placeholder="VD: 2000"
              value={maxCalories}
              onChange={(e) => setMaxCalories(e.target.value)}
            />
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

      {/* Templates Grid */}
      <div className="templates-section">
        <h2>Thực đơn mẫu phổ biến</h2>
        {templates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>Không tìm thấy thực đơn nào</h3>
            <p>Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template._id} className="template-card">
                <div className="template-image">
                  {template.images && template.images.length > 0 ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${template.images[0].url}`} 
                      alt={template.name} 
                    />
                  ) : (
                    <div className="template-placeholder">
                      <span>🍽️</span>
                    </div>
                  )}
                  <div className="template-badges">
                    <span className={`difficulty-badge ${getDifficultyColor(template.difficulty)}`}>
                      {getDifficultyLabel(template.difficulty)}
                    </span>
                    <span className="goal-badge">
                      {getGoalLabel(template.goal)}
                    </span>
                  </div>
                </div>
                
                <div className="template-content">
                  <div className="template-header">
                    <h3 className="template-title">{template.name}</h3>
                    <div className="template-rating">
                      <StarIcon className="w-4 h-4" />
                      <span>{template.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-meta">
                    <div className="meta-item">
                      <ClockIcon className="w-4 h-4" />
                      <span>{template.duration} ngày</span>
                    </div>
                    <div className="meta-item">
                      <FireIcon className="w-4 h-4" />
                      <span>{formatCalories(template.targetCalories)}</span>
                    </div>
                    <div className="meta-item">
                      <span>{template.mealsPerDay} bữa/ngày</span>
                    </div>
                  </div>
                  
                  <div className="template-macros">
                    <span className="macro-item">P: {Math.round(template.targetProtein)}g</span>
                    <span className="macro-item">C: {Math.round(template.targetCarbs)}g</span>
                    <span className="macro-item">F: {Math.round(template.targetFat)}g</span>
                  </div>
                  
                  <div className="template-stats">
                    <div className="stat">
                      <EyeIcon className="w-4 h-4" />
                      <span>{template.viewCount}</span>
                    </div>
                    <div className="stat">
                      <HeartIcon className="w-4 h-4" />
                      <span>{template.likeCount}</span>
                    </div>
                  </div>
                  
                  <div className="template-actions">
                    <button 
                      className="btn btn-outline"
                      onClick={() => openTemplateDetail(template._id)}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setSuggestionForm(prev => ({ ...prev, goal: template.goal }));
                        setShowSuggestionForm(true);
                      }}
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Áp dụng
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
            Trang {currentPage} / {totalPages} ({totalItems} thực đơn)
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

      {/* Suggestion Form Modal */}
      {showSuggestionForm && (
        <div className="modal-overlay">
          <div className="modal-card large">
            <div className="modal-header">
              <h2>Gợi ý thực đơn cá nhân hóa</h2>
              <button className="modal-close" onClick={() => setShowSuggestionForm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSuggestMeals(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mục tiêu *</label>
                    <select
                      value={suggestionForm.goal}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, goal: e.target.value }))}
                      required
                    >
                      {metadata?.goals?.map(goalOption => (
                        <option key={goalOption.value} value={goalOption.value}>
                          {goalOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Thời gian (ngày)</label>
                    <select
                      value={suggestionForm.duration}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    >
                      {metadata?.durations?.map(dur => (
                        <option key={dur.value} value={dur.value}>
                          {dur.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Cân nặng (kg)</label>
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={suggestionForm.currentWeight || ''}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, currentWeight: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Chiều cao (cm)</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={suggestionForm.height || ''}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, height: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tuổi</label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={suggestionForm.age || ''}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Mức độ hoạt động</label>
                    <select
                      value={suggestionForm.activityLevel}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, activityLevel: e.target.value }))}
                    >
                      <option value="sedentary">Ít vận động</option>
                      <option value="light">Vận động nhẹ</option>
                      <option value="moderate">Vận động vừa phải</option>
                      <option value="active">Vận động nhiều</option>
                      <option value="very_active">Vận động rất nhiều</option>
                    </select>
                  </div>
                </div>
                
                {/* Personalized Calculation Preview */}
                {suggestionForm.currentWeight && suggestionForm.height && suggestionForm.age && (
                  <div className="calculation-preview">
                    <h3>Ước tính dinh dưỡng của bạn</h3>
                    <div className="calculation-grid">
                      <div className="calc-item">
                        <span className="calc-label">Calories mục tiêu:</span>
                        <span className="calc-value">{formatCalories(calculatePersonalizedCalories())}</span>
                      </div>
                      <div className="calc-item">
                        <span className="calc-label">BMI:</span>
                        <span className={`calc-value ${getBMIColor(suggestionForm.currentWeight, suggestionForm.height)}`}>
                          {calculateBMICategory(suggestionForm.currentWeight, suggestionForm.height)}
                        </span>
                      </div>
                      <div className="calc-item">
                        <span className="calc-label">Macros:</span>
                        <span className="calc-value">{(() => {
                          const macros = calculatePersonalizedMacros();
                          return formatMacros(macros.protein, macros.carbs, macros.fat);
                        })()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSuggestionForm(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang gợi ý...' : 'Gợi ý thực đơn'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Template Detail Modal */}
      {showTemplateDetail && selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-card large">
            <div className="modal-header">
              <h2>{selectedTemplate.name}</h2>
              <button className="modal-close" onClick={() => setShowTemplateDetail(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="template-detail">
                <div className="template-detail-image">
                  {selectedTemplate.images && selectedTemplate.images.length > 0 ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedTemplate.images[0].url}`} 
                      alt={selectedTemplate.name} 
                    />
                  ) : (
                    <div className="template-placeholder large">
                      <span>🍽️</span>
                    </div>
                  )}
                </div>
                
                <div className="template-detail-content">
                  <p className="template-detail-description">{selectedTemplate.description}</p>
                  
                  <div className="template-detail-meta">
                    <div className="meta-item">
                      <span className="meta-label">Mục tiêu:</span>
                      <span className="badge">{getGoalLabel(selectedTemplate.goal)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Độ khó:</span>
                      <span className={`badge ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                        {getDifficultyLabel(selectedTemplate.difficulty)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Thời gian:</span>
                      <span>{selectedTemplate.duration} ngày</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Bữa ăn/ngày:</span>
                      <span>{selectedTemplate.mealsPerDay}</span>
                    </div>
                  </div>
                  
                  <div className="template-detail-nutrition">
                    <h4>Dinh dưỡng mục tiêu</h4>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Calories:</span>
                        <span className="nutrition-value">{formatCalories(selectedTemplate.targetCalories)}</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein:</span>
                        <span className="nutrition-value">{Math.round(selectedTemplate.targetProtein)}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbs:</span>
                        <span className="nutrition-value">{Math.round(selectedTemplate.targetCarbs)}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fat:</span>
                        <span className="nutrition-value">{Math.round(selectedTemplate.targetFat)}g</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="template-detail-meals">
                    <h4>Thực đơn mẫu (Ngày 1)</h4>
                    {selectedTemplate.dailyMeals[0]?.meals.map((meal, index) => (
                      <div key={index} className="meal-item">
                        <div className="meal-type">
                          {getMealTypeLabel(meal.mealType)}
                        </div>
                        <div className="meal-info">
                          <h5>{meal.meal.name}</h5>
                          <p>{meal.meal.description}</p>
                          <div className="meal-nutrition">
                            <span>{formatCalories(meal.meal.nutrition.calories * meal.servings)}</span>
                            <span>{formatMacros(
                              meal.meal.nutrition.protein * meal.servings,
                              meal.meal.nutrition.carbs * meal.servings,
                              meal.meal.nutrition.fat * meal.servings
                            )}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="template-detail-stats">
                    <div className="stat">
                      <EyeIcon className="w-5 h-5" />
                      <span>{selectedTemplate.viewCount} lượt xem</span>
                    </div>
                    <div className="stat">
                      <HeartIcon className="w-5 h-5" />
                      <span>{selectedTemplate.likeCount} lượt thích</span>
                    </div>
                    <div className="stat">
                      <StarIcon className="w-5 h-5" />
                      <span>{selectedTemplate.averageRating.toFixed(1)}/5 ({selectedTemplate.ratingCount} đánh giá)</span>
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

export default MealSuggestions;
