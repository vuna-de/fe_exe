import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  HeartIcon, 
  ChartBarIcon, 
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../store/authStore';
import { getWorkoutStats, getWorkoutSessions } from '../services/workoutService';
import { getExercises } from '../services/exerciseService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [recentExercises, setRecentExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [showTip, setShowTip] = useState(true);
  const getFitnessGoalText = (goal: string) => {
    const goals = {
      weight_loss: 'Giảm cân',
      muscle_gain: 'Tăng cơ',
      maintenance: 'Duy trì',
      endurance: 'Tăng sức bền'
    };
    return goals[goal as keyof typeof goals] || goal;
  };
  const getActivityLevelText = (level: string) => {
    const levels = {
      sedentary: 'Ít vận động',
      light: 'Vận động nhẹ',
      moderate: 'Vận động vừa',
      active: 'Vận động nhiều',
      very_active: 'Vận động rất nhiều'
    };
    return levels[level as keyof typeof levels] || level;
  };
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, exercisesResponse, sessionsResponse] = await Promise.all([
        getWorkoutStats('month'),
        getExercises({}, 1, 6),
        getWorkoutSessions({ status: 'completed' }, 1, 5)
      ]);
      
      setWorkoutStats(statsResponse.stats);
      setRecentExercises(exercisesResponse.exercises);
      setRecentSessions(sessionsResponse.sessions || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Tổng số buổi tập',
      value: workoutStats?.totalSessions || user?.totalWorkouts || 0,
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Tuần này',
      value: '5 buổi',
      icon: CalendarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2',
      changeType: 'positive'
    },
    {
      name: 'Calories đã đốt',
      value: workoutStats?.totalCalories || '2,450',
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Thời gian tập',
      value: workoutStats?.totalDuration ? `${Math.round(workoutStats.totalDuration / 60)}h` : '12.5h',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+8%',
      changeType: 'positive'
    },
  ];
  
  const recentWorkouts = [
    {
      id: 1,
      name: 'Push Day - Ngực, Vai, Tay sau',
      date: '2024-01-15',
      duration: 65,
      calories: 320,
      completed: true,
    },
    {
      id: 2,
      name: 'Pull Day - Lưng, Tay trước',
      date: '2024-01-13',
      duration: 58,
      calories: 290,
      completed: true,
    },
    {
      id: 3,
      name: 'Leg Day - Chân, Mông',
      date: '2024-01-11',
      duration: 72,
      calories: 380,
      completed: true,
    },
  ];
  
  const upcomingWorkouts = [
    {
      id: 1,
      name: 'Full Body Workout',
      scheduledTime: '2024-01-16T09:00:00',
      estimatedDuration: 60,
    },
    {
      id: 2,
      name: 'Cardio & Core',
      scheduledTime: '2024-01-17T18:30:00',
      estimatedDuration: 45,
    },
  ];

  const quickActions = [
    {
      title: 'Bắt đầu tập ngay',
      description: 'Tạo phiên tập mới và bắt đầu ngay',
      icon: PlayIcon,
      color: 'from-green-500 to-emerald-600',
      href: '/workouts'
    },
    {
      title: 'Tạo kế hoạch mới',
      description: 'Tạo kế hoạch tập luyện cá nhân hóa',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-600',
      href: '/workouts'
    },
    {
      title: 'Duyệt bài tập',
      description: 'Khám phá thư viện bài tập phong phú',
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-cyan-600',
      href: '/exercises'
    },
    {
      title: 'Theo dõi tiến độ',
      description: 'Xem thống kê và tiến độ tập luyện',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-red-600',
      href: '/profile'
    }
  ];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getBMIStatus = (bmi: number | undefined) => {
    if (!bmi) return { text: 'Chưa có dữ liệu', color: 'text-gray-500' };
    
    if (bmi < 18.5) return { text: 'Thiếu cân', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Bình thường', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Thừa cân', color: 'text-yellow-600' };
    return { text: 'Béo phì', color: 'text-red-600' };
  };
  
  const bmiStatus = getBMIStatus(user?.bmi);
  
  return (
    <>
      {/* Enhanced Welcome section */}
      <div className="welcome-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="welcome-title">
              Chào mừng trở lại, {user?.fullName}! 👋
            </h1>
            <p className="welcome-subtitle">
              Hãy tiếp tục hành trình rèn luyện sức khỏe của bạn
            </p>
            {/* <div className="flex gap-4 mt-4">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                <PlayIcon className="w-5 h-5" />
                Bắt đầu tập ngay
              </button>
              <button className="border-2 border-white/30 hover:border-white/50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Tạo kế hoạch mới
              </button>
            </div> */}
          </div>
          {user?.membershipType === 'premium' && (
            <div className="badge-premium">
              <TrophyIcon className="w-4 h-4" />
              Premium
            </div>
          )}
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.bgColor === 'bg-orange-100' ? 'orange' : 
                stat.bgColor === 'bg-blue-100' ? 'blue' : 
                stat.bgColor === 'bg-green-100' ? 'green' : 'purple'}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-grid">
        {/* Recent workouts */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Buổi tập gần đây</h3>
          </div>
          <div className="section-content">
            {recentSessions.length === 0 && (
              <div className="p-6 text-gray-600 section-content-text">Chưa có buổi tập nào gần đây.</div>
            )}
            {recentSessions.map((session) => (
              <div key={session._id} className="workout-item">
                <div className="workout-info">
                  <div className="workout-icon green">
                    <FireIcon className="w-5 h-5" />
                  </div>
                  <div className="workout-details">
                    <h4>{session.name || session.workoutPlan?.name || 'Buổi tập'}</h4>
                    <p>{formatDate(session.startTime)} • {session.totalDuration} phút • {session.totalCaloriesBurned} calories</p>
                  </div>
                </div>
                <div className="workout-badge">{session.status === 'completed' ? 'Hoàn thành' : 'Đang tập'}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Profile summary */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Thông tin cá nhân</h3>
            </div>
            <div className="profile-section">
              <img
                className="profile-avatar-large"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0ea5e9&color=fff&size=128`}
                alt={user?.fullName}
              />
              
              <h4 className="profile-name">{user?.fullName}</h4>
              <p className="profile-email">{user?.email}</p>
              
              <div className="profile-stats">
                {user?.age && (
                  <div className="profile-stat">
                    <span className="profile-stat-label">Tuổi:</span>
                    <span className="profile-stat-value">{user.age}</span>
                  </div>
                )}
                
                <div className="profile-stat">
                  <span className="profile-stat-label">Mục tiêu:</span>
                  <span className="profile-stat-value">{user?.fitnessGoal ? getFitnessGoalText(user.fitnessGoal) : 'Chưa cập nhật'}</span>
                </div>
                
                <div className="profile-stat">
                  <span className="profile-stat-label">Cấp độ:</span>
                  <span className="profile-stat-value primary">{getActivityLevelText(user?.activityLevel || '')}</span>
                </div>
              </div>
              
              <button className="update-profile-btn" onClick={() => window.location.href = '/profile'}>
                Cập nhật hồ sơ
              </button>
            </div>
          </div>
          
          {/* Upcoming workouts */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Lịch tập sắp tới</h3>
            </div>
            <div className="section-content">
              {upcomingWorkouts.map((workout) => (
                <div key={workout.id} className="workout-item">
                  <div className="workout-info">
                    <div className="workout-icon blue">
                      <HeartIcon className="w-4 h-4" />
                    </div>
                    <div className="workout-details">
                      <h4>{workout.name}</h4>
                      <p>{formatTime(workout.scheduledTime)} • {workout.estimatedDuration} phút</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="section-footer">
              <button className="view-all-btn">
                Xem lịch tập đầy đủ
              </button>
            </div>
          </div>
        </div>
      </div>
      {showTip && (
        <div className="dashboard-floating-card show">
          <button 
            className="dashboard-floating-card-close"
            onClick={() => setShowTip(false)} // ✅ nhấn tắt
          >
            ×
          </button>
          <h4 className="font-bold mb-2">Mẹo hôm nay 💡</h4>
          <p className="text-sm text-gray-600">
            Hãy thử thêm một bài tập cardio sau buổi tập sức mạnh để tăng hiệu quả đốt calories!
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {/* <div className="quick-actions">
        {quickActions.map((action, index) => (
          <div 
            key={action.title} 
            className="action-card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => window.location.href = action.href}
          >
            <div className={`action-icon bg-gradient-to-r ${action.color}`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="action-title">{action.title}</h3>
            <p className="action-description">{action.description}</p>
          </div>
        ))}
      </div> */}
    </>
  );
};

export default Dashboard;
