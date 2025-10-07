import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Logged in successfully!");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    // ✅ Fix: use data.user OR data.session?.user
    const user = data.user ?? data.session?.user;

    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: user.id }]);

      if (profileError) {
        console.error("Profile insert error:", profileError);
        setMessage(
          "Signed up, but error creating profile: " + profileError.message,
        );
        return;
      } else {
        console.log("Profile inserted for user:", user.id);
      }
    }

    setMessage("✅ Sign-up successful!");
  }

  return (
    <div className="screen">
      <h1>Login / Sign Up</h1>
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px" }}
        />

        <button onClick={handleLogin} style={{ marginRight: "10px" }}>
          Login
        </button>
        <button onClick={handleSignup}>Sign Up</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
