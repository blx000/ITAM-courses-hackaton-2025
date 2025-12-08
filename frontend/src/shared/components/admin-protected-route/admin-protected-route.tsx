import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { AuthService, HackmateApi } from "../../../api";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!AuthService.isAuthenticated()) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const user = await HackmateApi.getCurrentUser();
        setIsAdmin(user.is_admin === true);
      } catch (err) {
        console.error("Failed to check admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        color: "#f9ffee"
      }}>
        Загрузка...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}




