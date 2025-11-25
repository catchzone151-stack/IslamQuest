// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { avatarIndexToKey } from "../utils/avatarUtils";

export default function Login() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();
  const loadFromSupabase = useProgressStore((s) => s.loadFromSupabase);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorMsg(error.message || "Login failed.");
      setLoading(false);
      return;
    }

    // Load cloud data (XP, coins, streak, premium, username etc)
    await loadFromSupabase();

    // Pull profile row
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (profile) {
      setDisplayName(profile.username || "Student");
      setHandle(profile.handle || null);
      // Convert avatar index to key if it's a number
      const avatarKey = typeof profile.avatar === "number" 
        ? avatarIndexToKey(profile.avatar) 
        : profile.avatar;
      setAvatar(avatarKey || "avatar_man_lantern");
    }

    // Skip onboarding forever
    setOnboarded(true);

    setLoading(false);
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center px-6 pb-20"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <h1 className="text-2xl font-bold text-[var(--gold)] mb-4">
          Log In
        </h1>

        <input
          className="w-full px-4 py-3 rounded-xl bg-[#0b1e36] text-white mb-3 border border-gray-700"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full px-4 py-3 rounded-xl bg-[#0b1e36] text-white mb-4 border border-gray-700"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && (
          <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
        )}

        <button
          className="w-full py-3 rounded-xl font-bold text-[#0a1a2f]"
          style={{
            background: "linear-gradient(90deg, #FFD700, #FFB700)",
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Loading..." : "Log In"}
        </button>

        <p
          className="mt-6 text-gray-400 text-sm underline cursor-pointer"
          onClick={() => navigate("/onboarding/bismillah")}
        >
          Create new account
        </p>
      </motion.div>
    </div>
  );
}
