import { motion } from "motion/react";
import type { User } from "@/types";

interface AdminDashboardProps {
  user: User;
  onSignOut: () => void;
}

export function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  return (
    <div className="min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-lg border border-[#CEC3C1] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Sign Out
          </button>
        </div>
        <p className="text-black/70 dark:text-white/70">
          Welcome, {user.email}. Admin tools can be added here.
        </p>
      </motion.div>
    </div>
  );
}
