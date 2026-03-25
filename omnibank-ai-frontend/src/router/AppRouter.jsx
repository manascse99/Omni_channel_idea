import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ConversationsPage from '../pages/conversations/ConversationsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import TeamsPage from '../pages/teams/TeamsPage';
import SettingsPage from '../pages/settings/SettingsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
