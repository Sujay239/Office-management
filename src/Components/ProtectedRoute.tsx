

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getTokenCookie } from '../lib/auth';

function getToken() {
  return getTokenCookie();
}

function getRoleFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

export default function ProtectedRoute() {
  const location = useLocation();
  const pathname = location.pathname;
  const token = getToken();
  const role = getRoleFromToken();
  if (!token || !role) return <Navigate to="/" replace />;

  // Role-based protection: strict
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') return <Navigate to="/" replace />;
  } else if (pathname.startsWith('/user')) {
    if (role !== 'user') return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
