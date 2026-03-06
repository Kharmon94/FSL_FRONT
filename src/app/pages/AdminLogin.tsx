import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { getGoogleAuthUrl, signIn } from "@/services/api";
import type { User } from "@/types";

interface AdminLoginProps {
  onSuccess: (user: User) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      if (user.admin) {
        onSuccess(user);
        navigate("/admin");
      } else {
        setError("Admin access required");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur border border-[#CEC3C1]/30"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#CEC3C1] bg-white dark:bg-black text-black dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#CEC3C1] bg-white dark:bg-black text-black dark:text-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#C02130] text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-2 rounded-lg border border-[#CEC3C1] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
