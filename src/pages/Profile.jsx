import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const session = useSession();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error.message);
      } else {
        setProfile(data);
      }
    }

    loadProfile();
  }, [session]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      window.location.href = "/login"; // redirect to login after logout
    }
  }

  if (!session) {
    return (
      <div className="screen">
        <h1>Profile</h1>
        <p>
          Please <a href="/login">login</a> to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1>Profile</h1>
      {profile ? (
        <>
          <p>
            <b>User ID:</b> {profile.id}
          </p>
          <p>
            <b>Username:</b> {profile.username || "Not set yet"}
          </p>
          <p>
            <b>Created:</b> {new Date(profile.created_at).toLocaleString()}
          </p>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "20px",
              padding: "10px 16px",
              background: "var(--green)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
