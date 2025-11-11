import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlayIcon, 
  HeartIcon, 
  ClockIcon, 
  FireIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Exercise } from '../types';
import { getExercises, getExerciseMetadata, rateExercise, getExerciseById, ExerciseMetadata } from '../services/exerciseService';
import './Exercises.css';

const ExercisesNew: React.FC = () => {
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
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

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
      console.log(response.exercises);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'difficulty-beginner';
      case 'intermediate': return 'difficulty-intermediate';
      case 'advanced': return 'difficulty-advanced';
      default: return 'difficulty-beginner';
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

  const filteredExercises = exercises;

  const extractVideoUrl = (exercise: Exercise): string | null => {
    const anyEx: any = exercise as any;
    const url = anyEx.videoUrl || anyEx.video?.url || anyEx.videos?.[0]?.url || anyEx.video || null;
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

  const openVideo = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    let url = extractVideoUrl(exercise);

    // Thử lấy chi tiết từ API nếu chưa có url
    if (!url) {
      try {
        const detail = await getExerciseById(exercise._id);
        url = extractVideoUrl(detail.exercise);
      } catch (e) {
        // ignore
      }
    }

    // Fallback: nếu vẫn không có, dùng YouTube search embed theo tên bài tập
    if (!url && exercise.name) {
      const q = encodeURIComponent(`${exercise.name} exercise tutorial`);
      url = `https://www.youtube.com/embed?listType=search&list=${q}`;
    }

    setVideoUrl(url);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setSelectedExercise(null);
    setVideoUrl(null);
    document.body.style.overflow = '';
  };

  const openDetails = async (exercise: Exercise) => {
    setDetailLoading(true);
    document.body.style.overflow = 'hidden';
    try {
      const detail = await getExerciseById(exercise._id);
      setDetailExercise(detail.exercise || exercise);
    } catch (e) {
      setDetailExercise(exercise);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailExercise(null);
    setDetailLoading(false);
    document.body.style.overflow = '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-gray-600">Đang tải bài tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button 
          onClick={loadExercises}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Header */}
      <div className="exercises-header">
        <div className="relative z-10 text-center">
          <h1 className="exercises-title">
            Thư viện Bài tập 💪
          </h1>
          <p className="exercises-subtitle">
            Khám phá hàng trăm bài tập được thiết kế bởi các chuyên gia, 
            từ cơ bản đến nâng cao, phù hợp với mọi mục tiêu tập luyện
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">500+</span> Bài tập
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">50+</span> Nhóm cơ
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">10+</span> Thiết bị
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="filters-section">
        {/* <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); } }}
            className="search-input"
          />
        </div> */}

        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả danh mục</option>
              {metadata?.categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
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
              {metadata?.difficulties.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Nhóm cơ</label>
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả nhóm cơ</option>
              {metadata?.muscles.map((muscle) => (
                <option key={muscle.value} value={muscle.value}>
                  {muscle.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      {!loading && !error && (
        <div className="exercises-grid">
          {filteredExercises.map((exercise, index) => (
            <div 
              key={exercise._id} 
              className="exercise-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="exercise-image-container">
                {exercise.images && exercise.images.length > 0 ? (
                  <img
                    src={exercise.images[0].url}
                    alt={exercise.name}
                    className="exercise-image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
                
                <div className="exercise-overlay"></div>
                
                <button type="button" className="exercise-play-button" onClick={() => openVideo(exercise)}>
                  <PlayIcon className="w-6 h-6 text-gray-700" />
                </button>

                <div className="exercise-badges">
                  <span className={`difficulty-badge ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </span>
                  <button 
                    type="button"
                    className="favorite-button"
                    onClick={() => handleRateExercise(exercise._id, 5)}
                  >
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="exercise-stats">
                  <div className="exercise-stat">
                    <ClockIcon className="w-4 h-4" />
                    <span>{exercise.estimatedDuration || 15} phút</span>
                  </div>
                  <div className="exercise-stat">
                    <FireIcon className="w-4 h-4" />
                    <span>{exercise.estimatedCalories || 0} cal</span>
                  </div>
                </div>
              </div>

              <div className="exercise-content">
                <div className="exercise-header">
                  <h3 className="exercise-title">
                    {exercise.name}
                  </h3>
                  {exercise.averageRating > 0 && (
                    <div className="exercise-rating">
                      <StarIcon className="star-icon" />
                      <span>{exercise.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="exercise-category">
                  {getCategoryLabel(exercise.category)}
                </div>

                <p className="exercise-description">
                  {exercise.description}
                </p>

                {exercise.equipment && exercise.equipment.length > 0 && exercise.equipment[0] !== 'none' && (
                  <div className="exercise-equipment">
                    <p className="equipment-label">Dụng cụ:</p>
                    <div className="equipment-tags">
                      {exercise.equipment.map((item, index) => (
                        <span key={index} className="equipment-tag">
                          {metadata?.equipment?.find(eq => eq.value === item)?.label || item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="exercise-actions">
                  <button type="button" className="action-button action-button-primary" onClick={() => openVideo(exercise)}>
                    <PlayIcon className="w-4 h-4" />
                    Bắt đầu ngay
                  </button>
                  <button type="button" className="action-button action-button-secondary" onClick={() => openDetails(exercise)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Chi tiết
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

      {/* Video Modal */}
      {selectedExercise && (
        <div className="video-modal-overlay" onClick={closeVideo}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeVideo} aria-label="Đóng video">×</button>
            <h3 className="video-modal-title">{selectedExercise.name}</h3>
            {videoUrl ? (
              <div className="video-wrapper">
                {toEmbedUrl(videoUrl).includes('youtube.com/embed') ? (
                  <iframe
                    className="video-iframe"
                    src={toEmbedUrl(videoUrl)}
                    title={selectedExercise.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video className="video-player" src={videoUrl} controls autoPlay />
                )}
              </div>
            ) : (
              <div className="video-fallback">
                {selectedExercise?.images?.[0]?.url ? (
                  <img src={selectedExercise.images[0].url} alt={selectedExercise.name} style={{maxWidth:'100%', borderRadius: '8px'}} />
                ) : (
                  <p>Không tìm thấy video cho bài tập này.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailExercise && (
        <div className="video-modal-overlay" onClick={closeDetails}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeDetails} aria-label="Đóng">×</button>
            <h3 className="video-modal-title">{detailExercise.name}</h3>

            {detailLoading ? (
              <div className="loading-container"><div className="loading-spinner"></div></div>
            ) : (
              <div className="detail-content">
                {/* Top preview */}
                {detailExercise.images?.[0]?.url && (
                  <img className="detail-cover" src={detailExercise.images[0].url} alt={detailExercise.name} />
                )}

                {/* Meta chips */}
                <div className="detail-chips">
                  {detailExercise.category && (
                    <span className="chip chip-primary">{getCategoryLabel(detailExercise.category)}</span>
                  )}
                  {detailExercise.difficulty && (
                    <span className={`chip ${getDifficultyColor(detailExercise.difficulty)}`}>{getDifficultyLabel(detailExercise.difficulty)}</span>
                  )}
                  {detailExercise.estimatedDuration && (
                    <span className="chip">⏱ {detailExercise.estimatedDuration} phút</span>
                  )}
                  {typeof detailExercise.estimatedCalories === 'number' && (
                    <span className="chip">🔥 {detailExercise.estimatedCalories} cal</span>
                  )}
                </div>

                {/* Grids */}
                <div className="detail-grid">
                  <div className="detail-section">
                    <h4>Mô tả</h4>
                    <p className="detail-text">{detailExercise.description || '—'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Nhóm cơ chính</h4>
                    <div className="tags">
                      {detailExercise.primaryMuscles?.length ? detailExercise.primaryMuscles.map((m, i) => (
                        <span key={i} className="tag">{m}</span>
                      )) : <span className="tag">—</span>}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Nhóm cơ phụ</h4>
                    <div className="tags">
                      {detailExercise.secondaryMuscles?.length ? detailExercise.secondaryMuscles.map((m, i) => (
                        <span key={i} className="tag">{m}</span>
                      )) : <span className="tag">—</span>}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Thiết bị</h4>
                    <div className="tags">
                      {detailExercise.equipment?.length ? detailExercise.equipment.map((eq, i) => (
                        <span key={i} className="tag">{metadata?.equipment?.find(e => e.value === eq)?.label || eq}</span>
                      )) : <span className="tag">Không cần</span>}
                    </div>
                  </div>

                  {(detailExercise as any).steps?.length || (detailExercise as any).instructions?.length ? (
                    <div className="detail-section detail-span-2">
                      <h4>Các bước thực hiện</h4>
                      <ol className="detail-steps">
                        {((detailExercise as any).steps || (detailExercise as any).instructions || []).map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  {(detailExercise as any).tips?.length ? (
                    <div className="detail-section detail-span-2">
                      <h4>Mẹo & Lưu ý</h4>
                      <ul className="detail-tips">
                        {(detailExercise as any).tips.map((t: string, idx: number) => (
                          <li key={idx}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ExercisesNew;
