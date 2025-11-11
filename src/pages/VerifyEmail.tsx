import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      (async () => {
        try {
          setIsVerifying(true);
          const res = await authService.verifyEmail(token);
          toast.success(res.message || 'Xác thực email thành công!');
          navigate('/login');
        } catch (error: any) {
          const message = error.response?.data?.error || 'Token xác thực không hợp lệ hoặc đã hết hạn';
          toast.error(message);
        } finally {
          setIsVerifying(false);
        }
      })();
    }
  }, [searchParams, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    try {
      setIsResending(true);
      const res = await authService.resendVerification(email);
      toast.success(res.message || 'Đã gửi lại email xác thực');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Gửi lại email xác thực thất bại';
      toast.error(message);
    } finally {
      setIsResending(false);
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

        <h2 className="auth-title">Xác thực email</h2>
        <p className="auth-subtitle">Nếu bạn chưa nhận được email, hãy nhập lại email để nhận liên kết mới.</p>

        <form onSubmit={handleResend}>
          <div className="form-group">
            <Input
              label="Email"
              type="email"
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isResending}>
            {isResending ? 'Đang gửi lại...' : 'Gửi lại email xác thực'}
          </Button>
        </form>

        {isVerifying && (
          <div className="mt-4 text-center text-sm opacity-80">Đang xác thực token...</div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;


