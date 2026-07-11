function ErrorGlobal({ error, setError, callback = null }) {
  if (error && error.response) {
    const { status, data } = error.response;
    // Géré globalement par la bannière de vérification email (voir Axios.jsx) :
    // pas besoin de polluer le formulaire qui a déclenché l'appel avec ce message.
    if (data?.code === "EMAIL_NOT_VERIFIED") {
      return;
    }
    if (status === 422 && data.errors) {
      const arrayErrors = Object.keys(data.errors || {}).reduce((acc, key) => {
        acc[key] = Array.isArray(data.errors[key])
          ? data.errors[key]
          : [data.errors[key]];
        return acc;
      }, {});
      setError(arrayErrors);
      console.warn(arrayErrors);
    } else {
      const message =
        data && data.message
          ? data.message
          : "une erreur inattendue est survenue";
      setError({ general: message });
      console.warn(data);
    }
  } else if (error && error.request) {
    setError({ general: "impossible de se connecter" });
  } else {
    setError({ general: error?.message || "error inattendu" });
  }

  if (callback) {
    callback();
  }
}

export default ErrorGlobal;
