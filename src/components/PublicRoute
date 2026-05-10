import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente contenedor para rutas públicas.
 * Si el usuario ya tiene sesión activa, lo redirige al dashboard.
 */
const PublicRoute = () => {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;