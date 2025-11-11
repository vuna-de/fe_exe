import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { LoginRequest } from '../../types';
import { useAuth, useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { useEffect, useRef } from 'react';
import Input from '../ui/Input';

const loginSchema = yup.object({
  emailOrPhone: yup
    .string()
    .required('Email hoặc số điện thoại là bắt buộc')
    .test('email-or-phone', 'Email hoặc số điện thoại không hợp lệ', (value) => {
      if (!value) return false;
      const emailRegex = /^\S+@\S+\.\S+$/;
      const phoneRegex = /^[0-9]{10,11}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
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
          // Clear container before re-render to avoid duplicate buttons
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
        console.warn('Không thể tải Google Identity Services. Kiểm tra thẻ script và kết nối mạng.');
      }
    };

    tryInit();
  }, [loginWithGoogle, navigate]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      const anyError: any = error as any;
      const code = anyError?.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email');
      }
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
          Đăng nhập vào tài khoản
        </h2>
        <p className="auth-subtitle">
          Hoặc{' '}
          <Link to="/register" className="auth-link">
            tạo tài khoản mới
          </Link>
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <Input
              label="Email hoặc số điện thoại"
              type="text"
              autoComplete="username"
              placeholder="Nhập email hoặc số điện thoại"
              leftIcon={<EnvelopeIcon />}
              {...register('emailOrPhone')}
            />
          </div>
          
          <div className="form-group">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
          
          <div className="flex items-center justify-between">
            <div className="checkbox-group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="checkbox"
              />
              <label htmlFor="remember-me" className="checkbox-label">
                Ghi nhớ đăng nhập
              </label>
            </div>
            
            <div className="forgot-password">
              <Link to="/forgot-password" className="auth-link">
                Quên mật khẩu?
              </Link>
            </div>
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
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
          
          <div className="divider">
            <span className="divider-text">Hoặc tiếp tục với</span>
          </div>
          
          <div className="social-buttons">
            <div ref={googleBtnRef} className="w-full flex justify-center mb-3"></div>
            
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
