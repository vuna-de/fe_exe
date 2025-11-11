import React, { useEffect, useState } from 'react';
import { getAdminDashboard, type AdminDashboardData } from '../services/adminService';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

import './Admin.css';

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  to: string; 
  icon: React.ComponentType<any>; 
  bgGradient: string;
}> = ({ label, value, to, icon: Icon, bgGradient }) => (
  <Link to={to} className="group link-stat">
    <div className="stat-card-modern">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1 text-stat">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 text-stat">{value}</p>
        </div>
        <div className={`icon-circle ${bgGradient}`}>
          <Icon className="w-6 h-6 text-white icon-stat" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="trend-up">▲ 12% </span>
        <span className="text-gray-500 ml-1">so với tháng trước</span>
      </div>
    </div>
  </Link>
);


const Admin: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        console.log(res);
        setData(res);
        setError(null);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Tổng quan hệ thống và quản lý hiệu quả</p>
        </div>

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
              label="Người dùng" 
              value={data.stats.totalUsers} 
              to="/admin/users" 
              icon={UsersIcon} 
              bgGradient="bg-gradient-to-r from-blue-500 to-blue-600" 
            />
            <StatCard 
              label="Bài tập" 
              value={data.stats.totalExercises} 
              to="/admin/exercises" 
              icon={ChartBarIcon} 
              bgGradient="bg-gradient-to-r from-green-500 to-green-600" 
            />
            <StatCard 
              label="Kế hoạch tập" 
              value={data.stats.totalWorkoutPlans} 
              to="/admin/plans" 
              icon={DocumentTextIcon} 
              bgGradient="bg-gradient-to-r from-purple-500 to-purple-600" 
            />
            <StatCard 
              label="Thanh toán" 
              value={data.stats.totalPayments} 
              to="/admin/payments" 
              icon={CreditCardIcon} 
              bgGradient="bg-gradient-to-r from-orange-500 to-orange-600" 
            />
          </div>
        )}

        {/* Additional Stats Row */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard 
              label="Voucher" 
              value={data.stats.totalVouchers} 
              to="/admin/vouchers" 
              icon={CreditCardIcon} 
              bgGradient="bg-gradient-to-r from-pink-500 to-pink-600" 
            />
            <StatCard 
              label="Voucher hoạt động" 
              value={data.stats.activeVouchers} 
              to="/admin/vouchers" 
              icon={ArrowTrendingUpIcon} 
              bgGradient="bg-gradient-to-r from-emerald-500 to-emerald-600" 
            />
            <StatCard 
              label="Doanh thu" 
              value={`${data.stats.totalRevenue.toLocaleString()} VNĐ`} 
              to="/admin/payments" 
              icon={CurrencyDollarIcon} 
              bgGradient="bg-gradient-to-r from-yellow-500 to-yellow-600" 
            />
          </div>
        )}

        {/* Meal Stats Row */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard 
              label="Món ăn" 
              value={data.stats.totalMeals} 
              to="/admin/meals" 
              icon={DocumentTextIcon} 
              bgGradient="bg-gradient-to-r from-red-500 to-red-600" 
            />
            <StatCard 
              label="Món hoạt động" 
              value={data.stats.activeMeals} 
              to="/admin/meals" 
              icon={ArrowTrendingUpIcon} 
              bgGradient="bg-gradient-to-r from-orange-500 to-orange-600" 
            />
            <StatCard 
              label="Món công khai" 
              value={data.stats.publicMeals} 
              to="/admin/meals" 
              icon={ChartBarIcon} 
              bgGradient="bg-gradient-to-r from-teal-500 to-teal-600" 
            />
          </div>
        )}


        {/* Quick Actions */}
        <div className="quick-actions mb-10">
          <h2>⚡ Thao tác nhanh</h2>
          <div className="actions-grid">
            <Link to="/admin/users" className="quick-action from-blue-500 to-blue-600">
              <UsersIcon /> Quản lý người dùng
            </Link>
            <Link to="/admin/exercises" className="quick-action from-green-500 to-green-600">
              <ChartBarIcon /> Quản lý bài tập
            </Link>
            <Link to="/admin/payments" className="quick-action from-purple-500 to-purple-600">
              <CreditCardIcon /> Quản lý thanh toán
            </Link>
            <Link to="/admin/plans" className="quick-action from-orange-500 to-orange-600">
              <DocumentTextIcon /> Quản lý kế hoạch
            </Link>
            <Link to="/admin/vouchers" className="quick-action from-pink-500 to-pink-600">
              <CreditCardIcon /> Quản lý voucher
            </Link>
            {/* Quản lý thực đơn */}
            <Link to="/admin/meals" className="quick-action from-red-500 to-red-600">
              <DocumentTextIcon /> Quản lý thực đơn
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Users */}
            <div className="activity-card">
              <div className="card-header">
                <h3>👤 Người dùng mới</h3>
                <ClockIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {data.recentUsers.map(u => (
                  <div key={u._id} className="list-item">
                    <div className="flex items-center">
                      <div className="avatar bg-blue-500">{u.fullName?.charAt(0) || 'U'}</div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{u.fullName}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="activity-card">
              <div className="card-header">
                <h3>💳 Thanh toán gần đây</h3>
                <CreditCardIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {data.recentPayments.map(p => (
                  <div key={p._id} className="list-item">
                    <div className="flex items-center">
                      <div className="avatar bg-green-500">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{p.user?.fullName}</p>
                        <p className="text-sm text-gray-500">{p.subscriptionPlan?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{p.finalAmount.toLocaleString()} VNĐ</p>
                      <p className="text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}
        {loading && <div className="loader">Đang tải...</div>}
      </div>
    </div>
  );
};

export default Admin;
