import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlayIcon,
  HeartIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Exercise } from '../types';
import { getExercises, getExerciseMetadata, rateExercise, ExerciseMetadata } from '../services/exerciseService';
import './Exercises.css';

const Exercises: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [metadata, setMetadata] = useState<ExerciseMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load metadata và exercises khi component mount
  useEffect(() => {
    loadMetadata();
    loadExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load exercises khi filter thay đổi
  useEffect(() => {
    loadExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedMuscleGroup, selectedDifficulty, selectedCategory, currentPage]);

  const loadMetadata = async () => {
    try {
      const data = await getExerciseMetadata();
      setMetadata(data);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(selectedMuscleGroup && { muscles: [selectedMuscleGroup] })
      };

      const response = await getExercises(filters, currentPage, 12);
      setExercises(response.exercises);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách bài tập');
      console.error('Error loading exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateExercise = async (exerciseId: string, rating: number) => {
    try {
      await rateExercise(exerciseId, rating);
      // Reload exercises để cập nhật rating
      loadExercises();
    } catch (err) {
      console.error('Error rating exercise:', err);
    }
  };

  const filteredExercises = exercises;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Dễ';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Khó';
      default: return difficulty;
    }
  };

  const getCategoryLabel = (category: string) => {
    return metadata?.categories.find(cat => cat.value === category)?.label || category;
  };

  return (
    <>
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Thư viện bài tập 💪
              </h1>
              <p className="text-primary-100 text-lg max-w-2xl">
                Khám phá hơn 100+ bài tập được thiết kế bởi chuyên gia. Từ cơ bản đến nâng cao, tìm bài tập phù hợp với mục tiêu của bạn.
              </p>
              <div className="flex items-center mt-4 space-x-6 text-primary-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Video hướng dẫn chi tiết</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span className="text-sm">Phù hợp mọi trình độ</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm & Bộ lọc</h3>
            <span className="text-sm text-gray-500">{exercises.length} bài tập</span>
          </div>
          
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white"
                placeholder="Tìm kiếm theo tên bài tập, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
              </div>
              
              {/* Category Filter */}
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {metadata?.categories?.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>

              {/* Muscle Group Filter */}
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              >
                <option value="">Tất cả nhóm cơ</option>
                {metadata?.muscles?.map(muscle => (
                  <option key={muscle.value} value={muscle.value}>{muscle.label}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">Tất cả độ khó</option>
                {metadata?.difficulties?.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {(selectedCategory || selectedMuscleGroup || selectedDifficulty || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedMuscleGroup('');
                    setSelectedDifficulty('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Đang tải bài tập...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Exercise Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExercises.map((exercise, index) => (
            <div 
              key={exercise._id} 
              className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Exercise Image with Enhanced Overlay */}
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {exercise.images && exercise.images.length > 0 ? (
                  <img
                    src={exercise.images[0].url}
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Play Button with Animation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white/90 backdrop-blur-sm p-4 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl">
                    <PlayIcon className="w-8 h-8 text-primary-600" />
                  </button>
                </div>
                
                {/* Enhanced Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </span>
                  <button 
                    className="text-white hover:text-red-400 transition-colors bg-black/20 backdrop-blur-sm rounded-full p-2"
                    onClick={() => handleRateExercise(exercise._id, 5)}
                  >
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-700">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span className="font-medium">{exercise.estimatedDuration || 15} phút</span>
                      </div>
                      <div className="flex items-center text-orange-600">
                        <FireIcon className="w-4 h-4 mr-1" />
                        <span className="font-medium">{exercise.estimatedCalories || 0} cal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Exercise Info */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl group-hover:text-primary-600 transition-colors">
                      {exercise.name}
                    </h3>
                    {exercise.averageRating > 0 && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">{exercise.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {getCategoryLabel(exercise.category)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {exercise.description}
                  </p>
                </div>

                {/* Equipment Tags */}
                {exercise.equipment && exercise.equipment.length > 0 && exercise.equipment[0] !== 'none' && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Dụng cụ:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                          {metadata?.equipment?.find(eq => eq.value === item)?.label || item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Bắt đầu ngay
                  </button>
                  <button className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-primary-500 hover:text-primary-600 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? 'text-primary-600 bg-primary-50 border border-primary-300'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài tập</h3>
          <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </>
  );
};

export default Exercises;
