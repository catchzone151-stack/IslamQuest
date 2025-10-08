import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import DevErrorBoundary from "./components/DevErrorBoundary";
import "./index.css";

// Global error hooks (show async & runtime errors)
window.addEventListener("error", (e) => {
  console.error("🌋 window.onerror", e.error || e.message || e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("🤯 unhandledrejection", e.reason || e);
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  const msg = "Missing <div id='root'></div> in index.html";
  console.error(msg);
  document.body.innerHTML = `<pre style="padding:16px">${msg}</pre>`;
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <DevErrorBoundary>
        <HashRouter>
          <App />
        </HashRouter>
      </DevErrorBoundary>
    </React.StrictMode>,
  );
}
