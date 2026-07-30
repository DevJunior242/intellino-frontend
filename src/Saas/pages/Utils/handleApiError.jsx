export function getApiErrorMessage(err) {
  if (!navigator.onLine) return "Pas de connexion internet";
  if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK")
    return "Erreur réseau, réessayez";
  if (!err.response) return "Serveur inaccessible, vérifiez votre connexion";

  const status = err.response.status;
  if (status === 422) return err.response.data?.message || "Données invalides";
  if (status === 403) return err.response.data?.message || "Action non autorisée";
  if (status === 404) return "Ressource introuvable";
  if (status >= 500) return "Erreur serveur, réessayez plus tard";
  return err.response.data?.message || "Une erreur est survenue";
}
