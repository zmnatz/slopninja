import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Only in production: a cache-first worker would otherwise serve stale modules during `vp dev`.
// Not in PR previews either, which update on every push and would be served stale.
if ("serviceWorker" in navigator && import.meta.env.PROD && !import.meta.env.VITE_PREVIEW) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}
