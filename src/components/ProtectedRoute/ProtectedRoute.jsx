import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();// obtenemos el usuario autenticado y el estado de carga del contexto de autenticación

  if (loading) return <p>Cargando...</p>; // esperamos saber si hay usuario autenticado antes de redirigir

  if (!user) return <Navigate to="/admin/login" />; // si no hay usuario autenticado, redirigimos al login

  return children; // si hay usuario autenticado, renderizamos los hijos del componente
};