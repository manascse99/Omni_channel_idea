import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ConversationsPage from '../pages/conversations/ConversationsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import TeamsPage from '../pages/teams/TeamsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotificationsPage from '../pages/notifications/NotificationsPage';

export default function AppRouter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard/:tab?" element={<DashboardPage />} />
          <Route path="/conversations/:tab?" element={<ConversationsPage />} />
          <Route path="/analytics/:tab?" element={<AnalyticsPage />} />
          <Route path="/teams/:tab?" element={<TeamsPage />} />
          <Route path="/settings/:tab?" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
