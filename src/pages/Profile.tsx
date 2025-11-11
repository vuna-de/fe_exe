import React, { useState, useEffect } from 'react';
import { 
  CameraIcon,
  PencilIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ScaleIcon,
  ArrowUpIcon,
  FlagIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../store/authStore';
import { userService } from '../services/authService';
import { getWorkoutStats, getWorkoutSessions } from '../services/workoutService';
import Button from '../components/ui/Button';
import Avatar from '../components/Avatar';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalDurationMin, setTotalDurationMin] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    fitnessGoal: user?.fitnessGoal || '',
    activityLevel: user?.activityLevel || 'moderate',
    bio: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        fitnessGoal: user.fitnessGoal || '',
        activityLevel: user.activityLevel || 'moderate',
        bio: ''
      });
    }
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s = await getWorkoutStats('month');
        setTotalWorkouts(s.stats.totalSessions || 0);
        setTotalDurationMin(Math.round((s.stats.totalDuration || 0)));
        setTotalCalories(Math.round(s.stats.totalCalories || 0));
        setStreakDays(s.stats.currentStreak || 0);
        // Optional: có thể dùng bestStreak ở nơi khác nếu cần
      } catch (e) {
        // ignore
      }
    };

    const loadSubscription = async () => {
      try {
        const subData = await userService.getSubscription();
        setSubscription(subData.subscription);
        setSubscriptionPlan(subData.subscriptionPlan);
      } catch (e) {
        // ignore - user might not have subscription
      }
    };

    loadStats();
    loadSubscription();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      alert('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }

    if (formData.height) {
      const height = Number(formData.height);
      if (isNaN(height) || height < 100 || height > 250) {
        alert('Chiều cao phải từ 100cm đến 250cm');
        return false;
      }
    }

    if (formData.weight) {
      const weight = Number(formData.weight);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        alert('Cân nặng phải từ 30kg đến 300kg');
        return false;
      }
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        alert('Tuổi phải từ 13 đến 120');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender as 'male' | 'female' | 'other' || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        fitnessGoal: formData.fitnessGoal as 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' || undefined,
        activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' || undefined
      };
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === '') {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const response = await userService.updateProfile(updateData);
      updateUser(response.user);
      alert(response.message || 'Cập nhật profile thành công!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await userService.uploadAvatar(file);
      
      if (response.success && user) {
        // Cập nhật avatar URL với base URL
        const avatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${response.data.avatar}`;
        const updatedUser = { ...user, avatar: avatarUrl };
        updateUser(updatedUser);
        
        console.log('Avatar uploaded successfully:', response.message);
        alert('Cập nhật ảnh đại diện thành công!');
      }
      
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      alert(error.message || 'Có lỗi xảy ra khi upload ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Thiếu cân', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (bmi < 25) return { text: 'Bình thường', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (bmi < 30) return { text: 'Thừa cân', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { text: 'Béo phì', color: 'text-red-600', bgColor: 'bg-red-50' };
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

  const getFitnessGoalText = (goal: string) => {
    const goals = {
      weight_loss: 'Giảm cân',
      muscle_gain: 'Tăng cơ',
      maintenance: 'Duy trì',
      endurance: 'Tăng sức bền'
    };
    return goals[goal as keyof typeof goals] || goal;
  };

  const bmi = calculateBMI(Number(formData.height), Number(formData.weight));
  const bmiStatus = bmi ? getBMIStatus(Number(bmi)) : null;

  const achievements = [
    { id: 1, name: 'Người mới bắt đầu', description: 'Hoàn thành bài tập đầu tiên', icon: '🌟', earned: true },
    { id: 2, name: 'Kiên trì 7 ngày', description: 'Tập luyện liên tục 7 ngày', icon: '🔥', earned: true },
    { id: 3, name: 'Chiến binh 30 ngày', description: 'Tập luyện liên tục 30 ngày', icon: '💪', earned: false },
    { id: 4, name: 'Đốt cháy 1000 calories', description: 'Đốt cháy tổng cộng 1000 calories', icon: '⚡', earned: true },
    { id: 5, name: 'Hoàn thành 50 bài tập', description: 'Hoàn thành 50 bài tập', icon: '🏆', earned: false },
    { id: 6, name: 'Chuyên gia dinh dưỡng', description: 'Theo dõi dinh dưỡng 14 ngày', icon: '🥗', earned: false }
  ];

  const fmtMinutes = (mins: number) => {
    const m = Math.max(0, Math.round(mins));
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h <= 0) return `${r} phút`;
    if (r === 0) return `${h} giờ`;
    return `${h} giờ ${r} phút`;
  };

  const formatSubscriptionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { status: 'none', text: 'Chưa có gói đăng ký', color: 'text-gray-500' };
    
    const daysRemaining = getDaysRemaining(subscription.endDate);
    
    if (daysRemaining <= 0) {
      return { status: 'expired', text: 'Đã hết hạn', color: 'text-red-500' };
    } else if (daysRemaining <= 7) {
      return { status: 'expiring', text: `Còn ${daysRemaining} ngày`, color: 'text-orange-500' };
    } else {
      return { status: 'active', text: `Còn ${daysRemaining} ngày`, color: 'text-green-500' };
    }
  };

  const stats = [
    { label: 'Tổng bài tập', value: `${totalWorkouts}`, icon: FireIconSolid, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { label: 'Thời gian tập', value: fmtMinutes(totalDurationMin), icon: ClockIcon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { label: 'Calories đốt', value: `${totalCalories}`, icon: FireIconSolid, color: 'text-red-500', bgColor: 'bg-red-100' },
    { label: 'Streak hiện tại', value: `${streakDays} ngày`, icon: TrophyIconSolid, color: 'text-yellow-500', bgColor: 'bg-yellow-100' }
  ];

  const tabs = [
    { id: 'personal', name: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'stats', name: 'Thống kê', icon: FireIcon },
    { id: 'achievements', name: 'Thành tích', icon: TrophyIcon },
    { id: 'subscription', name: 'Gói đăng ký', icon: StarIcon }
  ];

  return (
    <>
      {/* Welcome section - giống Dashboard */}
      <div className="welcome-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="welcome-title">
              Hồ sơ cá nhân của {formData.fullName} 👤
            </h1>
            <p className="welcome-subtitle">
              Quản lý thông tin cá nhân và theo dõi tiến độ tập luyện của bạn
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user?.membershipType === 'premium' && (
              <div className="badge-premium">
                <TrophyIcon className="w-4 h-4" />
                Premium
              </div>
            )}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'secondary' : 'primary'}
              size="sm"
              icon={<PencilIcon />}
            >
              {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid - giống Dashboard */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color === 'text-orange-500' ? 'orange' : 
                stat.color === 'text-blue-500' ? 'blue' : 
                stat.color === 'text-red-500' ? 'orange' : 'purple'}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Main Profile Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Thông tin hồ sơ</h3>
          </div>
          
           {/* Enhanced Tab Navigation */}
           <div className="profile-tab-container">
             <nav className="flex" aria-label="Tabs">
               {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                 >
                   <tab.icon />
                   {tab.name}
                 </button>
               ))}
             </nav>
           </div>

          {/* Tab Content */}
          <div className="section-content">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="p-6">
                {isEditing && (
                  <div className="profile-form-container">
                    <div className="profile-form-header">
                      <div className="profile-form-icon">
                        <SparklesIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="profile-form-title">Chỉnh sửa thông tin cá nhân</h3>
                        <p className="profile-form-subtitle">Cập nhật thông tin để có trải nghiệm tốt hơn</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="profile-form-grid">
                        {/* Full Name */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <UserIcon className="profile-form-label-icon" />
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="profile-form-input"
                            placeholder="Nhập họ và tên"
                          />
                        </div>

                        {/* Phone */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <PhoneIcon className="profile-form-label-icon" />
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="profile-form-input"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <CalendarIcon className="profile-form-label-icon" />
                            Ngày sinh
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="profile-form-input"
                          />
                        </div>

                        {/* Gender */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <UserIcon className="profile-form-label-icon" />
                            Giới tính
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="profile-form-select"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>

                        {/* Height */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <ArrowUpIcon className="profile-form-label-icon" />
                            Chiều cao (cm)
                          </label>
                          <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            className="profile-form-input"
                            placeholder="Nhập chiều cao"
                            min="100"
                            max="250"
                          />
                        </div>

                        {/* Weight */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <ScaleIcon className="profile-form-label-icon" />
                            Cân nặng (kg)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            className="profile-form-input"
                            placeholder="Nhập cân nặng"
                            min="30"
                            max="300"
                          />
                        </div>

                        {/* Fitness Goal */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <FlagIcon className="profile-form-label-icon" />
                            Mục tiêu fitness
                          </label>
                          <select
                            name="fitnessGoal"
                            value={formData.fitnessGoal}
                            onChange={handleInputChange}
                            className="profile-form-select"
                          >
                            <option value="">Chọn mục tiêu</option>
                            <option value="weight_loss">Giảm cân</option>
                            <option value="muscle_gain">Tăng cơ</option>
                            <option value="maintenance">Duy trì</option>
                            <option value="endurance">Tăng sức bền</option>
                          </select>
                        </div>

                        {/* Activity Level */}
                        <div className="profile-form-field">
                          <label className="profile-form-label">
                            <HeartIcon className="profile-form-label-icon" />
                            Mức độ hoạt động
                          </label>
                          <select
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleInputChange}
                            className="profile-form-select"
                          >
                            <option value="sedentary">Ít vận động</option>
                            <option value="light">Vận động nhẹ</option>
                            <option value="moderate">Vận động vừa</option>
                            <option value="active">Vận động nhiều</option>
                            <option value="very_active">Vận động rất nhiều</option>
                          </select>
                        </div>
                      </div>

                      {/* Enhanced BMI Display */}
                      {bmi && (
                        <div className="profile-bmi-card">
                          <div className="profile-bmi-header">
                            <div className="profile-bmi-icon">
                              <ScaleIcon className="w-5 h-5" />
                            </div>
                            <h4 className="profile-bmi-title">Chỉ số BMI</h4>
                          </div>
                          <div className="profile-bmi-content">
                            <span className="profile-bmi-value">{bmi}</span>
                            <span className={`profile-bmi-status ${bmiStatus?.color}`}>
                              {bmiStatus?.text}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Action Buttons */}
                      <div className="profile-form-actions">
                        <Button
                          type="submit"
                          variant="success"
                          size="md"
                          loading={isLoading}
                          disabled={isLoading}
                          icon={!isLoading ? <CheckIcon /> : undefined}
                        >
                          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={() => setIsEditing(false)}
                          icon={<XMarkIcon />}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {!isEditing && (
                  <div className="space-y-6">
                    {/* Personal Info Items */}
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon blue">
                          <EnvelopeIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Email</h4>
                          <p>{formData.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon green">
                          <PhoneIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Số điện thoại</h4>
                          <p>{formData.phone || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon purple">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Ngày sinh</h4>
                          <p>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon orange">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Giới tính</h4>
                          <p>{formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : formData.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon blue">
                          <ArrowUpIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Chiều cao</h4>
                          <p>{formData.height ? `${formData.height} cm` : 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon green">
                          <ScaleIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Cân nặng</h4>
                          <p>{formData.weight ? `${formData.weight} kg` : 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                      {bmi && (
                        <div className="workout-badge">
                          BMI: {bmi} ({bmiStatus?.text})
                        </div>
                      )}
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon purple">
                          <FlagIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Mục tiêu fitness</h4>
                          <p>{formData.fitnessGoal ? getFitnessGoalText(formData.fitnessGoal) : 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon orange">
                          <HeartIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Mức độ hoạt động</h4>
                          <p>{getActivityLevelText(formData.activityLevel)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="stat-icon orange mx-auto mb-4">
                    <FireIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Chi tiết thống kê</h4>
                  <p className="text-gray-600">Dữ liệu được cập nhật từ hoạt động tập luyện của bạn</p>
                </div>
                
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="workout-item">
                      <div className="workout-info">
                        <div className={`stat-icon ${stat.color === 'text-orange-500' ? 'orange' : 
                          stat.color === 'text-blue-500' ? 'blue' : 
                          stat.color === 'text-red-500' ? 'orange' : 'purple'}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="workout-details">
                          <h4>{stat.label}</h4>
                          <p>{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="stat-icon purple mx-auto mb-4">
                    <TrophyIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Huy hiệu thành tích</h4>
                  <p className="text-gray-600">Những cột mốc quan trọng trong hành trình fitness</p>
                </div>
                
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="workout-item">
                      <div className="workout-info">
                        <div className={`workout-icon ${achievement.earned ? 'green' : 'purple'}`}>
                          <span className="text-lg">{achievement.icon}</span>
                        </div>
                        <div className="workout-details">
                          <h4 className={achievement.earned ? 'text-green-700' : 'text-gray-700'}>
                            {achievement.name}
                          </h4>
                          <p className={achievement.earned ? 'text-green-600' : 'text-gray-500'}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      {achievement.earned && (
                        <div className="workout-badge">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Đã đạt được
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="stat-icon green mx-auto mb-4">
                    <StarIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Thông tin gói đăng ký</h4>
                  <p className="text-gray-600">Chi tiết về gói dịch vụ hiện tại của bạn</p>
                </div>
                
                {subscription ? (
                  <div className="space-y-4">
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon green">
                          <StarIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Tên gói</h4>
                          <p>{subscriptionPlan?.name || 'Premium'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon blue">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Ngày bắt đầu</h4>
                          <p>{formatSubscriptionDate(subscription.startDate)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon orange">
                          <ClockIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Ngày hết hạn</h4>
                          <p>{formatSubscriptionDate(subscription.endDate)}</p>
                        </div>
                      </div>
                      <div className={`workout-badge ${getSubscriptionStatus().color}`}>
                        {getSubscriptionStatus().text}
                      </div>
                    </div>
                    
                    <div className="workout-item">
                      <div className="workout-info">
                        <div className="workout-icon purple">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <div className="workout-details">
                          <h4>Trạng thái</h4>
                          <p className={getSubscriptionStatus().color}>
                            {getSubscriptionStatus().text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {subscriptionPlan?.description && (
                      <div className="workout-item">
                        <div className="workout-info">
                          <div className="workout-icon blue">
                            <EyeIcon className="w-4 h-4" />
                          </div>
                          <div className="workout-details">
                            <h4>Mô tả gói</h4>
                            <p>{subscriptionPlan.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="workout-icon gray mx-auto mb-4">
                      <StarIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có gói đăng ký</h4>
                    <p className="text-gray-600 mb-4">Bạn chưa đăng ký gói dịch vụ nào</p>
                    <button 
                      onClick={() => window.location.href = '/pricing'}
                      className="btn btn-primary"
                    >
                      Xem gói dịch vụ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Thông tin tóm tắt</h3>
            </div>
            <div className="profile-section">
              <div className="relative inline-block">
                <Avatar
                  src={user?.avatar}
                  alt={formData.fullName}
                  className="profile-avatar-large"
                  size={128}
                  fallbackName={formData.fullName || 'User'}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploadingAvatar}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`profile-avatar-btn ${isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title="Đổi ảnh đại diện"
                >
                  {isUploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CameraIcon className="w-4 h-4" />
                  )}
                </label>
              </div>
              
              <h4 className="profile-name">{formData.fullName}</h4>
              <p className="profile-email">{formData.email}</p>
              
              <div className="profile-stats">
                {user?.age && (
                  <div className="profile-stat">
                    <span className="profile-stat-label">Tuổi:</span>
                    <span className="profile-stat-value">{user.age}</span>
                  </div>
                )}
                
                <div className="profile-stat">
                  <span className="profile-stat-label">Mục tiêu:</span>
                  <span className="profile-stat-value">
                    {formData.fitnessGoal ? getFitnessGoalText(formData.fitnessGoal) : 'Chưa cập nhật'}
                  </span>
                </div>
                
                <div className="profile-stat">
                  <span className="profile-stat-label">Hoạt động:</span>
                  <span className="profile-stat-value primary">
                    {getActivityLevelText(formData.activityLevel)}
                  </span>
                </div>

                {bmi && (
                  <div className="profile-stat">
                    <span className="profile-stat-label">BMI:</span>
                    <span className={`profile-stat-value ${bmiStatus?.color === 'text-green-600' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {bmi} ({bmiStatus?.text})
                    </span>
                  </div>
                )}

                {/* Subscription Info */}
                {subscription && (
                  <div className="profile-stat">
                    <span className="profile-stat-label">Gói đăng ký:</span>
                    <span className={`profile-stat-value ${getSubscriptionStatus().color}`}>
                      {getSubscriptionStatus().text}
                    </span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setIsEditing(true)}
                variant="primary"
                size="md"
                fullWidth
                icon={<PencilIcon />}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Hành động nhanh</h3>
            </div>
            <div className="section-content">
              <div className="workout-item">
                <label htmlFor="avatar-upload-quick" className="workout-info cursor-pointer">
                  <div className="workout-icon blue">
                    {isUploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CameraIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="workout-details">
                    <h4>Đổi ảnh đại diện</h4>
                    <p>{isUploadingAvatar ? 'Đang upload...' : 'Cập nhật hình ảnh profile'}</p>
                  </div>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload-quick"
                  disabled={isUploadingAvatar}
                />
              </div>
              
              {/* Nếu user là premium thì hiển thị nút nâng cấp Premium */}
              {user?.membershipType !== 'premium' && (
                <div className="workout-item" onClick={() => window.location.href = '/pricing'}>
                  <div className="workout-info">
                    <div className="workout-icon green">
                      <StarIcon className="w-4 h-4" />
              
                    </div>
                    <div className="workout-details">
                      <h4>Nâng cấp Premium</h4>
                      <p>Mở khóa tính năng cao cấp</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nếu user không là premium thì hiển thị nút nâng cấp Premium */}
              {user?.membershipType === 'premium' && (
                <div className="workout-item">
                  <div className="workout-info">
                    <div className="workout-icon green">
                      <StarIcon className="w-4 h-4" />
                    </div>
                    <div className="workout-details">
                      <h4>Bạn đã là Premium</h4>
                    </div>
                  </div>
                </div>
              )}

              <div className="workout-item">
                <div className="workout-info">
                  <div className="workout-icon red">
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  </div>
                  <div className="workout-details">
                    <h4>Đăng xuất</h4>
                    <p>Thoát từ tài khoản</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;