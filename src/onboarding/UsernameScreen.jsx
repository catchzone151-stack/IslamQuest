import React, { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { useFriendsStore } from "../store/friendsStore";
import { useProgressStore } from "../store/progressStore";
import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

export default function UsernameScreen() {
  const navigate = useNavigate();
  const { id, name, avatar, setUsername, completeOnboarding } = useUserStore();
  const { xp, streak } = useProgressStore();
  const { validateUsername, isUsernameAvailable, getUsernameSuggestions, initializeUser } = useFriendsStore();
  
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isValid, setIsValid] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setValue(input);
    setError("");
    setSuggestions([]);
    
    if (input.length >= 3) {
      const validation = validateUsername(input);
      if (validation.valid) {
        setIsValid(true);
      } else {
        setIsValid(false);
        setError(validation.error);
        
        // Show suggestions if username is taken
        if (!isUsernameAvailable(input)) {
          setSuggestions(getUsernameSuggestions(input));
        }
      }
    } else {
      setIsValid(false);
      if (input.length > 0) {
        setError("Username must be at least 3 characters");
      }
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setValue(suggestion);
    setError("");
    setSuggestions([]);
    setIsValid(true);
  };

  const handleContinue = () => {
    if (!isValid) return;
    
    // Set username in both user store and progress store
    setUsername(value);
    useProgressStore.getState().setUsername?.(value) || 
      useProgressStore.setState({ username: value });
    
    // Initialize user in friends store
    initializeUser({
      id,
      username: value,
      nickname: name,
      avatar,
      xp,
      streak
    });
    
    // Save progress to persist username
    useProgressStore.getState().saveProgress();
    
    // Complete onboarding
    completeOnboarding();
    navigate("/");
  };

  return (
    <div
      className="screen no-extra-space"
      style={{
        background: "linear-gradient(180deg, #0A1A2F 0%, #060D18 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 style={{ color: "#D4AF37", fontSize: "1.4rem", marginBottom: "8px" }}>
          Choose your username
        </h2>
        <p style={{ color: "#bbb", fontSize: "0.9rem", marginBottom: "24px" }}>
          This is how friends will find you
        </p>

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="username"
            maxLength={20}
            style={{
              padding: "14px 44px 14px 16px",
              borderRadius: "12px",
              border: `2px solid ${error ? "#ef4444" : isValid ? "#10b981" : "#D4AF37"}`,
              background: "rgba(14, 22, 37, 0.8)",
              color: "white",
              width: "100%",
              fontSize: "1rem",
              outline: "none",
            }}
          />
          
          {/* Validation icon */}
          <div style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)"
          }}>
            {value.length >= 3 && (
              isValid ? (
                <Check size={20} color="#10b981" />
              ) : (
                <X size={20} color="#ef4444" />
              )
            )}
          </div>
        </div>

        {/* Character count */}
        <p style={{
          marginTop: "8px",
          fontSize: "0.85rem",
          color: "#888",
          textAlign: "right"
        }}>
          {value.length}/20
        </p>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={18} color="#ef4444" />
            <p style={{ color: "#ef4444", fontSize: "0.9rem", margin: 0 }}>
              {error}
            </p>
          </motion.div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "16px" }}
          >
            <p style={{ color: "#bbb", fontSize: "0.9rem", marginBottom: "8px" }}>
              Try one of these:
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: "rgba(212, 175, 55, 0.2)",
                    border: "1px solid #D4AF37",
                    color: "#D4AF37",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Helper text */}
        <p style={{
          marginTop: "16px",
          fontSize: "0.85rem",
          color: "#888",
          lineHeight: "1.4"
        }}>
          3-20 characters • Letters, numbers, and underscores only
        </p>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!isValid}
          style={{
            marginTop: "28px",
            background: isValid ? "#D4AF37" : "#555",
            color: isValid ? "#0A1A2F" : "#999",
            border: "none",
            borderRadius: "12px",
            padding: "14px 36px",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: isValid ? "pointer" : "not-allowed",
            opacity: isValid ? 1 : 0.6,
            transition: "all 0.3s ease"
          }}
        >
          Complete
        </button>
      </motion.div>
    </div>
  );
}
