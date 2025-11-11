import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  FireIcon,
  HeartIcon,
  ChartBarIcon,
  StarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BeakerIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../store/authStore';
import toast from 'react-hot-toast';
import { getExercises } from '../../services/exerciseService';
import { getMeals } from '../../services/nutritionService';
import { notificationService, NotificationItem } from '../../services/notificationService';
import { Manager } from 'socket.io-client';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState<{ exercises: any[]; meals: any[] }>({ exercises: [], meals: [] });
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notis, setNotis] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const notiSocketRef = useRef<any>(null);
  
  const isAllowedPremium = (() => {
    const type = (user?.membershipType || '').toLowerCase();
    const map: Record<string, string> = { annual: 'year' };
    const norm = map[type] || type;
    return ['premium','pro','year'].includes(norm);
  })();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Bài tập', href: '/exercises', icon: FireIcon },
    ...(isAllowedPremium ? [{ name: 'Kế hoạch tập', href: '/workouts', icon: HeartIcon }] : []),
    { name: 'Dinh dưỡng', href: '/nutrition', icon: ChartBarIcon },
    ...(isAllowedPremium ? [{ name: 'Gợi ý Thực đơn', href: '/meal-suggestions', icon: BeakerIcon }] : []),
    { name: 'Gói Premium', href: '/pricing', icon: StarIcon },
    ...(isAllowedPremium ? [{ name: 'Cá nhân hóa AI', href: '/personalization', icon: SparklesIcon }] : []),
    ...(isAllowedPremium ? [{ name: 'Danh bạ PT', href: '/pt-directory', icon: UserIcon }] : []),
    ...(isAllowedPremium ? [{ name: 'PT 1-on-1', href: '/pt', icon: UserIcon }] : []),
    ...(user?.role === 'trainer' ? [{ name: 'Dashboard PT', href: '/pt-dashboard', icon: UserGroupIcon }] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin', href: '/admin', icon: ShieldCheckIcon }] : []),
    { name: 'Hồ sơ', href: '/profile', icon: UserIcon },
    { name: 'Cài đặt', href: '/settings', icon: CogIcon },
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await notificationService.list(0, 10);
        setNotis(res.notifications);
        setUnread(res.unread);
      } catch (e) {
        // silent
      }
    })();
    // Connect realtime notifications
    try {
      if (!notiSocketRef.current) {
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
        const manager = new Manager(baseUrl, { transports: ['websocket','polling'], path: '/socket.io', auth: { userId: user?._id } });
        const socket = manager.socket('/notifications');
        notiSocketRef.current = socket;
        socket.on('connect', () => {
          socket.emit('auth', { userId: user?._id });
        });
        socket.on('notification', (noti: any) => {
          setNotis((prev) => [noti, ...prev].slice(0, 20));
          setUnread((u) => u + (noti?.isRead ? 0 : 1));
          try {
            const title = noti?.title || 'Thông báo mới';
            const message = noti?.message || '';
            toast.custom((t) => (
              <div className={`bg-gray-900 text-white px-4 py-3 rounded-lg shadow-strong ${t.visible ? 'animate-fadeInUp' : ''}`}>
                <div className="font-semibold">{title}</div>
                {message && <div className="text-sm opacity-80">{message}</div>}
              </div>
            ), { duration: 3000 });
          } catch {}
        });
      } else {
        notiSocketRef.current.emit('auth', { userId: user?._id });
      }
    } catch {}
    return () => {
      // don't disconnect globally to reuse socket across layouts, but could clean listeners
    };
  }, [user]);

  const handleToggleNoti = async () => {
    setNotiOpen((v) => !v);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotis((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      setUnread((u) => Math.max(u - 1, 0));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotis((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnread(0);
    } catch {}
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) {
      setResults({ exercises: [], meals: [] });
      setSearchOpen(false);
      return;
    }
    setIsSearching(true);
    setSearchOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [exRes, mealRes] = await Promise.all([
          getExercises({ search: term }, 1, 5),
          getMeals({ search: term }, 1, 5),
        ]);
        setResults({ exercises: exRes.exercises || [], meals: mealRes.meals || [] });
      } catch (err) {
        console.error('Global search error:', err);
        setResults({ exercises: [], meals: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/exercises`);
      setSearchOpen(false);
    }
  };
  
  return (
    <div className="layout-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="logo-text">Gymnet</div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${isCurrentPath(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="nav-icon" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <img
              className="user-avatar"
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0ea5e9&color=fff`}
              alt={user?.fullName}
            />
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
              title="Đăng xuất"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-container">
        {/* Top Bar */}
        <div className="topbar">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="search-container" ref={containerRef}>
            <div className="search-icon">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              className="search-input"
              placeholder="Tìm kiếm bài tập, kế hoạch..."
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm && setSearchOpen(true)}
              onKeyDown={handleSearchEnter}
            />
            {searchOpen && (
              <div className="global-search-dropdown">
                {isSearching && <div className="global-search-loading">Đang tìm...</div>}
                {!isSearching && (
                  <>
                    <div className="global-search-section">Bài tập</div>
                    {results.exercises.length === 0 && <div className="global-search-empty">Không có kết quả</div>}
                    {results.exercises.map((ex) => (
                      <div key={ex._id} className="global-search-item" onClick={() => { navigate('/exercises'); setSearchOpen(false); }}>
                        <div className="global-search-title">{ex.name}</div>
                        <div className="global-search-sub">{ex.category}</div>
                      </div>
                    ))}
                    <div className="global-search-section">Món ăn</div>
                    {results.meals.length === 0 && <div className="global-search-empty">Không có kết quả</div>}
                    {results.meals.map((meal) => (
                      <div key={meal._id} className="global-search-item" onClick={() => { navigate('/nutrition'); setSearchOpen(false); }}>
                        <div className="global-search-title">{meal.name}</div>
                        <div className="global-search-sub">{meal.category}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="topbar-actions" >
            {user?.membershipType === 'premium' && (
              <span className="badge-premium">
                <TrophyIcon className="w-4 h-4" />
                Premium
              </span>
            )}
            
            <div className="noti-wrapper" ref={notiRef}>
              <button className="notification-btn" onClick={handleToggleNoti}>
                <BellIcon className="w-6 h-6" />
                {unread > 0 && <span className="noti-dot" />}
              </button>
              {notiOpen && (
                <div className="noti-dropdown">
                  <div className="noti-head">
                    <span>Thông báo</span>
                    {unread > 0 && (
                      <button className="noti-markall" onClick={handleMarkAll}>Đánh dấu đã đọc</button>
                    )}
                  </div>
                  {notis.length === 0 && <div className="noti-empty">Chưa có thông báo</div>}
                  <div className="noti-list">
                    {notis.map((n) => (
                      <div key={n._id} className={`noti-item ${n.isRead ? '' : 'unread'}`} onClick={() => handleMarkRead(n._id)}>
                        <div className="noti-title">{n.title}</div>
                        <div className="noti-msg">{n.message}</div>
                        <div className="noti-time">{new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main className="dashboard">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
