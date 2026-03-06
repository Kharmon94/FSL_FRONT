import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { setToken, getCurrentUser } from "@/services/api";
import { canViewAdmin } from "@/types";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Completing sign in…");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Missing token");
      navigate("/admin/login", { replace: true });
      return;
    }
    setToken(token);
    getCurrentUser().then((user) => {
      if (user && canViewAdmin(user)) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/admin/login", { replace: true });
      }
    }).catch(() => {
      setStatus("Invalid token");
      navigate("/admin/login", { replace: true });
    });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-black/70 dark:text-white/70">{status}</p>
    </div>
  );
}
