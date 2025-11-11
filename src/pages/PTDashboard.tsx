import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  HeartIcon,
  BeakerIcon,
  CalendarIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import {
  PTDashboardData,
  PTClient,
  ClientDetail,
  ClientProgress,
  ClientPlan,
  getPTDashboardStats,
  getPTClients,
  getPTClientDetail,
  updateClientStatus,
  getClientProgress,
  addClientProgress,
  getClientPlans,
  sendClientPlan,
  updatePlanStatus,
  getClientAnalytics,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  getMoodLabel,
  getMoodColor,
  getEnergyLabel,
  getEnergyColor,
  formatDate,
  formatDateTime,
  calculateBMI,
  getBMICategory,
  getBMIColor,
  formatWeight,
  formatBodyFat,
  formatMeasurements
} from '../services/ptDashboardService';
import './PTDashboard.css';

const PTDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<PTDashboardData | null>(null);
  const [clients, setClients] = useState<PTClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [showSendPlan, setShowSendPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Form data
  const [progressForm, setProgressForm] = useState<Partial<ClientProgress>>({});
  const [planForm, setPlanForm] = useState({
    type: 'workout' as 'workout' | 'nutrition' | 'general',
    title: '',
    description: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: ''
  });

  useEffect(() => {
    loadDashboardData();
    loadClients();
  }, []);

  useEffect(() => {
    loadClients();
  }, [currentPage, statusFilter, searchTerm]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getPTDashboardStats();
      setDashboardData(data);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await getPTClients({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setClients(response.clients);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadClientDetail = async (clientId: string) => {
    try {
      const detail = await getPTClientDetail(clientId);
      setSelectedClient(detail);
      setShowClientDetail(true);
    } catch (err) {
      console.error('Error loading client detail:', err);
    }
  };

  const handleUpdateClientStatus = async (clientId: string, status: string) => {
    try {
      await updateClientStatus(clientId, status);
      loadClients();
      if (selectedClient && selectedClient.client._id === clientId) {
        loadClientDetail(clientId);
      }
    } catch (err) {
      console.error('Error updating client status:', err);
    }
  };

  const handleAddProgress = async () => {
    if (!selectedClient) return;
    
    try {
      await addClientProgress(selectedClient.client._id, progressForm);
      setProgressForm({});
      setShowAddProgress(false);
      loadClientDetail(selectedClient.client._id);
    } catch (err) {
      console.error('Error adding progress:', err);
    }
  };

  const handleSendPlan = async () => {
    if (!selectedClient) return;
    
    try {
      await sendClientPlan(selectedClient.client._id, planForm);
      setPlanForm({
        type: 'workout',
        title: '',
        description: '',
        content: '',
        priority: 'medium',
        dueDate: ''
      });
      setShowSendPlan(false);
      loadClientDetail(selectedClient.client._id);
    } catch (err) {
      console.error('Error sending plan:', err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-gray-600">Đang tải dashboard PT...</p>
      </div>
    );
  }

  return (
    <div className="pt-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard PT 👨‍💼</h1>
          <p className="dashboard-subtitle">
            Quản lý khách hàng và theo dõi tiến độ tập luyện
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowSendPlan(true)}
          >
            <PlusIcon className="w-5 h-5" />
            Gửi kế hoạch
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.totalClients}</div>
              <div className="stat-label">Tổng khách hàng</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.activeClients}</div>
              <div className="stat-label">Khách hàng hoạt động</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FireIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.totalSessions}</div>
              <div className="stat-label">Buổi tập</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.totalPlansSent}</div>
              <div className="stat-label">Kế hoạch đã gửi</div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Section */}
      <div className="clients-section">
        <div className="section-header">
          <h2>Danh sách khách hàng</h2>
          <div className="filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="active">Đang hoạt động</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="clients-grid">
          {clients.map((client) => (
            <div key={client._id} className="client-card">
              <div className="client-header">
                <div className="client-avatar">
                  <img 
                    src={client.client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.client.fullName)}&background=0ea5e9&color=fff`}
                    alt={client.client.fullName}
                  />
                </div>
                <div className="client-info">
                  <h3 className="client-name">{client.client.fullName}</h3>
                  <p className="client-email">{client.client.email}</p>
                  <span className={`status-badge ${getStatusColor(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>
              </div>
              
              <div className="client-details">
                <div className="detail-item">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Bắt đầu: {formatDate(client.startDate)}</span>
                </div>
                <div className="detail-item">
                  <ClockIcon className="w-4 h-4" />
                  <span>Thời gian: {client.duration} ngày</span>
                </div>
                {client.goals.length > 0 && (
                  <div className="detail-item">
                    <StarIcon className="w-4 h-4" />
                    <span>Mục tiêu: {client.goals.join(', ')}</span>
                  </div>
                )}
              </div>
              
              <div className="client-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => loadClientDetail(client.client._id)}
                >
                  <EyeIcon className="w-4 h-4" />
                  Chi tiết
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelectedClient({ client } as ClientDetail);
                    setShowAddProgress(true);
                  }}
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm tiến độ
                </button>
              </div>
            </div>
          ))}
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
              Trang {currentPage} / {totalPages} ({totalItems} khách hàng)
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
      </div>

      {/* Client Detail Modal */}
      {showClientDetail && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-card large">
            <div className="modal-header">
              <h2>Chi tiết khách hàng - {selectedClient.client.client.fullName}</h2>
              <button className="modal-close" onClick={() => setShowClientDetail(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="client-detail-tabs">
                <div className="tab-content">
                  {/* Client Info */}
                  <div className="client-info-section">
                    <h3>Thông tin khách hàng</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedClient.client.client.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Trạng thái:</span>
                        <span className={`badge ${getStatusColor(selectedClient.client.status)}`}>
                          {getStatusLabel(selectedClient.client.status)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Thời gian:</span>
                        <span className="info-value">{selectedClient.client.duration} ngày</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Mục tiêu:</span>
                        <span className="info-value">{selectedClient.client.goals.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Progress */}
                  <div className="progress-section">
                    <h3>Tiến độ gần đây</h3>
                    <div className="progress-list">
                      {selectedClient.recentProgress.map((progress) => (
                        <div key={progress._id} className="progress-item">
                          <div className="progress-date">{formatDate(progress.date)}</div>
                          <div className="progress-details">
                            {progress.weight && (
                              <span className="progress-metric">
                                Cân nặng: {formatWeight(progress.weight)}
                              </span>
                            )}
                            {progress.bodyFat && (
                              <span className="progress-metric">
                                Mỡ: {formatBodyFat(progress.bodyFat)}
                              </span>
                            )}
                            {progress.mood && (
                              <span className={`progress-metric ${getMoodColor(progress.mood)}`}>
                                Tâm trạng: {getMoodLabel(progress.mood)}
                              </span>
                            )}
                            {progress.workoutCompleted && (
                              <span className="progress-metric text-green-600">
                                ✓ Hoàn thành tập luyện
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Plans */}
                  <div className="plans-section">
                    <h3>Kế hoạch gần đây</h3>
                    <div className="plans-list">
                      {selectedClient.recentPlans.map((plan) => (
                        <div key={plan._id} className="plan-item">
                          <div className="plan-header">
                            <h4 className="plan-title">{plan.title}</h4>
                            <span className={`priority-badge ${getPriorityColor(plan.priority)}`}>
                              {getPriorityLabel(plan.priority)}
                            </span>
                          </div>
                          <p className="plan-description">{plan.description}</p>
                          <div className="plan-meta">
                            <span className="plan-type">{plan.type}</span>
                            <span className="plan-date">{formatDateTime(plan.createdAt)}</span>
                            <span className={`plan-status ${getStatusColor(plan.status)}`}>
                              {getStatusLabel(plan.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowClientDetail(false)}
              >
                Đóng
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowAddProgress(true);
                  setShowClientDetail(false);
                }}
              >
                Thêm tiến độ
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowSendPlan(true);
                  setShowClientDetail(false);
                }}
              >
                Gửi kế hoạch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {showAddProgress && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Thêm tiến độ khách hàng</h2>
              <button className="modal-close" onClick={() => setShowAddProgress(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleAddProgress(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Cân nặng (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={progressForm.weight || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tỷ lệ mỡ (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={progressForm.bodyFat || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Khối lượng cơ (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={progressForm.muscleMass || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, muscleMass: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tâm trạng</label>
                    <select
                      value={progressForm.mood || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, mood: e.target.value as any }))}
                    >
                      <option value="">Chọn tâm trạng</option>
                      <option value="excellent">Tuyệt vời</option>
                      <option value="good">Tốt</option>
                      <option value="average">Bình thường</option>
                      <option value="poor">Kém</option>
                      <option value="terrible">Rất kém</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Năng lượng</label>
                    <select
                      value={progressForm.energy || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, energy: e.target.value as any }))}
                    >
                      <option value="">Chọn năng lượng</option>
                      <option value="high">Cao</option>
                      <option value="medium">Trung bình</option>
                      <option value="low">Thấp</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Giấc ngủ (giờ)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={progressForm.sleep || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, sleep: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Lượng nước (ml)</label>
                    <input
                      type="number"
                      value={progressForm.waterIntake || ''}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, waterIntake: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={progressForm.workoutCompleted || false}
                        onChange={(e) => setProgressForm(prev => ({ ...prev, workoutCompleted: e.target.checked }))}
                      />
                      Hoàn thành tập luyện
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    value={progressForm.notes || ''}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddProgress(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Thêm tiến độ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Send Plan Modal */}
      {showSendPlan && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Gửi kế hoạch cho khách hàng</h2>
              <button className="modal-close" onClick={() => setShowSendPlan(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSendPlan(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Loại kế hoạch</label>
                    <select
                      value={planForm.type}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="workout">Tập luyện</option>
                      <option value="nutrition">Dinh dưỡng</option>
                      <option value="general">Chung</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Độ ưu tiên</label>
                    <select
                      value={planForm.priority}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Ngày hết hạn</label>
                    <input
                      type="date"
                      value={planForm.dueDate}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    value={planForm.title}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Nội dung chi tiết</label>
                  <textarea
                    value={planForm.content}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSendPlan(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Gửi kế hoạch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTDashboard;
