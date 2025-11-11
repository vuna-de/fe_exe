import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success(res.message || 'Email khôi phục mật khẩu đã được gửi');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          {/* Success Animation */}
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Email đã được gửi! 📧
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Chúng tôi đã gửi link khôi phục mật khẩu đến
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-center font-medium text-gray-900">{email}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Lưu ý quan trọng:</p>
                <p className="text-sm text-blue-700">
                  Link chỉ có hiệu lực trong 15 phút. Nếu không thấy email, hãy kiểm tra thư mục spam.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Gửi lại email
            </button>
            <Link
              to="/login"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header với icon đẹp */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu? 🔐</h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            Đừng lo lắng! Hãy nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi email...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Gửi link khôi phục
              </div>
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại đăng nhập
            </Link>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
