import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import './Landing.css';

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400 mb-4">
      {icon}
    </div>
    <div className="font-semibold mb-1">{title}</div>
    <div className="text-sm text-white/70">{desc}</div>
  </div>
);

const Testimonial = ({ quote, author }: { quote: string; author: string }) => (
  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
    <svg className="w-6 h-6 text-white/30 mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7.17 6A5.17 5.17 0 0 0 2 11.17v6.16C2 18.75 2.75 19.5 3.67 19.5h4.5c.92 0 1.66-.75 1.66-1.67v-4.5c0-.92-.74-1.66-1.66-1.66H5.33A3.33 3.33 0 0 1 8.67 8.33c.92 0 1.66-.75 1.66-1.66C10.33 5.75 9.59 5 8.67 5H7.17ZM17.83 6A5.17 5.17 0 0 0 12.66 11.17v6.16c0 .92.75 1.67 1.67 1.67h4.5c.92 0 1.67-.75 1.67-1.67v-4.5c0-.92-.75-1.66-1.67-1.66h-2.84a3.33 3.33 0 0 1 3.34-3.34c.92 0 1.66-.75 1.66-1.66C20.99 5.75 20.25 5 19.33 5h-1.5Z"/></svg>
    <div className="text-white/90 mb-3">{quote}</div>
    <div className="text-white/50 text-sm">{author}</div>
  </div>
);

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing relative min-h-screen overflow-hidden">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary-600 blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-600 blur-[120px] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
      </div>

      {/* Header */}
      <header className="landing-header max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-lg">Gymnet</span>
        </div>
        <nav className="landing-nav">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-secondary">Vào bảng điều khiển</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Đăng nhập</Link>
              <Link to="/register" className="btn-primary">Đăng ký</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 items-center gap-12">
          <div>
            <span className="badge"> 
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Phiên bản mới: Lập kế hoạch tập AI
            </span>
            <h1 className="hero-title">
              Quản lý tập luyện, dinh dưỡng và tiến độ của bạn — trong một nơi
            </h1>
            <p className="hero-sub">
              Tạo giáo án thông minh, theo dõi buổi tập, tính macro dinh dưỡng, nhận gợi ý cá nhân hóa và kết nối với PT chất lượng.
            </p>
            <div className="hero-cta">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary">
                Bắt đầu miễn phí
              </Link>
              <Link to={isAuthenticated ? '/pricing' : '/login'} className="btn-secondary">
                Xem tính năng
              </Link>
            </div>
            <div className="stats">
              <div>
                <div className="stats-value">+500</div>
                <div className="stats-label">Bài tập</div>
              </div>
              <div>
                <div className="stats-value">+200</div>
                <div className="stats-label">Công thức dinh dưỡng</div>
              </div>
              <div>
                <div className="stats-value">24/7</div>
                <div className="stats-label">Theo dõi tiến độ</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="hero-visual">
              <div className="hero-visual-mesh"></div>
              <div className="visual-grid">
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card wide"></div>
                <div className="card"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features max-w-7xl mx-auto">
        <div className="features-grid">
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18l7-5 7 5V3H3z"/></svg>}
            title="Lưu giáo án"
            desc="Tạo và tái sử dụng template bài tập theo mục tiêu."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            title="Theo dõi tiến độ"
            desc="Ghi chép set, rep, trọng lượng và thời gian nghỉ."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v5h6v-5c0-1.657-1.343-3-3-3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21h14"/></svg>}
            title="Tính macro"
            desc="Ước tính calories, protein, carbs, fat cho từng bữa."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/></svg>}
            title="Cá nhân hóa"
            desc="Kế hoạch luyện tập và dinh dưỡng dựa trên mục tiêu."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials max-w-7xl mx-auto">
        <div className="testimonials-grid">
          <Testimonial quote="Tập trung hơn hẳn từ khi dùng app — mọi thứ có sẵn trong một nơi." author="Anh Quân – 6 tháng sử dụng" />
          <Testimonial quote="Tính macro và lưu thực đơn cực nhanh, không còn phải ghi chú rời rạc." author="Thanh Hà – mục tiêu giảm cân" />
          <Testimonial quote="PT có thể theo dõi tiến độ của học viên theo tuần rất tiện lợi." author="Hữu Tín – PT cá nhân" />
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section max-w-7xl mx-auto">
        <div className="cta">
          <div className="cta-inner">
            <div>
              <div className="cta-title">Sẵn sàng bắt đầu hành trình mới?</div>
              <div className="cta-sub">Tham gia miễn phí, hủy bất kỳ lúc nào.</div>
            </div>
            <div className="cta-actions">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-dark">Bắt đầu ngay</Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn-light">Tôi đã có tài khoản</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer max-w-7xl mx-auto">
        © {new Date().getFullYear()} Gymnet. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;


