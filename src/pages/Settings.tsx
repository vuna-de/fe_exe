import React, { useState } from 'react';
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  TrophyIcon,
  EnvelopeIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  KeyIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import './Workouts.css';
import './Profile.css';
import './Settings.css';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      workoutReminders: true,
      achievementAlerts: true,
      weeklyReports: false,
      marketingEmails: false,
      pushNotifications: true
    },
    privacy: {
      profileVisibility: 'friends',
      shareProgress: true,
      dataCollection: true
    },
    preferences: {
      theme: 'light',
      language: 'vi',
      units: 'metric',
      startOfWeek: 'monday'
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement save settings API call
    console.log('Saving settings:', settings);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account API call
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  return (
    <>
      {/* Header theo style chung */}
      <div className="welcome-section mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="welcome-title">Cài đặt ⚙️</h1>
            <p className="welcome-subtitle">Tùy chỉnh trải nghiệm ứng dụng theo sở thích của bạn</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Notifications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title flex items-center">
              <BellIcon className="w-5 h-5 mr-2" />
              Thông báo
            </h3>
            <p className="text-sm text-gray-600 mt-1">Quản lý các nhắc nhở và bản tin bạn nhận</p>
          </div>
          <div className="section-content">
            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon blue">
                  <BellIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Nhắc nhở tập luyện</h4>
                  <p>Nhận thông báo về lịch tập của bạn</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.notifications.workoutReminders} onChange={(e) => handleSettingChange('notifications', 'workoutReminders', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon green">
                  <TrophyIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Thông báo thành tích</h4>
                  <p>Nhận thông báo khi đạt được thành tích mới</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.notifications.achievementAlerts} onChange={(e) => handleSettingChange('notifications', 'achievementAlerts', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon orange">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Báo cáo hàng tuần</h4>
                  <p>Nhận tóm tắt tiến độ hàng tuần qua email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.notifications.weeklyReports} onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon purple">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Email marketing</h4>
                  <p>Nhận thông tin về tính năng mới và ưu đãi</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.notifications.marketingEmails} onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              Bảo mật & Quyền riêng tư
            </h3>
            <p className="text-sm text-gray-600 mt-1">Kiểm soát dữ liệu cá nhân và quyền truy cập</p>
          </div>
          <div className="section-content">
            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon blue">
                  <ShieldCheckIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Hiển thị hồ sơ</h4>
                  <p>Quy định ai có thể xem thông tin của bạn</p>
                </div>
              </div>
              <select className="input input-fit-content" value={settings.privacy.profileVisibility} onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}>
                <option value="public">Công khai</option>
                <option value="friends">Chỉ bạn bè</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon green">
                  <DevicePhoneMobileIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Chia sẻ tiến độ</h4>
                  <p>Cho phép bạn bè xem tiến độ tập luyện</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.privacy.shareProgress} onChange={(e) => handleSettingChange('privacy', 'shareProgress', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon purple">
                  <KeyIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Xác thực 2 bước</h4>
                  <p>Tăng cường bảo mật cho tài khoản</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.security.twoFactorAuth} onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="p-4">
              <button className="btn btn-outline w-full flex items-center justify-center">
                <KeyIcon className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              Tùy chọn hiển thị
            </h3>
            <p className="text-sm text-gray-600 mt-1">Cá nhân hóa giao diện và ngôn ngữ</p>
          </div>
          <div className="section-content">
            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon blue">
                  <ComputerDesktopIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Giao diện</h4>
                  <p>Chọn chế độ sáng, tối hoặc tự động</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className={`btn ${settings.preferences.theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSettingChange('preferences', 'theme', 'light')}
                >
                  <SunIcon className="w-4 h-4 mr-2" />Sáng
                </button>
                <button
                  className={`btn ${settings.preferences.theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSettingChange('preferences', 'theme', 'dark')}
                >
                  <MoonIcon className="w-4 h-4 mr-2" />Tối
                </button>
                <button
                  className={`btn ${settings.preferences.theme === 'auto' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSettingChange('preferences', 'theme', 'auto')}
                >
                  <ComputerDesktopIcon className="w-4 h-4 mr-2" />Tự động
                </button>
              </div>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon green">
                  <GlobeAltIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Ngôn ngữ</h4>
                  <p>Áp dụng cho toàn bộ giao diện</p>
                </div>
              </div>
              <select className="input input-fit-content" value={settings.preferences.language} onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon orange">
                  <DevicePhoneMobileIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Đơn vị đo lường</h4>
                  <p>Chọn hệ mét hoặc Anh</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className={`btn ${settings.preferences.units === 'metric' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleSettingChange('preferences', 'units', 'metric')}>Mét</button>
                <button className={`btn ${settings.preferences.units === 'imperial' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleSettingChange('preferences', 'units', 'imperial')}>Anh</button>
              </div>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon purple">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="workout-details">
                  <h4>Bắt đầu tuần từ</h4>
                  <p>Ảnh hưởng tới lịch và báo cáo</p>
                </div>
              </div>
              <select className="input input-fit-content" value={settings.preferences.startOfWeek} onChange={(e) => handleSettingChange('preferences', 'startOfWeek', e.target.value)}>
                <option value="monday">Thứ Hai</option>
                <option value="sunday">Chủ Nhật</option>
              </select>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title flex items-center">
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
              Hỗ trợ
            </h3>
            <p className="text-sm text-gray-600 mt-1">Kênh trợ giúp và tài liệu</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="dashboard-quick-action">
              <div className="dashboard-quick-action-icon"><QuestionMarkCircleIcon className="w-5 h-5" /></div>
              <div className="dashboard-quick-action-content"><h4>Trung tâm trợ giúp</h4><p>FAQ và hướng dẫn</p></div>
            </div>
            <div className="dashboard-quick-action">
              <div className="dashboard-quick-action-icon" style={{background: '#dcfce7', color: '#16a34a'}}><EnvelopeIcon className="w-5 h-5" /></div>
              <div className="dashboard-quick-action-content"><h4>Liên hệ hỗ trợ</h4><p>Gửi yêu cầu cho đội ngũ</p></div>
            </div>
            <div className="dashboard-quick-action">
              <div className="dashboard-quick-action-icon" style={{background: '#fee2e2', color: '#dc2626'}}><ExclamationTriangleIcon className="w-5 h-5" /></div>
              <div className="dashboard-quick-action-content"><h4>Báo cáo lỗi</h4><p>Giúp chúng tôi cải thiện</p></div>
            </div>
            <div className="dashboard-quick-action">
              <div className="dashboard-quick-action-icon" style={{background: '#ede9fe', color: '#7c3aed'}}><ShieldCheckIcon className="w-5 h-5" /></div>
              <div className="dashboard-quick-action-content"><h4>Điều khoản sử dụng</h4><p>Chính sách & điều khoản</p></div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="dashboard-section border-red-200">
          <div className="section-header bg-red-50">
            <h3 className="section-title flex items-center text-red-900">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Vùng nguy hiểm
            </h3>
          </div>
          <div className="section-content">
            <div className="workout-item">
              <div className="workout-info">
                <div className="workout-icon orange"><TrashIcon className="w-4 h-4" /></div>
                <div className="workout-details">
                  <h4 className="text-red-800">Xóa tài khoản</h4>
                  <p className="text-red-600">Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.</p>
                </div>
              </div>
              <button className="profile-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Xóa tài khoản</button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary shadow-lg"
        >
          Lưu cài đặt
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa tài khoản</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu sẽ bị mất vĩnh viễn.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa tài khoản
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
