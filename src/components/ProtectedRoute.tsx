import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { LoadingDots } from "./Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredResource?: string;
  requiredAccess?: number;
}



const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredResource,
  requiredAccess = 1,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingDots />; // Or a proper loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredResource && !hasAccess(requiredResource, requiredAccess)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
