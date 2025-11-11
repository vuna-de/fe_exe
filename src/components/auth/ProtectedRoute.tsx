import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'trainer' | 'admin';
  requirePremium?: boolean;
  allowedMemberships?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requirePremium = false,
  allowedMemberships
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role requirements
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 mb-4">
            <svg className="h-6 w-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có quyền truy cập
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  // Membership checks
  const showMembershipBlock = (title: string, description: string) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-warning-100 mb-4">
          <svg className="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-3-12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="space-y-2">
          <button className="btn-primary w-full" onClick={() => (window.location.href = '/pricing')}>
            Nâng cấp gói
          </button>
          <button onClick={() => window.history.back()} className="btn-outline w-full">Quay lại</button>
        </div>
      </div>
    </div>
  );

  if (requirePremium) {
    const isPremium = user.membershipType === 'premium';
    const isPremiumActive = !!user.membershipExpiry && new Date(user.membershipExpiry) > new Date();
    if (!isPremium || !isPremiumActive) {
      return showMembershipBlock(
        'Cần gói Premium',
        'Tính năng này chỉ dành cho thành viên Premium. Nâng cấp để sử dụng.'
      );
    }
  }

  if (allowedMemberships && allowedMemberships.length > 0) {
    const normalized = (user.membershipType || '').toLowerCase();
    const aliases: Record<string, string> = { annual: 'year' };
    const normalizedUser = aliases[normalized] || normalized;
    const allowSet = new Set(allowedMemberships.map(m => (aliases[m] || m).toLowerCase()));
    if (!allowSet.has(normalizedUser)) {
      return showMembershipBlock(
        'Cần gói phù hợp',
        'Trang này chỉ dành cho thành viên thuộc các gói được hỗ trợ.'
      );
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
