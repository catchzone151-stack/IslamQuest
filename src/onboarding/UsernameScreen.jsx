// src/onboarding/UsernameScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";

export default function UsernameScreen() {
  const navigate = useNavigate();
  const { setHandle, handle } = useUserStore();
  const [input, setInput] = useState(handle || "");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!input.trim()) {
      setError("Please enter a handle.");
      return;
    }

    setChecking(true);
    setError("");

    // Check if handle already taken
    const { data, error: err } = await supabase
      .from("profiles")
      .select("handle")
      .eq("handle", input.trim().toLowerCase());

    if (err) {
      setError("Something went wrong. Try again.");
      setChecking(false);
      return;
    }

    if (data.length > 0) {
      setError("Handle already taken. Try another.");
      setChecking(false);
      return;
    }

    // Save locally (Supabase bind happens after login)
    setHandle(input.trim().toLowerCase());
    navigate("/onboarding/avatar");
  };

  const goToLogin = () => {
    navigate("/login");
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
          Choose Your Handle
        </h1>

        <p className="text-gray-300 text-sm mb-6">
          This is your unique @username used for friends & challenges.
        </p>

        <input
          className="w-full px-4 py-3 rounded-xl bg-[#0b1e36] text-white mb-3 border border-gray-700"
          placeholder="@yourname"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <button
          className="w-full py-3 rounded-xl font-bold text-[#0a1a2f]"
          style={{
            background: "linear-gradient(90deg, #FFD700, #FFB700)",
          }}
          onClick={handleContinue}
          disabled={checking}
        >
          {checking ? "Checking..." : "Continue"}
        </button>

        {/* LOGIN LINK */}
        <p
          className="mt-6 text-gray-400 text-sm underline cursor-pointer"
          onClick={goToLogin}
        >
          Already have an account? Log in
        </p>
      </motion.div>
    </div>
  );
}
