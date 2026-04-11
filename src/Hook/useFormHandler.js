import React, { useState } from 'react'
import ErrorGlobal from '../component/ErrorGlobal';

export const useFormHandler = (initialState) => {
     const [success, setSuccess] = useState("");
      const [error, setError] = useState("");
      const hasError = (field) => !!error?.[field];
      const getError = (field) => error?.[field]?.join(", ");
      const [loading, setLoading] = useState(false);



      const handleRequest = async (requestFn,formData) => {
        setError("");
        setSuccess("");
        setLoading(true);
        //try catch pour gérer les erreurs de validation ou de serveur
        try {
          const res = await requestFn(formData);
          if (res.data.success) {
            setSuccess(res.data.message);
          } else {
            setError(res.data.errors);
          }
        } catch (error) {
          // Gérer les erreurs (ex: afficher les messages d'erreur de validation)
          ErrorGlobal({ error, setError });
        } finally {
          setLoading(false);
        }

      }
}
