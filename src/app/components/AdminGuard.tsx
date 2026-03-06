import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { getCurrentUser, signOut } from "@/services/api";
import { canViewAdmin, type User } from "@/types";
import { AdminLogin } from "../pages/AdminLogin";
import { AdminDashboard } from "../pages/AdminDashboard";

export function AdminGuard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleSuccess = (u: User) => {
    setUser(u);
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-black/70 dark:text-white/70">Loading…</p>
      </div>
    );
  }

  if (!user || !canViewAdmin(user)) {
    return <AdminLogin onSuccess={handleSuccess} />;
  }

  return <AdminDashboard user={user} onSignOut={handleSignOut} />;
}
