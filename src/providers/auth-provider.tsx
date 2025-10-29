import React, { useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import type { AuthContextType, User, Permission } from "./auth-types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("permissions", permissions);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Verify token with backend
          const response = await fetch("/api/verify-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            setToken(storedToken);

            // Fetch permissions after successful token verification
            try {
              const permissionsResponse = await fetch("/api/permissions", {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                },
              });
              if (permissionsResponse.ok) {
                const allPermissions = await permissionsResponse.json();
                // Filter permissions based on user's role
                const userPermissions = allPermissions.filter(
                  (p: Permission) => p.role === userData.user.roles
                );
                setPermissions(userPermissions);
              }
            } catch (error) {
              console.error("Failed to fetch permissions:", error);
            }
          } else {
            // Token invalid, remove it
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // Decode token to get user info (assuming JWT structure)
    try {
      const payload = JSON.parse(atob(newToken.split(".")[1]));
      setUser({
        userId: payload.userId,
        username: payload.username,
        roles: payload.roles,
      });

      // Fetch permissions after login
      try {
        const permissionsResponse = await fetch("/api/permissions", {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (permissionsResponse.ok) {
          const allPermissions = await permissionsResponse.json();
          // Filter permissions based on user's role
          const userPermissions = allPermissions.filter(
            (p: Permission) => p.role === payload.roles
          );
          setPermissions(userPermissions);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const hasRole = (role: string) => {
    return user?.roles === role || user?.roles === "admin"; // Admin has all roles
  };

  const hasAccess = (resource: string, requiredAccess: number) => {
    if (!user) return false;
    if (user.roles === "admin") return true; // Admin has all access

    // Permissions are already filtered by role when fetched, so just find the resource
    const resourcePermission = permissions.find((p) => p.resource === resource);
    return resourcePermission
      ? resourcePermission.access >= requiredAccess
      : false;
  };

  const value: AuthContextType = {
    user,
    token,
    permissions,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
    hasRole,
    hasAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
