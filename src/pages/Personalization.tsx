import React, { useState, useEffect } from 'react';
import { 
  UserPreferences, 
  AIWorkoutPlan, 
  NutritionCalculator,
  AdaptiveLearning,
  Analytics
} from '../services/personalizationService';
import { 
  getPreferences,
  updatePreferences,
  getCurrentAIWorkoutPlan,
  generateAIWorkoutPlan,
  getCurrentNutritionData,
  calculatePersonalizedNutrition,
  getAnalytics,
  generateAdvancedWorkout,
  quickNutritionCalculate
} from '../services/personalizationService';
import './Personalization.css';

const Personalization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [aiWorkoutPlan, setAIWorkoutPlan] = useState<AIWorkoutPlan | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionCalculator | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prefs, aiPlan, nutrition, analyticsData] = await Promise.all([
        getPreferences().catch(() => null),
        getCurrentAIWorkoutPlan().catch(() => null),
        getCurrentNutritionData().catch(() => null),
        getAnalytics().catch(() => null)
      ]);
      
      setPreferences(prefs);
      setAIWorkoutPlan(aiPlan);
      setNutritionData(nutrition);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading personalization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (updatedPrefs: Partial<UserPreferences>) => {
    try {
      setSaving(true);
      const updated = await updatePreferences(updatedPrefs);
      setPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAIWorkout = async () => {
    if (!preferences?.fitnessGoals) return;
    
    try {
      setSaving(true);
      const result = await generateAIWorkoutPlan(preferences.fitnessGoals, {
        duration: 4,
        timePerSession: preferences.workoutDuration
      });
      setAIWorkoutPlan(result.plan);
    } catch (error) {
      console.error('Error generating AI workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvancedGenerate = async () => {
    try {
      setSaving(true);
      const g = preferences?.fitnessGoals?.[0] || 'general';
      const diff = preferences?.experienceLevel === 'beginner' ? 'beginner' : preferences?.experienceLevel === 'advanced' ? 'advanced' : 'intermediate';
      const res = await generateAdvancedWorkout({ goal: g, difficulty: diff });
      if (res?.workoutPlan) {
        // làm mới AI tab hiển thị bằng cách báo thành công
        console.log('Advanced plan created', res.workoutPlan);
      }
    } catch (e) {
      console.error('Advanced generate error:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateNutrition = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      const result = await calculatePersonalizedNutrition(
        {
          weight: 70, // Default values - should be from user profile
          height: 170,
          age: 25,
          gender: 'male',
          activityLevel: 'moderately_active'
        },
        {
          primary: 'muscle_gain',
          priority: 'strength'
        },
        {
          mealFrequency: preferences.mealFrequency,
          restrictions: {
            dietary: preferences.dietaryRestrictions
          },
          preferences: {
            cuisine: ['vietnamese', 'international']
          }
        }
      );
      setNutritionData(result);
    } catch (error) {
      console.error('Error calculating nutrition:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickNutrition = async () => {
    try {
      setSaving(true);
      const quick = await quickNutritionCalculate({ height: 170, weight: 70, age: 25, gender: 'male', activityLevel: 'moderate', goal: 'muscle_gain' });
      console.log('Quick nutrition', quick);
    } catch (e) {
      console.error('Quick nutrition error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="personalization-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu cá nhân hóa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="personalization-container">
      <div className="personalization-header">
        <h1>🎯 Cá nhân hóa Nâng cao</h1>
        <p>Hệ thống AI tạo kế hoạch tập luyện và dinh dưỡng phù hợp với bạn</p>
      </div>

      <div className="personalization-tabs">
        <button
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
        <button
          className={`tab ${activeTab === 'ai-workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-workout')}
        >
          🤖 AI Workout
        </button>
        <button
          className={`tab ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => setActiveTab('nutrition')}
        >
          🍎 Dinh dưỡng
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      <div className="personalization-content">
        {activeTab === 'preferences' && (
          <PreferencesTab 
            preferences={preferences}
            onUpdate={handlePreferencesUpdate}
            saving={saving}
          />
        )}

        {activeTab === 'ai-workout' && (
          <AIWorkoutTab
            aiWorkoutPlan={aiWorkoutPlan}
            onGenerate={handleGenerateAIWorkout}
            onAdvancedGenerate={handleAdvancedGenerate}
            saving={saving}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            nutritionData={nutritionData}
            onCalculate={handleCalculateNutrition}
            onQuick={handleQuickNutrition}
            saving={saving}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab analytics={analytics} />
        )}
      </div>
    </div>
  );
};

// Preferences Tab Component
const PreferencesTab: React.FC<{
  preferences: UserPreferences | null;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
  saving: boolean;
}> = ({ preferences, onUpdate, saving }) => {
  const [formData, setFormData] = useState<Partial<UserPreferences>>({});

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof UserPreferences] as string[] || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  if (!preferences) {
    return (
      <div className="preferences-tab">
        <div className="empty-state">
          <h3>Chưa có thông tin preferences</h3>
          <p>Hãy điền thông tin để bắt đầu cá nhân hóa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preferences-tab">
      <form onSubmit={handleSubmit} className="preferences-form">
        <div className="form-section">
          <h3>🎯 Mục tiêu tập luyện</h3>
          <div className="checkbox-group">
            {['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'].map(goal => (
              <label key={goal} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.fitnessGoals?.includes(goal) || false}
                  onChange={(e) => handleArrayChange('fitnessGoals', goal, e.target.checked)}
                />
                <span>{getGoalLabel(goal)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>📊 Trình độ & Tần suất</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Trình độ</label>
              <select
                value={formData.experienceLevel || 'beginner'}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
              >
                <option value="beginner">Mới bắt đầu</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
                <option value="expert">Chuyên nghiệp</option>
              </select>
            </div>
            <div className="form-group">
              <label>Số buổi/tuần</label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.workoutFrequency || 3}
                onChange={(e) => handleChange('workoutFrequency', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Thời gian/buổi (phút)</label>
              <input
                type="number"
                min="15"
                max="180"
                value={formData.workoutDuration || 60}
                onChange={(e) => handleChange('workoutDuration', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>🏋️ Thiết bị & Loại hình</h3>
          <div className="checkbox-group">
            <h4>Thiết bị có sẵn:</h4>
            {['dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'squat_rack', 'cardio_machine', 'yoga_mat', 'none'].map(equipment => (
              <label key={equipment} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.availableEquipment?.includes(equipment) || false}
                  onChange={(e) => handleArrayChange('availableEquipment', equipment, e.target.checked)}
                />
                <span>{getEquipmentLabel(equipment)}</span>
              </label>
            ))}
          </div>
          <div className="checkbox-group">
            <h4>Loại hình yêu thích:</h4>
            {['strength_training', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'bodyweight', 'sports'].map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.preferredWorkoutTypes?.includes(type) || false}
                  onChange={(e) => handleArrayChange('preferredWorkoutTypes', type, e.target.checked)}
                />
                <span>{getWorkoutTypeLabel(type)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>🍎 Dinh dưỡng</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Số bữa/ngày</label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.mealFrequency || 3}
                onChange={(e) => handleChange('mealFrequency', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Kỹ năng nấu ăn</label>
              <select
                value={formData.cookingSkill || 'beginner'}
                onChange={(e) => handleChange('cookingSkill', e.target.value)}
              >
                <option value="beginner">Mới bắt đầu</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngân sách</label>
              <select
                value={formData.budgetRange || 'medium'}
                onChange={(e) => handleChange('budgetRange', e.target.value)}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>
          <div className="checkbox-group">
            <h4>Hạn chế ăn uống:</h4>
            {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_allergy', 'shellfish_allergy', 'kosher', 'halal', 'keto', 'paleo', 'low_carb', 'low_fat'].map(restriction => (
              <label key={restriction} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.dietaryRestrictions?.includes(restriction) || false}
                  onChange={(e) => handleArrayChange('dietaryRestrictions', restriction, e.target.checked)}
                />
                <span>{getRestrictionLabel(restriction)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>💪 Động lực & Xã hội</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Mức độ động lực (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.motivationLevel || 5}
                onChange={(e) => handleChange('motivationLevel', parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{formData.motivationLevel || 5}</span>
            </div>
          </div>
          <div className="checkbox-group">
            <h4>Thích tập:</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.socialPreferences?.solo || false}
                onChange={(e) => handleChange('socialPreferences', { ...formData.socialPreferences, solo: e.target.checked })}
              />
              <span>Một mình</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.socialPreferences?.partner || false}
                onChange={(e) => handleChange('socialPreferences', { ...formData.socialPreferences, partner: e.target.checked })}
              />
              <span>Với bạn</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.socialPreferences?.group || false}
                onChange={(e) => handleChange('socialPreferences', { ...formData.socialPreferences, group: e.target.checked })}
              />
              <span>Nhóm</span>
            </label>
          </div>
        </div>

        <button type="submit" className="save-button" disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu Preferences'}
        </button>
      </form>
    </div>
  );
};

// AI Workout Tab Component
const AIWorkoutTab: React.FC<{
  aiWorkoutPlan: AIWorkoutPlan | null;
  onGenerate: () => void;
  onAdvancedGenerate: () => void;
  saving: boolean;
}> = ({ aiWorkoutPlan, onGenerate, onAdvancedGenerate, saving }) => {
  return (
    <div className="ai-workout-tab">
      <div className="ai-workout-header">
        <h3>🤖 AI Workout Planner</h3>
        <p>Hệ thống AI sẽ tạo kế hoạch tập luyện cá nhân hóa dựa trên preferences của bạn</p>
        <button 
          className="generate-button"
          onClick={onGenerate}
          disabled={saving}
        >
          {saving ? 'Đang tạo...' : '🚀 Tạo Kế Hoạch AI'}
        </button>
        <button 
          className="generate-button"
          onClick={onAdvancedGenerate}
          disabled={saving}
          style={{ marginLeft: '0.5rem' }}
        >
          {saving ? 'Đang tạo...' : '✨ Tạo Nâng Cao'}
        </button>
      </div>

      {aiWorkoutPlan ? (
        <div className="ai-workout-plan">
          <div className="plan-header">
            <h4>Kế hoạch AI hiện tại</h4>
            <div className="plan-meta">
              <span className="version">Phiên bản: {aiWorkoutPlan.aiVersion}</span>
              <span className="algorithm">Thuật toán: {aiWorkoutPlan.algorithm}</span>
              <span className="reason">Lý do: {getGenerationReasonLabel(aiWorkoutPlan.generationReason)}</span>
            </div>
          </div>

          <div className="plan-details">
            <div className="personalization-factors">
              <h5>Yếu tố cá nhân hóa:</h5>
              <div className="factors-list">
                {aiWorkoutPlan.personalizationFactors.map((factor, index) => (
                  <div key={index} className="factor-item">
                    <span className="factor-name">{getFactorLabel(factor.factor)}</span>
                    <div className="factor-weight">
                      <div 
                        className="weight-bar"
                        style={{ width: `${factor.weight * 100}%` }}
                      ></div>
                      <span className="weight-value">{Math.round(factor.weight * 100)}%</span>
                    </div>
                    <span className={`factor-applied ${factor.applied ? 'applied' : 'not-applied'}`}>
                      {factor.applied ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="performance-predictions">
              <h5>Dự đoán hiệu suất:</h5>
              <div className="predictions-grid">
                <div className="prediction-item">
                  <span className="prediction-label">Độ khó dự kiến:</span>
                  <span className="prediction-value">{aiWorkoutPlan.performancePredictions.expectedDifficulty}/10</span>
                </div>
                <div className="prediction-item">
                  <span className="prediction-label">Thời gian dự kiến:</span>
                  <span className="prediction-value">{aiWorkoutPlan.performancePredictions.expectedDuration} phút</span>
                </div>
                <div className="prediction-item">
                  <span className="prediction-label">Calories dự kiến:</span>
                  <span className="prediction-value">{aiWorkoutPlan.performancePredictions.expectedCalories} kcal</span>
                </div>
                <div className="prediction-item">
                  <span className="prediction-label">Tỷ lệ thành công:</span>
                  <span className="prediction-value">{Math.round(aiWorkoutPlan.performancePredictions.successProbability * 100)}%</span>
                </div>
              </div>
            </div>

            {aiWorkoutPlan.feedback && (
              <div className="plan-feedback">
                <h5>Phản hồi của bạn:</h5>
                <div className="feedback-grid">
                  <div className="feedback-item">
                    <span className="feedback-label">Đánh giá:</span>
                    <span className="feedback-value">{aiWorkoutPlan.feedback.userRating}/10</span>
                  </div>
                  <div className="feedback-item">
                    <span className="feedback-label">Tỷ lệ hoàn thành:</span>
                    <span className="feedback-value">{Math.round(aiWorkoutPlan.feedback.completionRate * 100)}%</span>
                  </div>
                  <div className="feedback-item">
                    <span className="feedback-label">Hiệu quả:</span>
                    <span className="feedback-value">{aiWorkoutPlan.feedback.effectiveness}/10</span>
                  </div>
                </div>
                {aiWorkoutPlan.feedback.comments && (
                  <div className="feedback-comments">
                    <p>{aiWorkoutPlan.feedback.comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h4>Chưa có kế hoạch AI</h4>
          <p>Nhấn "Tạo Kế Hoạch AI" để bắt đầu</p>
        </div>
      )}
    </div>
  );
};

// Nutrition Tab Component
const NutritionTab: React.FC<{
  nutritionData: NutritionCalculator | null;
  onCalculate: () => void;
  onQuick: () => void;
  saving: boolean;
}> = ({ nutritionData, onCalculate, onQuick, saving }) => {
  return (
    <div className="nutrition-tab">
      <div className="nutrition-header">
        <h3>🍎 Nutrition Calculator</h3>
        <p>Tính toán dinh dưỡng chính xác dựa trên cơ thể và mục tiêu của bạn</p>
        <button 
          className="calculate-button"
          onClick={onCalculate}
          disabled={saving}
        >
          {saving ? 'Đang tính toán...' : '🧮 Tính Toán Dinh Dưỡng'}
        </button>
        <button 
          className="calculate-button"
          onClick={onQuick}
          disabled={saving}
          style={{ marginLeft: '0.5rem' }}
        >
          {saving ? 'Đang tính toán...' : '⚡ Tính nhanh'}
        </button>
      </div>

      {nutritionData ? (
        <div className="nutrition-data">
          <div className="macros-overview">
            <h4>Tổng quan dinh dưỡng</h4>
            <div className="macros-grid">
              <div className="macro-card calories">
                <div className="macro-icon">🔥</div>
                <div className="macro-info">
                  <span className="macro-label">Calories</span>
                  <span className="macro-value">{nutritionData.calculatedMacros.calories.target}</span>
                  <span className="macro-unit">kcal/ngày</span>
                </div>
              </div>
              <div className="macro-card protein">
                <div className="macro-icon">🥩</div>
                <div className="macro-info">
                  <span className="macro-label">Protein</span>
                  <span className="macro-value">{nutritionData.calculatedMacros.protein.grams}</span>
                  <span className="macro-unit">g ({nutritionData.calculatedMacros.protein.percentage}%)</span>
                </div>
              </div>
              <div className="macro-card carbs">
                <div className="macro-icon">🍞</div>
                <div className="macro-info">
                  <span className="macro-label">Carbs</span>
                  <span className="macro-value">{nutritionData.calculatedMacros.carbs.grams}</span>
                  <span className="macro-unit">g ({nutritionData.calculatedMacros.carbs.percentage}%)</span>
                </div>
              </div>
              <div className="macro-card fat">
                <div className="macro-icon">🥑</div>
                <div className="macro-info">
                  <span className="macro-label">Fat</span>
                  <span className="macro-value">{nutritionData.calculatedMacros.fat.grams}</span>
                  <span className="macro-unit">g ({nutritionData.calculatedMacros.fat.percentage}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="meal-timing">
            <h4>Phân bổ bữa ăn</h4>
            <div className="meal-timing-grid">
              {nutritionData.mealPlan.mealTiming.map((meal, index) => (
                <div key={index} className="meal-timing-item">
                  <div className="meal-type">{getMealTypeLabel(meal.mealType)}</div>
                  <div className="meal-time">{meal.time}</div>
                  <div className="meal-calories">{meal.calories} kcal</div>
                  <div className="meal-macros">
                    <span>P: {meal.macros.protein}g</span>
                    <span>C: {meal.macros.carbs}g</span>
                    <span>F: {meal.macros.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="nutrition-details">
            <div className="detail-section">
              <h5>Thông tin cơ thể</h5>
              <div className="body-info">
                <span>Cân nặng: {nutritionData.bodyComposition.weight}kg</span>
                <span>Chiều cao: {nutritionData.bodyComposition.height}cm</span>
                <span>Tuổi: {nutritionData.bodyComposition.age}</span>
                <span>Giới tính: {getGenderLabel(nutritionData.bodyComposition.gender)}</span>
                <span>Hoạt động: {getActivityLevelLabel(nutritionData.bodyComposition.activityLevel)}</span>
              </div>
            </div>

            <div className="detail-section">
              <h5>Mục tiêu</h5>
              <div className="goals-info">
                <span>Mục tiêu chính: {getGoalLabel(nutritionData.goals.primary)}</span>
                <span>Ưu tiên: {getPriorityLabel(nutritionData.goals.priority)}</span>
                {nutritionData.goals.targetWeight && (
                  <span>Cân nặng mục tiêu: {nutritionData.goals.targetWeight}kg</span>
                )}
                {nutritionData.goals.timeline && (
                  <span>Thời gian: {nutritionData.goals.timeline} tuần</span>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h5>Khuyến nghị bổ sung</h5>
              <div className="supplements">
                <div className="supplement-item">
                  <span>Chất xơ: {nutritionData.calculatedMacros.fiber.grams}g/ngày</span>
                </div>
                <div className="supplement-item">
                  <span>Nước: {nutritionData.calculatedMacros.water.liters}L ({nutritionData.calculatedMacros.water.glasses} ly)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h4>Chưa có dữ liệu dinh dưỡng</h4>
          <p>Nhấn "Tính Toán Dinh Dưỡng" để bắt đầu</p>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{
  analytics: Analytics | null;
}> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="analytics-tab">
        <div className="empty-state">
          <h4>Chưa có dữ liệu analytics</h4>
          <p>Hãy sử dụng ứng dụng để tạo dữ liệu phân tích</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-tab">
      <div className="analytics-header">
        <h3>📊 Analytics & Insights</h3>
        <p>Phân tích hiệu suất và tiến độ của bạn</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card workout">
          <h4>🏋️ Tập luyện</h4>
          <div className="analytics-stats">
            <div className="stat-item">
              <span className="stat-label">Tổng buổi tập:</span>
              <span className="stat-value">{analytics.workout.totalWorkouts}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">RPE trung bình:</span>
              <span className="stat-value">{analytics.workout.avgRPE?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Volume trung bình:</span>
              <span className="stat-value">{analytics.workout.avgVolume?.toFixed(0) || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tỷ lệ hoàn thành:</span>
              <span className="stat-value">{Math.round((analytics.workout.consistency || 0) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="analytics-card nutrition">
          <h4>🍎 Dinh dưỡng</h4>
          <div className="analytics-stats">
            <div className="stat-item">
              <span className="stat-label">Calories mục tiêu:</span>
              <span className="stat-value">{analytics.nutrition.calories?.target || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Protein:</span>
              <span className="stat-value">{analytics.nutrition.protein?.grams || 'N/A'}g</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Carbs:</span>
              <span className="stat-value">{analytics.nutrition.carbs?.grams || 'N/A'}g</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Fat:</span>
              <span className="stat-value">{analytics.nutrition.fat?.grams || 'N/A'}g</span>
            </div>
          </div>
        </div>

        <div className="analytics-card ai-plan">
          <h4>🤖 AI Plans</h4>
          <div className="analytics-stats">
            <div className="stat-item">
              <span className="stat-label">Tổng kế hoạch:</span>
              <span className="stat-value">{analytics.aiPlan.totalPlans}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đánh giá TB:</span>
              <span className="stat-value">{analytics.aiPlan.avgRating?.toFixed(1) || 'N/A'}/10</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tỷ lệ hoàn thành:</span>
              <span className="stat-value">{Math.round((analytics.aiPlan.avgCompletion || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-period">
        <p>Dữ liệu cho giai đoạn: {analytics.period}</p>
        <p>Cập nhật lần cuối: {new Date(analytics.generatedAt).toLocaleString('vi-VN')}</p>
      </div>
    </div>
  );
};

// Helper functions
const getGoalLabel = (goal: string) => {
  const labels: { [key: string]: string } = {
    'weight_loss': 'Giảm cân',
    'muscle_gain': 'Tăng cơ',
    'endurance': 'Sức bền',
    'strength': 'Sức mạnh',
    'flexibility': 'Linh hoạt',
    'general_fitness': 'Tổng quát'
  };
  return labels[goal] || goal;
};

const getEquipmentLabel = (equipment: string) => {
  const labels: { [key: string]: string } = {
    'dumbbells': 'Tạ đơn',
    'barbell': 'Tạ đòn',
    'kettlebell': 'Tạ ấm',
    'resistance_bands': 'Dây kháng lực',
    'pull_up_bar': 'Xà đơn',
    'bench': 'Ghế tập',
    'squat_rack': 'Khung squat',
    'cardio_machine': 'Máy cardio',
    'yoga_mat': 'Thảm yoga',
    'none': 'Không có thiết bị'
  };
  return labels[equipment] || equipment;
};

const getWorkoutTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    'strength_training': 'Tập sức mạnh',
    'cardio': 'Cardio',
    'hiit': 'HIIT',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'crossfit': 'CrossFit',
    'bodyweight': 'Bodyweight',
    'sports': 'Thể thao'
  };
  return labels[type] || type;
};

const getRestrictionLabel = (restriction: string) => {
  const labels: { [key: string]: string } = {
    'vegetarian': 'Ăn chay',
    'vegan': 'Thuần chay',
    'gluten_free': 'Không gluten',
    'dairy_free': 'Không sữa',
    'nut_allergy': 'Dị ứng hạt',
    'shellfish_allergy': 'Dị ứng hải sản',
    'kosher': 'Kosher',
    'halal': 'Halal',
    'keto': 'Keto',
    'paleo': 'Paleo',
    'low_carb': 'Ít carb',
    'low_fat': 'Ít béo'
  };
  return labels[restriction] || restriction;
};

const getGenerationReasonLabel = (reason: string) => {
  const labels: { [key: string]: string } = {
    'initial_creation': 'Tạo mới',
    'adaptation': 'Thích ứng',
    'progression': 'Tiến bộ',
    'plateau_break': 'Vượt plateau',
    'injury_adaptation': 'Thích ứng chấn thương',
    'goal_change': 'Thay đổi mục tiêu'
  };
  return labels[reason] || reason;
};

const getFactorLabel = (factor: string) => {
  const labels: { [key: string]: string } = {
    'fitness_level': 'Trình độ thể lực',
    'goals': 'Mục tiêu',
    'equipment': 'Thiết bị',
    'time_constraints': 'Ràng buộc thời gian',
    'injury_history': 'Lịch sử chấn thương',
    'preferences': 'Sở thích',
    'performance_history': 'Lịch sử hiệu suất'
  };
  return labels[factor] || factor;
};

const getMealTypeLabel = (mealType: string) => {
  const labels: { [key: string]: string } = {
    'breakfast': 'Bữa sáng',
    'lunch': 'Bữa trưa',
    'dinner': 'Bữa tối',
    'snack': 'Bữa phụ',
    'pre_workout': 'Trước tập',
    'post_workout': 'Sau tập'
  };
  return labels[mealType] || mealType;
};

const getGenderLabel = (gender: string) => {
  const labels: { [key: string]: string } = {
    'male': 'Nam',
    'female': 'Nữ',
    'other': 'Khác'
  };
  return labels[gender] || gender;
};

const getActivityLevelLabel = (level: string) => {
  const labels: { [key: string]: string } = {
    'sedentary': 'Ít vận động',
    'lightly_active': 'Vận động nhẹ',
    'moderately_active': 'Vận động vừa',
    'very_active': 'Vận động nhiều',
    'extremely_active': 'Vận động rất nhiều'
  };
  return labels[level] || level;
};

const getPriorityLabel = (priority: string) => {
  const labels: { [key: string]: string } = {
    'weight': 'Cân nặng',
    'strength': 'Sức mạnh',
    'endurance': 'Sức bền',
    'aesthetics': 'Thẩm mỹ',
    'health': 'Sức khỏe'
  };
  return labels[priority] || priority;
};

export default Personalization;
