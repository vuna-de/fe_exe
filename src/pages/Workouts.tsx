import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  FireIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { WorkoutPlan, WorkoutSession } from '../types';
import { 
  getWorkoutPlans, 
  getWorkoutSessions, 
  startWorkoutSession,
  getWorkoutStats,
  generateWorkoutPlan,
  cancelWorkoutSession,
  deleteWorkoutPlan
} from '../services/workoutService';
import toast from 'react-hot-toast';
import { useAuth } from '../store/authStore';
import WorkoutPlanGenerator from '../components/WorkoutPlanGenerator';
import './Workouts.css';
import './Profile.css';
import WorkoutSessionModal from '../components/WorkoutSessionModal';
import ManualPlanModal from '../components/ManualPlanModal';
import WorkoutPlanDetailModal from '../components/WorkoutPlanDetailModal';

const Workouts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'my-plans' | 'history'>('all');
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [detailPlan, setDetailPlan] = useState<WorkoutPlan | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Load data khi component mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'history') {
      loadWorkoutSessions();
    } else {
      loadWorkoutPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkoutPlans(),
        loadWorkoutStats()
      ]);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutPlans = async () => {
    try {
      const filters = activeTab === 'my-plans' ? { isTemplate: false } : {};
      const response = await getWorkoutPlans(filters);
      setWorkoutPlans(response.workoutPlans);
    } catch (err) {
      console.error('Error loading workout plans:', err);
    }
  };

  const loadWorkoutSessions = async () => {
    try {
      const response = await getWorkoutSessions({ status: 'completed' });
      setWorkoutSessions(response.sessions);
    } catch (err) {
      console.error('Error loading workout sessions:', err);
    }
  };

  const loadWorkoutStats = async () => {
    try {
      const response = await getWorkoutStats('month');
      setStats(response.stats);
    } catch (err) {
      console.error('Error loading workout stats:', err);
    }
  };

  const handleStartWorkout = async (planId: string) => {
    try {
      setStartingId(planId);
      const res = await startWorkoutSession({ workoutPlanId: planId });
      toast.success(res.message || 'Bắt đầu phiên tập luyện!');
      setActiveSession(res.session);
      // Lưu vào history (backend đã lưu). Có thể tải lại khi đóng modal.
    } catch (err) {
      console.error('Error starting workout:', err);
      toast.error('Không thể bắt đầu phiên tập luyện');
    } finally {
      setStartingId(null);
    }
  };

  const handlePlanGenerated = (result: any) => {
    // Reload workout plans
    loadWorkoutPlans();
    setShowGenerator(false);
  };

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight_loss': return 'text-blue-600 bg-blue-100';
      case 'muscle_gain': return 'text-purple-600 bg-purple-100';
      case 'strength': return 'text-red-600 bg-red-100';
      case 'endurance': return 'text-orange-600 bg-orange-100';
      case 'flexibility': return 'text-green-600 bg-green-100';
      case 'general': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'weight_loss': return 'Giảm cân';
      case 'muscle_gain': return 'Tăng cơ';
      case 'strength': return 'Tăng sức mạnh';
      case 'endurance': return 'Sức bền';
      case 'flexibility': return 'Linh hoạt';
      case 'general': return 'Tổng quát';
      default: return category;
    }
  };

  const formatMinutes = (mins?: number) => {
    const total = Math.max(0, Math.round(mins || 0));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h <= 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h} giờ ${m} phút`;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'history': return workoutSessions;
      default: return workoutPlans;
    }
  };

  return (
    <>
      {/* Header giống Profile/Dashboard */}
      <div className="welcome-section mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="welcome-title">Kế hoạch tập luyện 🏋️‍♂️</h1>
            <p className="welcome-subtitle">Xây dựng và theo dõi kế hoạch tập luyện cá nhân hóa của bạn</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => setShowGenerator(true)}
              className="btn btn-primary"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Tạo tự động
            </button>
            <button 
              onClick={async () => {
                try {
                  const goalMap: any = { maintenance: 'general', weight_loss: 'weight_loss', muscle_gain: 'muscle_gain', endurance: 'endurance' };
                  const defaultGoal = goalMap[(user as any)?.fitnessGoal] || 'general';
                  const res = await generateWorkoutPlan({ goal: defaultGoal, difficulty: 'intermediate', duration: 45 });
                  toast.success(res.message || 'Đã tạo kế hoạch nhanh');
                  loadWorkoutPlans();
                } catch (e: any) {
                  toast.error(e?.response?.data?.error || 'Tạo kế hoạch nhanh thất bại');
                }
              }}
              className="btn btn-outline"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Tạo nhanh
            </button>
            <button className="btn btn-outline" onClick={() => { setDetailPlan(null); setShowManual(true); }}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Tạo thủ công
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{workoutPlans.length}</div>
              <div className="stat-label">Kế hoạch đã tạo</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{stats?.totalSessions || 0}</div>
              <div className="stat-label">Đã hoàn thành</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <FireIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{stats?.totalCalories || 0}</div>
              <div className="stat-label">Tổng calories</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="stat-value">{formatMinutes(stats?.totalDuration)}</div>
              <div className="stat-label">Tổng thời gian tập</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs giống Profile */}
      <div className="profile-tab-container">
        <nav className="flex" aria-label="Tabs">
          <button
            className={`profile-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả kế hoạch
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'my-plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-plans')}
          >
            Kế hoạch của tôi
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Lịch sử
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
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

      {/* Workout Plans Grid trong section giống Profile */}
      {!loading && !error && activeTab !== 'history' && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Danh sách kế hoạch</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans.map((plan) => (
            <div key={plan._id} className="workout-card overflow-hidden">
              {/* Plan Image */}
              <div className="workout-image-container">
                
                
                
                {/* Badges */}
                

                
              </div>

              {/* Plan Info */}
              <div className="workout-card-body">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {plan.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{plan.estimatedDuration} phút</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{plan.exerciseCount} bài tập</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FireIcon className="w-4 h-4" />
                    <span>{plan.totalCalories} cal</span>
                  </div>
                </div>

                {/* Completed aggregates */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(plan.category)}`}>
                    {getCategoryLabel(plan.category)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                    {getDifficultyLabel(plan.difficulty)}
                  </span>
                </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
                    <div className="font-semibold text-gray-900">{(plan as any).totalCompletedCalories || 0} cal</div>
                    <div>Calories đã đốt</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
                    <div className="font-semibold text-gray-900">{formatMinutes((plan as any).totalCompletedDuration || 0)}</div>
                    <div>Thời gian đã tập</div>
                  </div>
                </div>

                {plan.completedCount > 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    Đã hoàn thành {plan.completedCount} lần
                  </p>
                )}

                {/* Actions */}
                <div className="workout-card-actions mt-auto">
                  <button 
                    onClick={() => handleStartWorkout(plan._id)}
                    className="flex-1 workout-btn workout-btn-primary"
                    disabled={startingId === plan._id}
                  >
                    {startingId === plan._id ? 'Đang bắt đầu...' : (plan.completedCount > 0 ? 'Tập lại' : 'Bắt đầu')}
                  </button>
                  <div className="flex gap-2">
                    <button className="workout-btn workout-btn-outline" onClick={() => setDetailPlan(plan)}>
                      Chi tiết
                    </button>
                    <button className="workout-btn workout-btn-outline" onClick={() => { setDetailPlan(plan); setShowManual(true); }}>Sửa</button>
                    <button className="workout-btn workout-btn-outline" onClick={async () => { if (window.confirm('Xóa kế hoạch này?')) { await deleteWorkoutPlan(plan._id as any); await loadWorkoutPlans(); } }}>Xóa</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Workout History */}
      {!loading && !error && activeTab === 'history' && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Lịch sử tập luyện</h3>
          </div>
          <div className="section-content space-y-4 p-6">
          {workoutSessions.map((session) => (
            <div key={session._id} className="dashboard-section p-6 mb-1">
              <div className="flex items-center justify-between">
                <div className="flex-1 history-item">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{session.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(session.startTime).toLocaleDateString('vi-VN')} - {new Date(session.startTime).toLocaleTimeString('vi-VN')}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{session.totalDuration} phút</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FireIcon className="w-4 h-4" />
                      <span>{session.totalCaloriesBurned} cal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{session.completionRate}% hoàn thành</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 history-item">
                  {session.status === 'in_progress' ? (
                    <>
                      <button className="btn btn-primary" onClick={() => setActiveSession(session)}>Tiếp tục</button>
                      <button className="btn btn-outline" onClick={async () => { await cancelWorkoutSession(session._id as any); await loadWorkoutSessions(); }}>Hủy</button>
                    </>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Hoàn thành</span>
                  )}
                  <button className="btn btn-outline" onClick={() => setDetailPlan((session as any).workoutPlan || null)}>Chi tiết</button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && getCurrentData().length === 0 && (
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="text-gray-400 mb-4 empty-illustration">
            {/* <CalendarIcon className="w-16 h-16 mx-auto" /> */}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'history' ? 'Chưa hoàn thành bài tập nào' : 'Chưa có kế hoạch nào'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'history' 
              ? 'Bắt đầu tập luyện để xem lịch sử'
              : 'Tạo kế hoạch tập luyện đầu tiên của bạn'
            }
          </p>
          {activeTab !== 'history' && (
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowGenerator(true)}
                className="btn btn-primary"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Tạo tự động
              </button>
              <button className="btn btn-outline">
                <PlusIcon className="w-4 h-4 mr-2" />
                Tạo thủ công
              </button>
            </div>
          )}
        </div>
      )}

      {/* Workout Plan Generator Modal */}
      {showGenerator && (
        <WorkoutPlanGenerator
          onPlanGenerated={handlePlanGenerated}
          onClose={() => setShowGenerator(false)}
        />
      )}

      {activeSession && (
        <WorkoutSessionModal
          session={activeSession}
          onClose={async () => {
            setActiveSession(null);
            setActiveTab('history');
            await Promise.all([loadWorkoutSessions(), loadWorkoutPlans()]);
          }}
          onCompleted={async (updated) => {
            setActiveSession(null);
            setActiveTab('history');
            await Promise.all([loadWorkoutSessions(), loadWorkoutPlans()]);
            if (updated) {
              toast.success(`Hoàn thành: ${updated.totalDuration} phút • ${updated.totalCaloriesBurned} cal • ${updated.completionRate}%`);
            }
          }}
        />
      )}

      {detailPlan && (
        <WorkoutPlanDetailModal
          plan={detailPlan}
          onClose={() => setDetailPlan(null)}
        />
      )}

      {showManual && (
        <ManualPlanModal
          onClose={() => { setShowManual(false); setDetailPlan(null); }}
          onCreated={async () => { await loadWorkoutPlans(); setActiveTab('my-plans'); }}
          editingPlan={detailPlan}
        />
      )}
    </>
  );
};

export default Workouts;
