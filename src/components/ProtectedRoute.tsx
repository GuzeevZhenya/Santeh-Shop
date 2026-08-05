import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedRoute({
  unauthenticatedElement,
}: {
  unauthenticatedElement?: React.ReactNode;
}) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#2563EB]" />
      </div>
    );
  }
  if (!isAuthenticated) return <>{unauthenticatedElement ?? <Navigate to="/login" replace />}</>;
  return <Outlet />;
}
