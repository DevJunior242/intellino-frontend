import "./instrument";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";

// Un déploiement pendant qu'un onglet est ouvert change les noms de fichiers
// (hash Vite) : un import dynamique (route en lazy-loading) peut alors
// pointer vers un chunk qui n'existe plus. On recharge une seule fois pour
// récupérer le nouveau build plutôt que de laisser planter la page.
const RELOAD_FLAG = "vite-reload-on-preload-error";
window.addEventListener("vite:preloadError", () => {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, "1");
  window.location.reload();
});

const container = document.getElementById("root");
const root = createRoot(container, {
  // Callback called when an error is thrown and not caught by an ErrorBoundary.
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  // Callback called when React catches an error in an ErrorBoundary.
  onCaughtError: Sentry.reactErrorHandler(),
  // Callback called when React automatically recovers from errors.
  onRecoverableError: Sentry.reactErrorHandler(),
});
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
sessionStorage.removeItem(RELOAD_FLAG);
