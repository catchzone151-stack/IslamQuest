import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./lib/supabase";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SessionContextProvider supabaseClient={supabase}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SessionContextProvider>,
);
