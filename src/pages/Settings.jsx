// src/pages/Settings.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";

export default function Settings() {
  const navigate = useNavigate();
  const { resetUserStore } = useUserStore();
  const resetProgress = useProgressStore((s) => s.resetAllProgress);

  const handleLogout = async () => {
    // 1) Log out from Supabase
    await supabase.auth.signOut();

    // 2) Clear Zustand stores
    resetUserStore();
    resetProgress();

    // 3) Clear local storage related to progress
    localStorage.clear();

    // 4) Send user back to LOGIN page
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen px-6 pb-24"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[var(--gold)] mt-8 mb-6"
      >
        Settings
      </motion.h1>

      {/* Your existing settings UI can stay here */}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleLogout}
        className="w-full py-3 rounded-xl font-bold text-[#0a1a2f] mt-10"
        style={{
          background: "linear-gradient(90deg, #FFD700, #FFB700)",
        }}
      >
        Log Out
      </motion.button>
    </div>
  );
}
