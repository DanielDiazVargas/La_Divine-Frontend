import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente contenedor para proteger rutas privadas.
 * Verifica la existencia de credenciales de sesión para autorizar el renderizado de componentes hijos.
 */
const ProtectedRoute = () => {
  // Se obtiene el token desde localStorage para validar si existe una sesión activa
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;