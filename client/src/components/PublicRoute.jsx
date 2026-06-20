import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// The mirror of ProtectedRoute: if the user IS logged in, redirect them to
// the dashboard. If they're not, show the page (login, register, etc.).
function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
