import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://178.105.189.230";

//const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const Instance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

Instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    const activeId = localStorage.getItem("activeId");
    const activeType = localStorage.getItem("activeType");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.params = {
      ...config.params,
      organisateur_id: activeId,
      organisateur_type: activeType,
    };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

//////////////////////////////////////////////////////////////////////////////////
// 2. INTERCEPTEUR DE RÉPONSE
//////////////////////////////////////////////////////////////////////////////////
// Le backend renvoie ce code sur N'IMPORTE QUELLE route protégée par le middleware
// 'verified'. Le composant qui a déclenché l'appel (créer compétition, déclarer un
// paiement...) n'a aucune raison de savoir gérer ce cas particulier : on l'intercepte
// ici, une seule fois, et on prévient l'app via un event global plutôt que de compter
// sur chaque écran pour reconnaître ce message.
Instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
      window.dispatchEvent(new CustomEvent("email-not-verified"));
    }

    return Promise.reject(error);
  },
);

// Instance.interceptors.response.use(
//   function (response) {
//     // Si la requête réussit, on laisse passer normalement
//     return response;
//   },
//   function (error) {
//     // Si l'API renvoie 401 (Non autorisé) ou 403 (Interdit - Mandat expiré)
//     if (
//       error.response &&
//       (error.response.status === 401 || error.response.status === 403)
//     ) {
//       // 1. On nettoie TOUT le localStorage pour détruire sa fausse session
//       localStorage.clear();

//       // 2. On le redirige de force vers la page de login
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   },
// );
