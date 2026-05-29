import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
}
