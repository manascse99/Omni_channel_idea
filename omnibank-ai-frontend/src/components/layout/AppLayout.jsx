import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header />
        <main className="flex-1 overflow-y-auto h-full scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
