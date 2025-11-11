import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './store/authStore';

// Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/ExercisesNew';
import Workouts from './pages/Workouts';
import Nutrition from './pages/NutritionNew';
import Pricing from './pages/Pricing';
import Personalization from './pages/Personalization';
import PTPage from './pages/PT';
import PTDirectory from './pages/PTDirectory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminExercises from './pages/AdminExercises';
import AdminPayments from './pages/AdminPayments';
import AdminPlans from './pages/AdminPlans';
import AdminVouchers from './pages/AdminVouchers';
import AdminMeals from './pages/AdminMeals';
import MealSuggestions from './pages/MealSuggestions';
import PTDashboard from './pages/PTDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const { initialize } = useAuth();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Exercises />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workouts"
              element={
                <ProtectedRoute allowedMemberships={["premium", "pro", "year"]}>
                  <Layout>
                    <Workouts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Nutrition />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-suggestions"
              element={
                <ProtectedRoute allowedMemberships={["premium", "pro", "year"]}>
                  <Layout>
                    <MealSuggestions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pt-dashboard"
              element={
                <ProtectedRoute requiredRole="trainer">
                  <Layout>
                    <PTDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Pricing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/personalization"
              element={
                <ProtectedRoute allowedMemberships={["premium","pro","year"]}>
                  <Layout>
                    <Personalization />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pt"
              element={
                <ProtectedRoute allowedMemberships={["premium","pro","year"]}>
                  <Layout>
                    <PTPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pt-directory"
              element={
                <ProtectedRoute allowedMemberships={["premium","pro","year"]}>
                  <Layout>
                    <PTDirectory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exercises"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminExercises />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminPayments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/plans"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminPlans />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vouchers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminVouchers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/meals"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminMeals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Landing for guests */}
            <Route
              path="/"
              element={
                <>
                  {/* Nếu đã đăng nhập, ProtectedRoute sẽ điều hướng khi vào dashboard qua các menu khác */}
                  <Landing />
                </>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;