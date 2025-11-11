import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { RegisterRequest } from '../../types';
import { useAuth, useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface RegisterFormData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      console.warn('REACT_APP_GOOGLE_CLIENT_ID chưa được cấu hình.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const tryInit = () => {
      const wnd: any = window as any;
      if (wnd.google && googleBtnRef.current) {
        try {
          googleBtnRef.current.innerHTML = '';
          wnd.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp: any) => {
              if (resp?.credential) {
                try {
                  await loginWithGoogle(resp.credential);
                  navigate('/dashboard');
                } catch {}
              }
            }
          });
          wnd.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: 320 });
        } catch (e) {
          console.warn('Khởi tạo Google Identity thất bại:', e);
        }
        return;
      }

      if (attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryInit, 500);
      } else {
        console.warn('Không thể tải Google Identity Services trên trang đăng ký.');
      }
    };

    tryInit();
  }, [loginWithGoogle, navigate]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Basic validation
      if (!data.fullName || data.fullName.length < 2) {
        alert('Họ tên phải có ít nhất 2 ký tự');
        return;
      }
      
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        alert('Email không hợp lệ');
        return;
      }
      
      if (!data.password || data.password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      
      if (data.password !== data.confirmPassword) {
        alert('Xác nhận mật khẩu không khớp');
        return;
      }
      
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData as RegisterRequest);
      navigate('/verify-email');
    } catch (error) {
      // Error is handled by the store and toast
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h2 className="auth-title">
          Tạo tài khoản mới
        </h2>
        <p className="auth-subtitle">
          Hoặc{' '}
          <Link to="/login" className="auth-link">
            đăng nhập vào tài khoản có sẵn
          </Link>
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <Input
              label="Họ và tên"
              type="text"
              autoComplete="name"
              placeholder="Nhập họ và tên"
              leftIcon={<UserIcon />}
              {...register('fullName')}
            />
          </div>
          
          <div className="form-group">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="Nhập địa chỉ email"
              leftIcon={<EnvelopeIcon />}
              {...register('email')}
            />
          </div>
          
          <div className="form-group">
            <Input
              label="Số điện thoại (tùy chọn)"
              type="tel"
              autoComplete="tel"
              placeholder="Nhập số điện thoại"
              leftIcon={<PhoneIcon />}
              {...register('phone')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Ngày sinh (tùy chọn)
              </label>
              <input
                type="date"
                className="input"
                {...register('dateOfBirth')}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Giới tính (tùy chọn)
              </label>
              <select
                className="input"
                {...register('gender')}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Nhập mật khẩu"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-button"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
              {...register('password')}
            />
          </div>
          
          <div className="form-group">
            <Input
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="input-button"
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              }
              {...register('confirmPassword')}
            />
          </div>
          
          <div className="checkbox-group">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="checkbox"
            />
            <label htmlFor="agree-terms" className="checkbox-label">
              Tôi đồng ý với{' '}
              <Link to="/terms" className="auth-link">
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="auth-link">
                Chính sách bảo mật
              </Link>
            </label>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner mr-2"></span>
                Đang tạo tài khoản...
              </>
            ) : (
              'Tạo tài khoản'
            )}
          </Button>
          
          <div className="divider">
            <span className="divider-text">Hoặc đăng ký bằng</span>
          </div>

          <div className="social-buttons">
            <div ref={googleBtnRef} className="w-full flex justify-center mb-3"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
